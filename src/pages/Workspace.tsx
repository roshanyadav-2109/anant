import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/lib/auth'
import { useData } from '@/lib/dataStore'
import { exportMemory, forgetAll } from '@/lib/dataActions'
import { api } from '@/lib/anant'
import { logoFor } from '@/lib/logos'
import { Dismiss, Dots, Export, Forget, Plus } from '@/icons'

/* ============================================================
   Workspace — an enterprise console.
   Workspace identity + plan, overview tiles, a people table, and
   friendly access / activity panels. Left-aligned, plain language.
   ============================================================ */

interface Activity {
  who: string
  what: string
  when: string
  at: string
  category: string
  affects: string
  detail: string
  target?: string
}

function relTime(iso: string): string {
  const t = Date.parse(iso)
  if (!t) return ''
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const roleTone: Record<string, string> = {
  Admin: 'bg-[var(--color-royal-soft)] text-[var(--color-royal)]',
  Member: 'ring-1 ring-rule text-ink-soft',
  Viewer: 'ring-1 ring-rule text-ink-muted',
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-royal-soft)] text-[0.75rem] font-[500] text-[var(--color-royal)]">
      {initials(name)}
    </span>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[0.6875rem] uppercase tracking-[0.1em] text-ink-faint">{label}</div>
      <div className="mt-1 text-[0.875rem] text-ink">{children}</div>
    </div>
  )
}

/* Centered 75%-width activity detail, blurred backdrop, plain close. */
function ActivityModal({ item, onClose }: { item: Activity; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const logo = item.target && logoFor(item.target)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="rise relative flex max-h-[80vh] w-[75vw] flex-col overflow-hidden rounded-[var(--radius-lg)] bg-paper-raised shadow-[var(--shadow-pop)]">
        {/* header */}
        <div className="flex items-start gap-3 border-b border-rule px-7 py-5">
          <Avatar name={item.who} />
          <div className="min-w-0 flex-1">
            <div className="text-[1.0625rem] text-ink">
              {item.who} {item.what}
            </div>
            <div className="mt-0.5 text-[0.8125rem] text-ink-soft">
              {item.category} · {item.at}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="focus-ring -mr-1 rounded-[var(--radius)] p-1 text-ink-faint transition-colors hover:text-ink"
          >
            <Dismiss size={20} />
          </button>
        </div>

        {/* body */}
        <div className="grid gap-8 overflow-y-auto px-7 py-6 sm:grid-cols-[190px_1fr]">
          <div className="flex flex-col gap-5">
            <DetailRow label="When">{item.at}</DetailRow>
            <DetailRow label="Who">{item.who}</DetailRow>
            <DetailRow label="Affects">{item.affects}</DetailRow>
            {logo && (
              <DetailRow label="Source">
                <span className="inline-flex items-center gap-2">
                  <img src={logo} alt="" className="h-4 w-4 object-contain" />
                  {item.target && item.target.charAt(0).toUpperCase() + item.target.slice(1)}
                </span>
              </DetailRow>
            )}
          </div>

          <div>
            <div className="text-[0.6875rem] uppercase tracking-[0.1em] text-ink-faint">What happened</div>
            <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-ink-soft">{item.detail}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Tile({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-[3px] bg-paper-raised p-4 shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70">
      <div className="text-[1.625rem] leading-none tracking-[-0.03em] tabular-nums text-ink">{value}</div>
      <div className="mt-1.5 text-[0.8125rem] text-ink">{label}</div>
      {sub && <div className="text-[0.75rem] text-ink-soft">{sub}</div>}
    </div>
  )
}

