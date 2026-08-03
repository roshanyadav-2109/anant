import { useEffect, useRef, useState } from 'react'
import { ConnectorCard } from '@/components/ConnectorCard'
import { useData } from '@/lib/dataStore'
import { api, ApiError, type ConnectorRun } from '@/lib/anant'
import { liveConnectors, type ConnectorService } from '@/lib/catalog'
import { Attach, Connectors as LinkGlyph, Dismiss, Edit, Plus, type IconProps } from '@/icons'
import type { ComponentType } from 'react'
import type { Connector, ConnectorStatus } from '@/lib/types'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Something went wrong. Please try again.')
function relTime(iso?: string): string {
  if (!iso) return ''
  const t = Date.parse(iso)
  if (!t) return ''
  const m = Math.floor((Date.now() - t) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
}

const statusFns: Record<ConnectorService, () => Promise<ConnectorRun>> = {
  slack: () => api.slackStatus(),
  github: () => api.githubStatus(),
  notion: () => api.notionStatus(),
  linear: () => api.linearStatus(),
  google: () => api.googleStatus(),
}

function PathwayTile({
  icon: Icon, label, hint, accent, onClick,
}: {
  icon: ComponentType<IconProps>; label: string; hint: string; accent?: boolean; onClick?: () => void
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

  // Real per-connector status from the engine.
  const [runs, setRuns] = useState<Partial<Record<ConnectorService, ConnectorRun | null>>>({})
  const anyRunning = Object.values(runs).some((r) => r?.status === 'running')

  // Connect form (static-token connectors).
  const [modalId, setModalId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  // "Add to your memory" pathways.
  const [textModal, setTextModal] = useState<null | 'text' | 'link'>(null)
  const [value, setValue] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const availRef = useRef<HTMLDivElement>(null)

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }

  async function refreshStatus(service: ConnectorService) {
    const r = await statusFns[service]().catch(() => null)
    setRuns((s) => ({ ...s, [service]: r }))
    return r
  }
  async function pollStatus(service: ConnectorService) {
    for (let i = 0; i < 40; i++) {
      const r = await statusFns[service]().catch(() => null)
      setRuns((s) => ({ ...s, [service]: r }))
      if (!r || r.status !== 'running') return r
      await sleep(2500)
    }
  }
  async function syncGoogleAll() {
    for (const svc of ['drive', 'calendar', 'gmail'] as const) {
      try {
        await api.googleSync(svc, 20)
        await pollStatus('google')
      } catch {
        /* skip a service that fails; continue the rest */
      }
    }
  }

  // On mount: handle the Google return, then load real status for each connector.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const g = p.get('google')
    if (g) {
      window.history.replaceState({}, '', '/connectors')
      if (g === 'connected') {
        localStorage.setItem('anant.conn.google', '1')
        setRuns((s) => ({ ...s, google: { status: 'running' } }))
        flash('Google connected — importing your data…')
        void syncGoogleAll().then(() => refresh())
      } else {
        flash(`Google connection failed${p.get('reason') ? `: ${p.get('reason')}` : ''}`)
      }
    }
    ;(['slack', 'github', 'notion', 'linear', 'google'] as ConnectorService[]).forEach((s) => void refreshStatus(s))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function connectGoogle() {
    const ENGINE_CB = `${api.base}/api/connectors/google/oauth-callback`
    const RETURN = `${window.location.origin}/connectors`
    setBusy(true)
    api
      .googleConnect('primary', ENGINE_CB, RETURN)
      .then(({ authorization_url }) => {
        window.location.href = authorization_url
      })
      .catch((e) => {
        flash(errMsg(e))
        setBusy(false)
      })
  }

  function handleConnect(catalogId: string) {
    const cfg = liveConnectors[catalogId]
    if (!cfg) {
      flash('No live integration yet — this app is coming soon.')
      return
    }
    if (cfg.oauth) {
      connectGoogle()
      return
    }
    if (anyRunning) {
      flash('An import is already running — please wait for it to finish.')
      return
    }
    setForm({})
    setModalId(catalogId)
  }

  async function submitConnect() {
    const cfg = modalId ? liveConnectors[modalId] : null
    if (!cfg) return
    const f = form
    setBusy(true)
    try {
      // 1) Connect — store the credential.
      if (cfg.service === 'slack') await api.slackConnect(f.bot_token, f.workspace_id)
      else if (cfg.service === 'github') await api.githubConnect(f.token, f.repo)
      else if (cfg.service === 'notion') await api.notionConnect(f.token, f.workspace)
      else if (cfg.service === 'linear') await api.linearConnect(f.api_key, f.workspace)
      // Remember the connection so the card reads "connected" right away.
      localStorage.setItem(`anant.conn.${cfg.service}`, cfg.idField ? (f[cfg.idField] ?? '1') : '1')
      setRuns((s) => ({ ...s, [cfg.service]: { status: 'running' } }))
      setModalId(null)
      flash('Connected — starting import…')

      // 2) Sync — separate, so a sync hiccup never hides the connection.
      try {
        if (cfg.service === 'slack') await api.slackSync(f.channel_id, f.channel_name, 20)
        else if (cfg.service === 'github') await api.githubSync(f.repo, 20)
        else if (cfg.service === 'notion') await api.notionSync(20, f.workspace)
        else if (cfg.service === 'linear') await api.linearSync(20, f.workspace)
        const done = await pollStatus(cfg.service)
        await refresh()
        flash(
          done?.status === 'completed'
            ? `Import finished — ${done.items_ingested ?? 0} item${(done.items_ingested ?? 0) === 1 ? '' : 's'} added to memory.`
            : 'Connected. Import is still running.',
        )
      } catch (se) {
        if (se instanceof ApiError && se.status === 409) {
          flash('Connected. Another import is running — this one starts after it finishes.')
        } else {
          flash(`Connected, but the import failed: ${errMsg(se)}`)
        }
        void refreshStatus(cfg.service)
      }
    } catch (e) {
      flash(`Could not connect: ${errMsg(e)}`)
    } finally {
      setBusy(false)
    }
  }

  async function handleDisconnect(catalogId: string) {
    const cfg = liveConnectors[catalogId]
    if (!cfg) return
    const id = localStorage.getItem(`anant.conn.${cfg.service}`) ?? ''
    try {
      if (cfg.service === 'slack') await api.slackForget()
      else if (cfg.service === 'github') await api.githubForget(id)
      else if (cfg.service === 'notion') await api.notionForget(id)
      else if (cfg.service === 'linear') await api.linearForget(id)
      else if (cfg.service === 'google') await api.googleForget('primary')
      localStorage.removeItem(`anant.conn.${cfg.service}`)
      flash('Disconnected.')
      void refreshStatus(cfg.service)
    } catch (e) {
      flash(errMsg(e))
    }
  }

  // "Add to your memory" — text/link go through chat (engine ingests); file has no endpoint yet.
  async function saveText(kind: 'text' | 'link') {
    const v = value.trim()
    if (!v) return
    setBusy(true)
    await api.chat(kind === 'link' ? `Please remember this link: ${v}` : `Please remember this: ${v}`).catch(() => {})
    await refresh()
    setBusy(false)
    setTextModal(null)
    setValue('')
    flash('Sent to Anant — it will remember this')
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    flash(`“${file.name}” selected — file import isn’t available yet`)
  }

  // Apply real engine status onto the catalogue for display. The engine's
  // /status returns "never_synced" for a connected-but-unsynced account (same
  // as not-connected), so we also remember the connection locally.
  function shape(c: Connector): Connector {
    const cfg = liveConnectors[c.id]
    if (!cfg) return c
    const r = runs[cfg.service]
    const connectedLocally = !!localStorage.getItem(`anant.conn.${cfg.service}`)
    let status: ConnectorStatus = 'available'
    let items: number | undefined
    let lastSync: string | undefined
    if (r?.status === 'running') {
      status = 'syncing'
      items = r.items_ingested
    } else if (r?.status === 'completed') {
      status = 'connected'
      items = r.items_ingested
      lastSync = relTime(r.finished_at)
    } else if (r?.status === 'failed') {
      status = 'error'
    } else if (connectedLocally) {
      status = 'connected' // connected, sync not run/finished yet
    }
    return { ...c, status, items, lastSync }
  }

  const shaped = connectors.map(shape)
  const connected = shaped.filter((c) => c.status === 'connected' || c.status === 'syncing')
  const available = shaped.filter((c) => c.status === 'available' || c.status === 'error')
  const modalCfg = modalId ? liveConnectors[modalId] : null
  const modalName = modalId ? connectors.find((c) => c.id === modalId)?.name ?? modalId : ''

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* Add to memory — four pathways */}
        <section className="mb-10">
          <h2 className="mb-3 text-[0.95rem] font-[500] text-ink">Add to your memory</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <PathwayTile icon={Edit} label="Paste text" hint="Notes, a snippet" onClick={() => setTextModal('text')} />
            <PathwayTile icon={LinkGlyph} label="Add a link" hint="Article or page" onClick={() => setTextModal('link')} />
            <PathwayTile icon={Attach} label="Upload a file" hint="PDF, doc, transcript" onClick={() => fileRef.current?.click()} />
            <PathwayTile icon={Plus} label="Connect an app" hint="Slack, GitHub, Google…" accent onClick={() => availRef.current?.scrollIntoView({ behavior: 'smooth' })} />
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.md,application/pdf" className="hidden" onChange={onFile} />
        </section>

        {connected.length > 0 && (
          <section className="mb-9">
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-[0.95rem] font-[500] text-ink">Connected</h2>
              <span className="tnum text-[0.8125rem] text-ink-faint">{connected.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {connected.map((c) => (
                <ConnectorCard key={c.id} connector={c} onConnect={() => handleConnect(c.id)} onDisconnect={() => handleDisconnect(c.id)} />
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

      {/* Connect form (Slack / GitHub / Notion / Linear) */}
      {modalCfg && modalCfg.fields && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setModalId(null)} />
          <div className="rise relative w-full max-w-lg rounded-[var(--radius-lg)] bg-paper-raised p-6 shadow-[var(--shadow-pop)]">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[1.05rem] text-ink">Connect {modalName}</h3>
              <button onClick={() => setModalId(null)} aria-label="Close" className="text-ink-faint hover:text-ink">
                <Dismiss size={18} />
              </button>
            </div>
            <p className="mb-3 text-[0.8125rem] leading-relaxed text-ink-muted">
              Anant reads {modalName} inbound only — it never writes back to the source.
              {modalCfg.helpUrl && (
                <>
                  {' '}
                  <a
                    href={modalCfg.helpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-[500] text-[var(--color-royal)] hover:underline"
                  >
                    {modalCfg.helpLabel ?? 'Where do I find this?'} →
                  </a>
                </>
              )}
            </p>
            <div className="flex flex-col gap-2.5">
              {modalCfg.fields.map((fld, i) => (
                <input
                  key={fld.name}
                  autoFocus={i === 0}
                  type={fld.password ? 'password' : 'text'}
                  value={form[fld.name] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [fld.name]: e.target.value }))}
                  placeholder={`${fld.label} — ${fld.placeholder}`}
                  className="focus-ring w-full rounded-[var(--radius)] bg-paper-raised px-3 py-2.5 text-[0.9375rem] text-ink ring-1 ring-rule placeholder:text-ink-faint"
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setModalId(null)} className="rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-ink-soft hover:text-ink">
                Cancel
              </button>
              <button
                onClick={submitConnect}
                disabled={busy || modalCfg.fields.some((f) => !(form[f.name] ?? '').trim())}
                className="rounded-[var(--radius)] bg-royal px-3.5 py-2 text-[0.875rem] font-[500] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {busy ? 'Connecting…' : `Connect ${modalName}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paste text / Add a link */}
      {textModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setTextModal(null)} />
          <div className="rise relative w-full max-w-lg rounded-[var(--radius-lg)] bg-paper-raised p-6 shadow-[var(--shadow-pop)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[1.05rem] text-ink">{textModal === 'link' ? 'Add a link' : 'Paste text'}</h3>
              <button onClick={() => setTextModal(null)} aria-label="Close" className="text-ink-faint hover:text-ink">
                <Dismiss size={18} />
              </button>
            </div>
            {textModal === 'link' ? (
              <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://…" className="focus-ring w-full rounded-[var(--radius)] bg-paper-raised px-3 py-2.5 text-[0.9375rem] text-ink ring-1 ring-rule placeholder:text-ink-faint" />
            ) : (
              <textarea autoFocus value={value} onChange={(e) => setValue(e.target.value)} rows={5} placeholder="Paste a note, a snippet, anything worth remembering…" className="focus-ring w-full resize-none rounded-[var(--radius)] bg-paper-raised px-3 py-2.5 text-[0.9375rem] leading-relaxed text-ink ring-1 ring-rule placeholder:text-ink-faint" />
            )}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setTextModal(null)} className="rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-ink-soft hover:text-ink">Cancel</button>
              <button onClick={() => saveText(textModal)} disabled={busy || !value.trim()} className="rounded-[var(--radius)] bg-royal px-3.5 py-2 text-[0.875rem] font-[500] text-white transition-opacity hover:opacity-90 disabled:opacity-40">
                {busy ? 'Saving…' : 'Add to memory'}
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
