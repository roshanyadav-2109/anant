import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { ProvenanceDot } from '@/components/Provenance'
import { Button, cx, IconButton } from '@/components/ui'
import { ArrowRight, Attach, ChevronDown, Dismiss, Mark, Plus, Search, Send, Stop } from '@/icons'
import { provenanceLabel, sourceGlyph } from '@/lib/mockData'
import { useData } from '@/lib/dataStore'
import { api, chatStream } from '@/lib/anant'
import { randomGreeting } from '@/lib/greetings'

/**
 * Suggestions drawn from what Anant already knows — the people and topics in
 * memory. Empty when there's no history yet, so a fresh account just sees the
 * greeting.
 */
function suggestionsFromHistory(memories: Memory[]): string[] {
  const templates = [
    (s: string) => `What is ${s} working on now?`,
    (s: string) => `Catch me up on ${s}.`,
    (s: string) => `What do I know about ${s}?`,
    (s: string) => `Any recent updates on ${s}?`,
  ]
  const subjects = Array.from(new Set(memories.map((m) => m.subject).filter(Boolean))) as string[]
  return subjects.slice(0, 3).map((s, i) => templates[i % templates.length](s))
}
import { logoFor } from '@/lib/logos'
import { bucketFor, relativeShort } from '@/lib/time'
import type { ChatMessage, Citation, Conversation, Memory, Provenance, SourceKind } from '@/lib/types'

const isEngineId = (id: string) => !!id && !id.startsWith('local_')