/* ---- Personal — for individuals, solo founders, public figures --------- */
function PersonalView({ name, email }: { name: string; email: string }) {
  const { connectors, stats, refresh } = useData()
  const allowed = connectors.filter((c) => c.status === 'connected' || c.status === 'syncing')

  async function onExport() {
    await exportMemory().catch(() => {})
  }
  async function onDelete() {
    if (!window.confirm('This permanently erases everything Anant remembers about you. Continue?')) return
    await forgetAll().catch(() => {})
    await refresh()
  }
  return (
    <>
      <header className="flex flex-wrap items-center gap-4">
        <Avatar name={name} />
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[1.375rem] tracking-[-0.02em] text-ink">{name}</h1>
            <span className="rounded-full bg-[var(--color-royal-soft)] px-2.5 py-0.5 text-[0.75rem] font-[500] text-[var(--color-royal)]">
              Individual
            </span>
          </div>
          <div className="text-[0.875rem] text-ink-soft">{email} · just you</div>
        </div>
      </header>

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile value={String(stats?.memories ?? 0)} label="Memories" sub="in your engine" />
        <Tile value={String(stats?.entities ?? 0)} label="People & things" sub="Anant has found" />
        <Tile value={String(stats?.patterns ?? 0)} label="Patterns" sub="noticed so far" />
        <Tile value={String(allowed.length)} label="Connected apps" />
      </div>

      {/* Create a team — the upgrade path for solo → startup */}
      <section className="mt-9 flex flex-wrap items-center gap-4 rounded-[3px] bg-paper-raised p-5 shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70">
        <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--color-royal-soft)] text-[var(--color-royal)]">
          <Plus size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[0.95rem] font-[500] text-ink">Working with others?</h2>
          <p className="text-[0.8125rem] text-ink-soft">
            Create a team to share memory, set roles, and manage who can connect what. Your private
            memory always stays yours.
          </p>
        </div>
        <button className="focus-ring inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-royal px-3.5 py-2 text-[0.875rem] font-[500] text-white transition-opacity hover:opacity-90">
          <Plus size={16} />
          Create a team
        </button>
      </section>

      {/* Your data */}
      <section className="mt-9">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-[0.95rem] font-[500] text-ink">Your data</h2>
        </div>
        <div className="rounded-[3px] bg-paper-raised p-5 shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onExport}
              className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-ink-soft ring-1 ring-rule transition-colors hover:text-ink"
            >
              <Export size={16} />
              Export everything
            </button>
            <button
              onClick={onDelete}
              className="focus-ring inline-flex items-center gap-2 rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] font-[500] text-[var(--color-alert)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-alert)_10%,transparent)]"
            >
              <Forget size={16} />
              Delete everything
            </button>
          </div>
          <p className="mt-3 text-[0.8125rem] text-ink-soft">
            Your memory is yours — take a full copy or clear it whenever you want.
          </p>
        </div>
      </section>
    </>
  )
}

