import { useEffect, useRef, useState } from 'react'
import { ConnectorCard } from '@/components/ConnectorCard'
import { useData } from '@/lib/dataStore'
import { api } from '@/lib/anant'
import { Attach, Connectors as LinkGlyph, Dismiss, Edit, Plus, type IconProps } from '@/icons'
import type { ComponentType } from 'react'

function PathwayTile({
  icon: Icon, label, hint, accent, onClick,
}: {
  icon: ComponentType<IconProps>
  label: string
  hint: string
  accent?: boolean
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className={cxTile(accent)}>
      <span
        className={
          accent
            ? 'flex h-9 w-9 items-center justify-center rounded-[8px] bg-royal text-white'
            : 'flex h-9 w-9 items-center justify-center rounded-[8px] border border-rule bg-veil text-ink'
        }
      >
        <Icon size={19} />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.9rem] font-[500] text-ink">{label}</span>
        <span className="block truncate text-[0.75rem] text-ink-muted">{hint}</span>
      </span>
    </button>
  )
}

function cxTile(accent?: boolean) {
  return [
    'focus-ring group flex items-center gap-3 rounded-[var(--radius-lg)] border p-3.5 text-left transition-all duration-150',
    accent
      ? 'border-[color-mix(in_srgb,var(--color-royal)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-royal)_6%,var(--color-paper-raised))] hover:shadow-[var(--shadow-card)]'
      : 'border-rule bg-paper-raised hover:border-ink-faint/50 hover:shadow-[var(--shadow-card)]',
  ].join(' ')
}