export function ChatPage() {
  const location = useLocation()
  const focusId = (location.state as { focusId?: string } | null)?.focusId
  const { conversations: seedConvos, memories, loading, refresh } = useData()
  const [greeting] = useState(randomGreeting)
  const suggestions = useMemo(() => suggestionsFromHistory(memories), [memories])
  const [convos, setConvos] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [sourceList, setSourceList] = useState<Citation[]>([])
  const [openSrc, setOpenSrc] = useState<Set<number>>(new Set())
  const [convQuery, setConvQuery] = useState('')
  const threadRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const me = user?.name ?? 'You'

  // Load conversations from the database, then pick the active one.
  useEffect(() => {
    setConvos(seedConvos)
  }, [seedConvos])
  useEffect(() => {
    if (loading) return
    // Empty history → start a fresh (unsaved) conversation so the composer shows.
    if (convos.length === 0) {
      setConvos([{ id: `local_${Date.now()}`, title: 'New conversation', at: Date.now(), messages: [] }])
      return
    }
    setActiveId((cur) => {
      if (cur && convos.some((c) => c.id === cur)) return cur
      return (focusId && convos.some((c) => c.id === focusId) ? focusId : convos[0].id) ?? ''
    })
  }, [convos, focusId, loading])

  const active = convos.find((c) => c.id === activeId)

  // Conversation history, filtered by search and grouped by recency (newest first).
  const convGroups: { label: string; items: Conversation[] }[] = []
  convos
    .filter((c) => c.title.toLowerCase().includes(convQuery.trim().toLowerCase()))
    .slice()
    .sort((a, b) => b.at - a.at)
    .forEach((c) => {
      const label = bucketFor(c.at)
      const g =
        convGroups.find((x) => x.label === label) ??
        (convGroups.push({ label, items: [] }), convGroups[convGroups.length - 1])
      g.items.push(c)
    })

  function askFromSource(c: Citation) {
    setSourcesOpen(false)
    void sendMessage(`Tell me more about “${c.quote}”`)
  }

  function openSources(list: Citation[]) {
    setSourceList(list)
    setOpenSrc(new Set())
    setSourcesOpen(true)
  }

  function toggleSrc(i: number) {
    setOpenSrc((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [active?.messages.length, streaming])

  function patchConv(id: string, fn: (c: Conversation) => Conversation) {
    setConvos((cs) => cs.map((c) => (c.id === id ? fn(c) : c)))
  }

  // Load an existing conversation's messages from the engine on first open.
  useEffect(() => {
    const c = convos.find((x) => x.id === activeId)
    if (!c || !isEngineId(activeId) || c.messages.length > 0) return
    let cancelled = false
    api
      .getMessages(activeId)
      .then((res) => {
        if (cancelled) return
        patchConv(activeId, (cv) => ({
          ...cv,
          messages: res.messages.map((m) => ({
            id: m.id,
            role: m.role === 'assistant' ? 'anant' : 'user',
            text: m.content,
            at: m.created_at ?? '',
          })),
        }))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  /** Send a message to the engine and stream the reply into the active thread. */
  async function sendMessage(text: string) {
    if (!text || streaming) return
    const convId = activeId
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', text, at: 'Just now' }
    patchConv(convId, (c) => ({ ...c, messages: [...c.messages, userMsg] }))

    const answerId = `a_${Date.now()}`
    setStreaming(true)
    patchConv(convId, (c) => ({
      ...c,
      messages: [...c.messages, { id: answerId, role: 'anant', text: '', streaming: true, at: 'Just now' }],
    }))

    let acc = ''
    await chatStream(
      text,
      isEngineId(convId) ? convId : undefined,
      {
        onToken: (chunk) => {
          acc += chunk
          patchConv(convId, (c) => ({
            ...c,
            messages: c.messages.map((m) => (m.id === answerId ? { ...m, text: acc, streaming: true } : m)),
          }))
        },
        onDone: (fin) => {
          patchConv(convId, (c) => ({
            ...c,
            messages: c.messages.map((m) => (m.id === answerId ? { ...m, text: fin.response || acc, streaming: false } : m)),
          }))
          setStreaming(false)
          // Adopt the engine's conversation id for a brand-new local thread.
          if (!isEngineId(convId) && fin.conversation_id) {
            const title = text.length > 40 ? text.slice(0, 40) + '…' : text
            patchConv(convId, (c) => ({ ...c, id: fin.conversation_id, title }))
            setActiveId(fin.conversation_id)
            void refresh()
          }
        },
        onError: () => {
          patchConv(convId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === answerId
                ? { ...m, text: acc || 'Sorry — I couldn’t reach the engine. Check that it’s running.', streaming: false }
                : m,
            ),
          }))
          setStreaming(false)
        },
      },
    )
  }

  function send() {
    const text = draft.trim()
    if (!text || streaming) return
    setDraft('')
    void sendMessage(text)
  }

  function newConversation() {
    const c: Conversation = { id: `local_${Date.now()}`, title: 'New conversation', at: Date.now(), messages: [] }
    setConvos((cs) => [c, ...cs])
    setActiveId(c.id)
  }

  if (!active)
    return <div className="flex-1 px-8 py-6 text-[0.9375rem] text-ink-faint">Loading…</div>

  return (
    <>
      <div className="flex min-h-0 flex-1">
        {/* Conversation history */}
        <aside className="flex min-h-0 w-[240px] shrink-0 flex-col border-r border-rule bg-paper-sunk/30">
          <div className="space-y-2.5 p-3">
            <Button variant="primary" size="sm" className="w-full justify-center" leading={<Plus size={16} />} onClick={newConversation}>
              New conversation
            </Button>
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                value={convQuery}
                onChange={(e) => setConvQuery(e.target.value)}
                placeholder="Search conversations"
                className="focus-ring w-full rounded-[4px] border border-rule bg-paper-raised py-1.5 pl-8 pr-2.5 text-[0.8125rem] text-ink placeholder:text-ink-faint"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {convGroups.map((g) => (
              <div key={g.label} className="mb-1.5">
                {g.label !== 'Today' && (
                  <div className="px-2.5 pb-1 pt-2.5 text-[0.72rem] font-[500] text-ink-faint">{g.label}</div>
                )}
                {g.items.map((c) => {
                  const isActive = c.id === activeId
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={cx(
                        'group/conv focus-ring relative mb-0.5 flex w-full items-baseline gap-2 rounded-[4px] px-3 py-2 text-left transition-colors',
                        isActive ? 'bg-paper-raised shadow-[0_1px_2px_rgba(11,11,13,0.04)]' : 'hover:bg-paper-raised/70',
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-[2.5px] -translate-y-1/2 rounded-r-full bg-[var(--color-royal)]" />
                      )}
                      <span className={cx('flex-1 truncate text-[0.875rem] text-ink', isActive ? 'font-[500]' : 'font-[500]')}>
                        {c.title}
                      </span>
                      <span className="shrink-0 text-[0.6875rem] text-ink-faint">{relativeShort(c.at)}</span>
                    </button>
                  )
                })}
              </div>
            ))}
            {convGroups.length === 0 && (
              <p className="px-3 py-8 text-center text-[0.8125rem] text-ink-faint">No conversations found.</p>
            )}
          </div>
        </aside>

        {/* Sources — a panel that reflows the thread, sliding in from the right */}
        {sourcesOpen && (
          <aside className="order-last slide-in-right flex min-h-0 w-[360px] shrink-0 flex-col border-l border-rule bg-paper-raised">
            <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
              <div className="text-[1rem] font-[500] text-ink">Sources for this answer</div>
              <button aria-label="Close" onClick={() => setSourcesOpen(false)} className="focus-ring text-ink-muted transition-colors hover:text-ink">
                <Dismiss size={18} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
              {sourceList.map((c, i) => {
                const open = openSrc.has(i)
                return (
                  <div key={i}>
                    <button
                      onClick={() => toggleSrc(i)}
                      className={cx('focus-ring flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-left transition-colors', !open && 'hover:bg-paper-sunk')}
                    >
                      <span className="flex w-5 shrink-0 justify-center"><SourceLogo kind={c.source.kind} /></span>
                      <span className="min-w-0 flex-1 truncate text-[0.9rem] text-ink">{c.quote}</span>
                      <ChevronDown size={16} className={cx('shrink-0 text-ink-muted transition-transform', open && 'rotate-180')} />
                    </button>
                    {open && (
                      <div className="fade space-y-3 px-3 pb-4 pl-10">
                        <ProvenanceTag p={c.provenance} />
                        <p className="text-[0.85rem] leading-relaxed text-ink">{describeSource(c)}</p>
                        <dl className="space-y-1.5 text-[0.8125rem]">
                          {c.date && <DetailRow label="When" value={c.date} />}
                          {c.conversation && <DetailRow label="Conversation" value={c.conversation} />}
                          {c.source.speaker && <DetailRow label="Said by" value={c.source.speaker} />}
                        </dl>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          <button onClick={() => askFromSource(c)} className="focus-ring inline-flex items-center gap-1.5 rounded-[4px] border border-rule bg-paper-raised px-3 py-1.5 text-[0.8rem] font-[500] text-ink transition-colors hover:border-ink-faint">
                            Ask a follow-up
                          </button>
                          <button onClick={() => {}} title="Jump to this message in its source" className="focus-ring inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 text-[0.8rem] font-[500] text-[var(--color-royal)] transition-colors hover:underline">
                            Open original <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </aside>
        )}

        {/* Thread */}
        <section className="relative flex min-h-0 flex-1 flex-col">
          <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-8 pb-32 pt-6">
            {active.messages.length === 0 ? (
              <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
                <h2 className="text-[1.5rem] tracking-[-0.02em] text-ink">{greeting}</h2>
                {suggestions.length > 0 && (
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setDraft(s)}
                        className="focus-ring rounded-full bg-paper-raised px-3.5 py-1.5 text-[0.8125rem] text-ink-soft ring-1 ring-rule transition-colors hover:text-ink"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-6">
                <div className="eyebrow text-center">Conversation</div>
                {active.messages.map((m) => (
                  <Message key={m.id} message={m} me={me} onSeeSources={openSources} />
                ))}
              </div>
            )}
          </div>

          {/* Composer — floating over the thread */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-8 pb-5">
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-paper via-paper/80 to-transparent"
            />
            <div className="pointer-events-auto mx-auto max-w-2xl">
              <div className="flex items-end gap-2 rounded-[var(--radius-lg)] border border-rule bg-paper-raised px-3 py-2 shadow-[var(--shadow-pop)] focus-within:border-ink-faint">
                <IconButton label="Attach">
                  <Attach size={18} />
                </IconButton>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  rows={1}
                  placeholder="Message Anant…  /  ask about one source"
                  className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[0.9375rem] text-ink outline-none placeholder:text-ink-faint"
                />
                {streaming ? (
                  <IconButton label="Stop" onClick={() => setStreaming(false)} className="text-evergreen">
                    <Stop size={18} />
                  </IconButton>
                ) : (
                  <button
                    onClick={send}
                    disabled={!draft.trim()}
                    aria-label="Send"
                    className="focus-ring flex h-9 w-9 items-center justify-center rounded-[var(--radius)] bg-evergreen text-veil transition-opacity disabled:opacity-30"
                  >
                    <Send size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

function SourceLogo({ kind }: { kind: SourceKind }) {
  const logo = logoFor(kind)
  if (logo) return <img src={logo} alt="" className="h-4 w-4 object-contain" />
  const Glyph = sourceGlyph[kind]
  return <Glyph size={15} className="text-ink-muted" />
}

/** A plain-language explanation of how a source came to be known. */
function describeSource(c: Citation): string {
  if (c.provenance === 'stated') {
    return `This was stated directly${c.source.speaker ? ` by ${c.source.speaker}` : ''}. Anant recorded it word-for-word, so it carries the highest trust.`
  }
  if (c.provenance === 'inferred') {
    return `Anant worked this out on its own — it wasn't said outright${c.context ? `, ${c.context.toLowerCase()}` : ''}. Treat it as Anant's reasoning, not a stated fact.`
  }
  return `Anant noticed this as a pattern across many items rather than a single message${c.context ? ` (${c.context.toLowerCase()})` : ''}. It summarises a trend, not one quote.`
}

const provVar: Record<Provenance, string> = {
  stated: '--color-stated',
  inferred: '--color-inferred',
  aggregated: '--color-aggregated',
}

/** Provenance shown as a small coloured dot + label — no capsule. */
function ProvenanceTag({ p }: { p: Provenance }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[0.72rem] font-[500] uppercase tracking-[0.08em]"
      style={{ color: `var(${provVar[p]})` }}
    >
      <ProvenanceDot provenance={p} />
      {provenanceLabel[p]}
    </span>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-ink-muted">{label}</dt>
      <dd className="flex-1 font-[500] text-ink">{value}</dd>
    </div>
  )
}

function Message({
  message,
  me,
  onSeeSources,
}: {
  message: ChatMessage
  me: string // current user's name (own turns are labelled "You")
  onSeeSources: (list: Citation[]) => void
}) {
  const isUser = message.role === 'user'
  return (
    <div className="flex gap-3">
      {isUser ? (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-ink text-[0.85rem] font-[500] text-white">
          {me.slice(0, 1).toUpperCase()}
        </span>
      ) : (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-white text-ink ring-1 ring-rule">
          <Mark size={30} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[0.875rem] font-[500] text-ink">{isUser ? 'You' : 'Anant'}</span>
          {!isUser && (
            <span className="rounded-[3px] bg-royal px-1.5 py-[1px] text-[0.6rem] font-[500] uppercase tracking-[0.08em] text-white">
              Agent
            </span>
          )}
          {message.at && <span className="text-[0.72rem] text-ink-muted">{message.at}</span>}
        </div>
        <p
          className={cx('text-[1.0625rem] leading-relaxed text-ink', message.streaming && 'stream-caret')}
        >
          {message.text}
        </p>
        {message.citations && !message.streaming && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {message.citations.slice(0, 3).map((c, i) => (
              <button
                key={i}
                onClick={() => onSeeSources(message.citations!)}
                title={c.source.label}
                aria-label={`Source: ${c.source.label}`}
                className="focus-ring flex h-7 w-7 items-center justify-center rounded-full border border-rule bg-veil transition-colors hover:border-ink-faint"
              >
                <SourceLogo kind={c.source.kind} />
              </button>
            ))}
            <button
              onClick={() => onSeeSources(message.citations!)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper-sunk px-2.5 py-1 text-[0.75rem] font-[500] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
            >
              {message.citations.length > 3
                ? `+${message.citations.length - 3} more sources`
                : 'View sources in detail'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