/* ---- Team — for startups and enterprises ------------------------------- */
function TeamView({ onOpenActivity }: { onOpenActivity: (a: Activity) => void }) {
  const { connectors, members } = useData()
  const { user } = useAuth()
  const allowed = connectors.filter((c) => c.status === 'connected' || c.status === 'syncing')

  // Real audit log from the engine.
  const [activityList, setActivityList] = useState<Activity[]>([])
  useEffect(() => {
    if (!user?.orgId) return
    api
      .audit(user.orgId, 50)
      .then((res) =>
        setActivityList(
          (res.events ?? []).map((e) => ({
            who: e.actor,
            what: `${e.action}${e.object ? ` · ${e.object}` : ''}`,
            when: relTime(e.ts),
            at: e.ts,
            category: e.action,
            affects: e.object || '—',
            detail: `${e.actor} performed “${e.action}” on ${e.object || 'the workspace'} — ${e.decision}.`,
          })),
        ),
      )
      .catch(() => {})
  }, [user?.orgId])

  const orgLabel = user?.name ? `${user.name}’s organization` : 'Your organization'

  return (
    <>
      {/* Identity */}
      <header className="flex flex-wrap items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-royal text-[1.125rem] font-[500] text-white">
          {orgLabel.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[1.375rem] tracking-[-0.02em] text-ink">{orgLabel}</h1>
            <span className="rounded-full bg-[var(--color-royal-soft)] px-2.5 py-0.5 text-[0.75rem] font-[500] text-[var(--color-royal)]">
              Organization
            </span>
          </div>
          <div className="text-[0.875rem] text-ink-soft">
            {members.length} {members.length === 1 ? 'person' : 'people'}
          </div>
        </div>
        <button className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-royal px-3.5 py-2 text-[0.875rem] font-[500] text-white transition-opacity hover:opacity-90">
          <Plus size={16} />
          Invite people
        </button>
      </header>

      {/* Overview */}
        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile value={String(members.length)} label="People" sub="1 admin" />
          <Tile value="4 / 10" label="Seats used" sub="6 available" />
          <Tile value="128" label="Shared memories" sub="across the team" />
          <Tile value={String(allowed.length)} label="Connected apps" sub="org-approved" />
        </div>

        {/* People */}
        <section className="mt-9">
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-[0.95rem] font-[500] text-ink">People</h2>
            <span className="tabular-nums text-[0.8125rem] text-ink-faint">{members.length}</span>
          </div>
          <div className="overflow-hidden rounded-[3px] bg-paper-raised shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70">
            {members.map((m, i) => (
              <div
                key={m.email}
                className={
                  'flex items-center gap-3 px-4 py-3 ' + (i < members.length - 1 ? 'border-b border-rule/70' : '')
                }
              >
                <Avatar name={m.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.9rem] font-[500] text-ink">{m.name}</span>
                    {m.you && (
                      <span className="rounded-full px-1.5 py-px text-[0.625rem] text-ink-muted ring-1 ring-rule">You</span>
                    )}
                  </div>
                  <div className="truncate text-[0.8125rem] text-ink-soft">{m.email}</div>
                </div>
                <span className="hidden text-[0.8125rem] text-ink-soft sm:block">{m.access}</span>
                <span className={'rounded-full px-2.5 py-1 text-[0.6875rem] font-[500] ' + roleTone[m.role]}>
                  {m.role}
                </span>
                <button className="focus-ring rounded-[var(--radius)] p-1 text-ink-faint transition-colors hover:text-ink">
                  <Dots size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Access + activity */}
        <div className="mt-9 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Access & security */}
          <section className="rounded-[3px] bg-paper-raised p-5 shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70">
            <h2 className="mb-4 text-[0.95rem] font-[500] text-ink">Access &amp; security</h2>
            <div className="flex flex-col divide-y divide-rule/70">
              {[
                { label: 'Company sign-in', value: 'On · Google', ok: true },
                { label: 'Who can invite people', value: 'Admins only' },
                { label: 'New people can see', value: 'Shared memory only' },
                { label: 'Everyone’s private memory', value: 'Stays private' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="text-[0.875rem] text-ink">{row.label}</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[0.875rem] text-ink-soft">
                    {row.ok && <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ok)]" />}
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent activity */}
          <section className="rounded-[3px] bg-paper-raised p-5 shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70">
            <h2 className="mb-4 text-[0.95rem] font-[500] text-ink">Recent activity</h2>
            {activityList.length === 0 ? (
              <p className="text-[0.875rem] text-ink-muted">No activity yet.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {activityList.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => onOpenActivity(a)}
                    className="focus-ring -mx-2 flex items-baseline gap-2 rounded-[var(--radius)] px-2 py-1.5 text-left text-[0.875rem] transition-colors hover:bg-paper-sunk/60"
                  >
                    <span className="font-[500] text-ink">{a.who}</span>
                    <span className="text-ink-soft">{a.what}</span>
                    <span className="ml-auto shrink-0 text-[0.8125rem] text-ink-faint">{a.when}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Approved apps */}
        <section className="mt-9">
          <h2 className="mb-3 text-[0.95rem] font-[500] text-ink">Apps the team can connect</h2>
          <div className="flex flex-wrap gap-2">
            {connectors.slice(0, 10).map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-2 rounded-full bg-paper-raised px-3 py-1.5 text-[0.8125rem] text-ink ring-1 ring-rule"
              >
                {logoFor(c.id) ? (
                  <img src={logoFor(c.id)} alt="" className="h-4 w-4 object-contain" />
                ) : (
                  <c.icon size={15} className="text-ink-soft" />
                )}
                {c.name}
              </span>
            ))}
            <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[0.8125rem] text-ink-muted ring-1 ring-rule">
              +{Math.max(0, connectors.length - 10)} more
            </span>
          </div>
        </section>
    </>
  )
}

export function WorkspacePage() {
  const { user } = useAuth()
  // Entitlement decides the whole surface — a personal account never sees team UI.
  const isTeam = user?.accountType === 'team'
  const [openActivity, setOpenActivity] = useState<Activity | null>(null)

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="max-w-5xl px-9 py-9 pb-16">
        {isTeam ? (
          <TeamView onOpenActivity={setOpenActivity} />
        ) : (
          <PersonalView name={user?.name ?? 'You'} email={user?.username ? `@${user.username}` : ''} />
        )}
      </div>

      {isTeam && openActivity && <ActivityModal item={openActivity} onClose={() => setOpenActivity(null)} />}
    </div>
  )
}
