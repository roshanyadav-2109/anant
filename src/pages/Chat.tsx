import { useEffect, useRef, useState } from 'react'
import { TopBar } from '@/components/AppShell'
import { useAuth } from '@/lib/auth'
import { ProvenanceDot } from '@/components/Provenance'
import { Button, cx, IconButton } from '@/components/ui'
import { ArrowRight, Attach, ChevronDown, Dismiss, Mark, Plus, Send, Stop } from '@/icons'
import { conversations as seed, oliverCitations, provenanceLabel, sourceGlyph } from '@/lib/mockData'
import { logoFor } from '@/lib/logos'
import type { ChatMessage, Citation, Conversation, Provenance, SourceKind } from '@/lib/types'

const CANNED: { text: string; citations: Citation[] } = {
  text: "Oliver now leads design. He moved off the backend team last month, so he's running the design work for your team rather than backend development.",
  citations: oliverCitations,
}

export function ChatPage() {
  const [convos, setConvos] = useState<Conversation[]>(seed)
  const [activeId, setActiveId] = useState(seed[0].id)
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [sourceList, setSourceList] = useState<Citation[]>([])
  const [openSrc, setOpenSrc] = useState<Set<number>>(new Set())
  const threadRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const me = user?.name ?? 'You'
  const active = convos.find((c) => c.id === activeId)!

  function askFromSource(c: Citation) {
    setSourcesOpen(false)
    const related = oliverCitations.filter((x) => x.quote !== c.quote).slice(0, 3)
    stream(
      `Tell me more about “${c.quote}”`,
      `${describeSource(c)} Here are the closest related memories.`,
      [c, ...related],
    )
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
  }, [active.messages.length, streaming])

  function patchActive(fn: (c: Conversation) => Conversation) {
    setConvos((cs) => cs.map((c) => (c.id === activeId ? fn(c) : c)))
  }

  /** Append a user turn and stream an Anant reply with its citations. */
  function stream(question: string, answerText: string, citations: Citation[]) {
    if (streaming) return
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', text: question }
    patchActive((c) => ({ ...c, messages: [...c.messages, userMsg] }))

    const answerId = `a_${Date.now()}`
    setStreaming(true)
    patchActive((c) => ({
      ...c,
      messages: [...c.messages, { id: answerId, role: 'anant', text: '', streaming: true }],
    }))

    const words = answerText.split(' ')
    let i = 0
    const timer = setInterval(() => {
      i++
      const partial = words.slice(0, i).join(' ')
      const done = i >= words.length
      patchActive((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === answerId
            ? { ...m, text: partial, streaming: !done, citations: done ? citations : undefined }
            : m,
        ),
      }))
      if (done) {
        clearInterval(timer)
        setStreaming(false)
      }
    }, 55)
  }

  function send() {
    const text = draft.trim()
    if (!text || streaming) return
    setDraft('')
    stream(text, CANNED.text, CANNED.citations)
  }

  function newConversation() {
    const c: Conversation = { id: `c_${Date.now()}`, title: 'New conversation', when: 'now', messages: [] }
    setConvos((cs) => [c, ...cs])
    setActiveId(c.id)
  }

  return (
    <>
      <TopBar title="Chat" intent="Ask anything — every answer shows the memory behind it." />

      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr]">
        {/* Conversation list */}
        <aside className="flex min-h-0 flex-col border-r border-rule bg-paper-sunk/30">
          <div className="p-3">
            <Button variant="outline" size="sm" className="w-full" leading={<Plus size={16} />} onClick={newConversation}>
              New conversation
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {convos.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cx(
                  'focus-ring mb-0.5 block w-full rounded-[var(--radius)] px-3 py-2 text-left transition-colors',
                  c.id === activeId ? 'bg-paper-raised shadow-[inset_0_0_0_1px_var(--color-rule)]' : 'hover:bg-paper-raised/60',
                )}
              >
                <div className={cx('truncate text-[0.875rem]', c.id === activeId ? 'font-[500] text-ink' : 'text-ink-soft')}>
                  {c.title}
                </div>
                <div className="text-[0.6875rem] text-ink-faint">{c.when}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Thread */}
        <section className="relative flex min-h-0 flex-col">
          <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-8 pb-32 pt-6">
            {active.messages.length === 0 ? (
              <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
                <p className="eyebrow mb-3">A blank page that remembers</p>
                <h2
                  className="font-display text-[1.75rem] font-[500] text-ink"
                  style={{ fontVariationSettings: "'SOFT' 3, 'WONK' 1, 'opsz' 90" }}
                >
                  Ask a question, or connect a source
                </h2>
                <p className="mt-2 text-[0.9375rem] text-ink-muted">
                  Every answer is backed by memory you can inspect. Try <span className="text-ink-soft">“What is Oliver working on now?”</span>
                </p>
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

      {/* Sources — a drawer that slides in from the right */}
      {sourcesOpen && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close sources"
            onClick={() => setSourcesOpen(false)}
            className="absolute inset-0 bg-ink/20"
          />
          <aside className="slide-in-right absolute right-0 top-0 bottom-0 z-10 flex w-[400px] max-w-[92vw] flex-col border-l border-rule bg-paper-raised shadow-[var(--shadow-pop)]">
            <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
              <div className="text-[1rem] font-[500] text-ink">Sources for this answer</div>
              <button
                aria-label="Close"
                onClick={() => setSourcesOpen(false)}
                className="focus-ring text-ink-muted transition-colors hover:text-ink"
              >
                <Dismiss size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-2 py-2">
              {sourceList.map((c, i) => {
                const open = openSrc.has(i)
                return (
                  <div key={i}>
                    <button
                      onClick={() => toggleSrc(i)}
                      className={cx(
                        'focus-ring flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-left transition-colors',
                        !open && 'hover:bg-paper-sunk',
                      )}
                    >
                      <span className="flex w-5 shrink-0 justify-center">
                        <SourceLogo kind={c.source.kind} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[0.9rem] text-ink">{c.quote}</span>
                      <ChevronDown
                        size={16}
                        className={cx('shrink-0 text-ink-muted transition-transform', open && 'rotate-180')}
                      />
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
                          <button
                            onClick={() => askFromSource(c)}
                            className="focus-ring inline-flex items-center gap-1.5 rounded-[4px] border border-rule bg-paper-raised px-3 py-1.5 text-[0.8rem] font-[500] text-ink transition-colors hover:border-ink-faint"
                          >
                            Ask a follow-up
                          </button>
                          <button
                            onClick={() => {}}
                            title="Jump to this message in its source"
                            className="focus-ring inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 text-[0.8rem] font-[500] text-[var(--color-royal)] transition-colors hover:underline"
                          >
                            Open original
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </aside>
        </div>
      )}
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
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-ink text-[0.85rem] font-[600] text-white">
          {me.slice(0, 1).toUpperCase()}
        </span>
      ) : (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-royal text-white">
          <Mark size={22} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[0.875rem] font-[600] text-ink">{isUser ? 'You' : 'Anant'}</div>
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
