import { useEffect, useRef, useState } from 'react'
import { TopBar } from '@/components/AppShell'
import { ProvenanceBadge, SourceChip } from '@/components/Provenance'
import { Button, cx, IconButton } from '@/components/ui'
import { Attach, ChevronRight, Plus, Regenerate, Send, Stop } from '@/icons'
import { conversations as seed } from '@/lib/mockData'
import type { ChatMessage, Citation, Conversation } from '@/lib/types'

const CANNED: { text: string; citations: Citation[] } = {
  text: "Oliver now leads design. He moved off the backend team last month, so he's running the design work for your team rather than backend development.",
  citations: [
    {
      memoryId: 'm_oliver_design',
      provenance: 'stated',
      quote: 'Oliver now leads design.',
      source: { kind: 'slack', label: 'Slack · #engineering' },
    },
    {
      memoryId: 'm_oliver_design',
      provenance: 'stated',
      quote: 'Moved off backend last month.',
      source: { kind: 'chat', label: 'you', when: '6 days ago' },
    },
  ],
}

export function ChatPage() {
  const [convos, setConvos] = useState<Conversation[]>(seed)
  const [activeId, setActiveId] = useState(seed[0].id)
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)
  const active = convos.find((c) => c.id === activeId)!

  const lastAnswer = [...active.messages].reverse().find((m) => m.role === 'anant')
  const citations = lastAnswer?.citations ?? []

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [active.messages.length, streaming])

  function patchActive(fn: (c: Conversation) => Conversation) {
    setConvos((cs) => cs.map((c) => (c.id === activeId ? fn(c) : c)))
  }

  function send() {
    const text = draft.trim()
    if (!text || streaming) return
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', text }
    patchActive((c) => ({ ...c, messages: [...c.messages, userMsg] }))
    setDraft('')

    // Simulated token-by-token streaming.
    const answerId = `a_${Date.now()}`
    const answer = CANNED.text
    setStreaming(true)
    patchActive((c) => ({
      ...c,
      messages: [...c.messages, { id: answerId, role: 'anant', text: '', streaming: true }],
    }))

    const words = answer.split(' ')
    let i = 0
    const timer = setInterval(() => {
      i++
      const partial = words.slice(0, i).join(' ')
      const done = i >= words.length
      patchActive((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === answerId
            ? { ...m, text: partial, streaming: !done, citations: done ? CANNED.citations : undefined }
            : m,
        ),
      }))
      if (done) {
        clearInterval(timer)
        setStreaming(false)
      }
    }, 55)
  }

  function newConversation() {
    const c: Conversation = { id: `c_${Date.now()}`, title: 'New conversation', when: 'now', messages: [] }
    setConvos((cs) => [c, ...cs])
    setActiveId(c.id)
  }

  return (
    <>
      <TopBar title="Chat" intent="Ask anything — every answer shows the memory behind it." />

      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_320px]">
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
        <section className="flex min-h-0 flex-col">
          <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
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
                  <Message key={m.id} message={m} />
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-rule bg-paper/70 px-8 py-4 backdrop-blur">
            <div className="mx-auto max-w-2xl">
              <div className="flex items-end gap-2 rounded-[var(--radius-lg)] border border-rule bg-paper-raised px-3 py-2 focus-within:border-ink-faint">
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
              <p className="mt-2 text-center text-[0.6875rem] text-ink-faint">
                Answers stay on your machine. Ask about one source, e.g. “from Slack”.
              </p>
            </div>
          </div>
        </section>

        {/* Sources panel */}
        <aside className="flex min-h-0 flex-col border-l border-rule bg-paper-sunk/30">
          <div className="border-b border-rule px-4 py-3">
            <div className="text-[0.8125rem] font-[500] text-ink">Sources for this answer</div>
            <div className="text-[0.6875rem] text-ink-muted">Which memories were used, and why to trust them.</div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {citations.length === 0 ? (
              <p className="px-2 py-8 text-center text-[0.8125rem] text-ink-faint">
                Ask a question — the memories behind the answer appear here with full provenance.
              </p>
            ) : (
              <div className="space-y-3">
                {citations.map((c, i) => (
                  <div key={i} className="rounded-[var(--radius)] border border-rule bg-paper-raised p-3.5">
                    <ProvenanceBadge provenance={c.provenance} />
                    <p
                      className="mt-2.5 font-display text-[0.9375rem] leading-snug text-ink"
                      style={{ fontVariationSettings: "'opsz' 32" }}
                    >
                      {c.quote}
                    </p>
                    <div className="mt-2.5">
                      <SourceChip source={c.source} onClick={() => {}} />
                    </div>
                  </div>
                ))}
                <button className="flex w-full items-center justify-center gap-1 rounded-[var(--radius)] border border-dashed border-rule py-2 text-[0.8125rem] text-ink-muted hover:border-ink-faint hover:text-ink">
                  Related memory <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}

function Message({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-[var(--radius-lg)] rounded-br-sm border border-rule bg-paper-raised px-4 py-2.5 text-[0.9375rem] text-ink">
          {message.text}
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-evergreen text-[0.75rem] font-[500] text-veil">
        a
      </span>
      <div className="min-w-0">
        <p
          className={cx(
            'font-display text-[1.0625rem] leading-relaxed text-ink',
            message.streaming && 'stream-caret',
          )}
          style={{ fontVariationSettings: "'SOFT' 2, 'opsz' 40" }}
        >
          {message.text}
        </p>
        {message.citations && (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="eyebrow !text-[0.625rem]">Based on</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((c, i) => (
                <SourceChip key={i} source={c.source} onClick={() => {}} />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1">
              <Button variant="quiet" size="sm" leading={<Regenerate size={15} />}>
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