export function ConnectorsPage() {
  const { connectors, refresh } = useData()

  const [modal, setModal] = useState<null | 'text' | 'link'>(null)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const availRef = useRef<HTMLDivElement>(null)

  // Slack — the one real connector on the engine.
  const [slackConnected, setSlackConnected] = useState(() => localStorage.getItem('anant.slack') === 'connected')
  const [slackModal, setSlackModal] = useState(false)
  const [botToken, setBotToken] = useState('')
  const [slackWs, setSlackWs] = useState('')

  useEffect(() => {
    api
      .slackStatus()
      .then((s) => {
        if (s.status && s.status !== 'never_synced' && !/error|not_connected/i.test(s.status)) {
          setSlackConnected(true)
          localStorage.setItem('anant.slack', 'connected')
        }
      })
      .catch(() => {})
  }, [])

  // Reflect Slack's real state onto the catalogue.
  const list = connectors.map((c) => (c.id === 'slack' && slackConnected ? { ...c, status: 'connected' as const } : c))
  const connected = list.filter((c) => c.status === 'connected' || c.status === 'syncing')
  const available = list.filter((c) => c.status === 'available' || c.status === 'error')

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }

  async function connectSlack() {
    if (!botToken.trim() || !slackWs.trim()) return
    setBusy(true)
    try {
      await api.slackConnect(botToken.trim(), slackWs.trim())
      await api.slackSync().catch(() => {})
      setSlackConnected(true)
      localStorage.setItem('anant.slack', 'connected')
      setSlackModal(false)
      setBotToken('')
      setSlackWs('')
      flash('Slack connected — importing your messages')
      await refresh()
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Could not connect Slack')
    } finally {
      setBusy(false)
    }
  }

  async function disconnectSlack() {
    await api.slackDelete().catch(() => {})
    setSlackConnected(false)
    localStorage.removeItem('anant.slack')
    flash('Slack disconnected')
  }

  function handleConnect(id: string) {
    if (id === 'slack') setSlackModal(true)
    else flash('No live integration yet — Slack is the only connector wired to the engine so far.')
  }

  async function save(kind: 'text' | 'link') {
    const v = value.trim()
    if (!v) return
    setBusy(true)
    // The engine builds memory from chat — hand it the text/link to remember.
    const prompt = kind === 'link' ? `Please remember this link: ${v}` : `Please remember this: ${v}`
    await api.chat(prompt).catch(() => {})
    await refresh()
    setBusy(false)
    setModal(null)
    setValue('')
    flash('Sent to Anant — it will remember this')
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    // No file-ingestion endpoint on the engine yet — be honest rather than fake it.
    flash(`“${file.name}” selected — file import isn’t available yet`)
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* Add to memory — four pathways (the entry point) */}
        <section className="mb-10">
          <h2 className="mb-3 text-[0.95rem] font-[500] text-ink">Add to your memory</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <PathwayTile icon={Edit} label="Paste text" hint="Notes, a snippet" onClick={() => setModal('text')} />
            <PathwayTile icon={LinkGlyph} label="Add a link" hint="Article or page" onClick={() => setModal('link')} />
            <PathwayTile icon={Attach} label="Upload a file" hint="PDF, doc, transcript" onClick={() => fileRef.current?.click()} />
            <PathwayTile
              icon={Plus}
              label="Connect an app"
              hint="Slack, Gmail, Drive…"
              accent
              onClick={() => availRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,application/pdf"
            className="hidden"
            onChange={onFile}
          />
        </section>

        {connected.length > 0 && (
          <section className="mb-9">
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-[0.95rem] font-[500] text-ink">Connected</h2>
              <span className="tnum text-[0.8125rem] text-ink-faint">{connected.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {connected.map((c) => (
                <ConnectorCard
                  key={c.id}
                  connector={c}
                  onConnect={() => handleConnect(c.id)}
                  onDisconnect={c.id === 'slack' ? disconnectSlack : undefined}
                />
              ))}
            </div>
          </section>
        )}

        <section ref={availRef} className="pb-16">
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-[0.95rem] font-[500] text-ink">Available</h2>
            <span className="tnum text-[0.8125rem] text-ink-faint">{available.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((c) => (
              <ConnectorCard key={c.id} connector={c} onConnect={() => handleConnect(c.id)} />
            ))}
          </div>
        </section>
      </div>

      {/* Paste text / Add a link modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="rise relative w-full max-w-lg rounded-[var(--radius-lg)] bg-paper-raised p-6 shadow-[var(--shadow-pop)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[1.05rem] text-ink">{modal === 'link' ? 'Add a link' : 'Paste text'}</h3>
              <button onClick={() => setModal(null)} aria-label="Close" className="text-ink-faint hover:text-ink">
                <Dismiss size={18} />
              </button>
            </div>
            {modal === 'link' ? (
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://…"
                className="focus-ring w-full rounded-[var(--radius)] bg-paper-raised px-3 py-2.5 text-[0.9375rem] text-ink ring-1 ring-rule placeholder:text-ink-faint"
              />
            ) : (
              <textarea
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Paste a note, a snippet, anything worth remembering…"
                rows={5}
                className="focus-ring w-full resize-none rounded-[var(--radius)] bg-paper-raised px-3 py-2.5 text-[0.9375rem] leading-relaxed text-ink ring-1 ring-rule placeholder:text-ink-faint"
              />
            )}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setModal(null)} className="rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-ink-soft hover:text-ink">
                Cancel
              </button>
              <button
                onClick={() => save(modal)}
                disabled={busy || !value.trim()}
                className="rounded-[var(--radius)] bg-royal px-3.5 py-2 text-[0.875rem] font-[500] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {busy ? 'Saving…' : 'Add to memory'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slack — real connect (bot token + workspace id) */}
      {slackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setSlackModal(false)} />
          <div className="rise relative w-full max-w-lg rounded-[var(--radius-lg)] bg-paper-raised p-6 shadow-[var(--shadow-pop)]">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[1.05rem] text-ink">Connect Slack</h3>
              <button onClick={() => setSlackModal(false)} aria-label="Close" className="text-ink-faint hover:text-ink">
                <Dismiss size={18} />
              </button>
            </div>
            <p className="mb-4 text-[0.8125rem] leading-relaxed text-ink-muted">
              Paste a Slack <span className="font-[500] text-ink">bot token</span> (starts with <code>xoxb-</code>) and
              your <span className="font-[500] text-ink">workspace ID</span>. Anant reads the channels the bot is in —
              nothing is sent back out.
            </p>
            <div className="flex flex-col gap-2.5">
              <input
                autoFocus
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="xoxb-…"
                className="focus-ring w-full rounded-[var(--radius)] bg-paper-raised px-3 py-2.5 text-[0.9375rem] text-ink ring-1 ring-rule placeholder:text-ink-faint"
              />
              <input
                value={slackWs}
                onChange={(e) => setSlackWs(e.target.value)}
                placeholder="Workspace ID (e.g. T01234ABC)"
                className="focus-ring w-full rounded-[var(--radius)] bg-paper-raised px-3 py-2.5 text-[0.9375rem] text-ink ring-1 ring-rule placeholder:text-ink-faint"
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setSlackModal(false)} className="rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-ink-soft hover:text-ink">
                Cancel
              </button>
              <button
                onClick={connectSlack}
                disabled={busy || !botToken.trim() || !slackWs.trim()}
                className="rounded-[var(--radius)] bg-royal px-3.5 py-2 text-[0.875rem] font-[500] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {busy ? 'Connecting…' : 'Connect Slack'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[0.8125rem] font-[500] text-white shadow-[var(--shadow-pop)]">
          {toast}
        </div>
      )}
    </div>
  )
}
