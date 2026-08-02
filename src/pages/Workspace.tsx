import { connectors } from '@/lib/mockData'
import { logoFor } from '@/lib/logos'
import { Dots, Plus } from '@/icons'

/* ============================================================
   Workspace — an enterprise console.
   Workspace identity + plan, overview tiles, a people table, and
   friendly access / activity panels. Left-aligned, plain language.
   ============================================================ */

const members = [
  { name: 'Tejash Meh', email: 'tejash@neural.ai', role: 'Admin' as const, access: 'Private + shared', you: true },
  { name: 'Grace Okafor', email: 'grace@neural.ai', role: 'Member' as const, access: 'Private + shared' },
  { name: 'Oliver Reed', email: 'oliver@neural.ai', role: 'Member' as const, access: 'Private + shared' },
  { name: 'Dara Singh', email: 'dara@neural.ai', role: 'Viewer' as const, access: 'Shared only' },
]

const activity = [
  { who: 'Grace', what: 'connected Linear', when: '2h ago' },
  { who: 'Tejash', what: 'removed 12 memories from Gmail', when: 'Yesterday' },
  { who: 'Oliver', what: 'opened shared memory · Q3 launch', when: 'Yesterday' },
  { who: 'Dara', what: 'viewed the activity log', when: '2 days ago' },
]

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

function Tile({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-[3px] bg-paper-raised p-4 shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70">
      <div className="text-[1.625rem] leading-none tracking-[-0.03em] tabular-nums text-ink">{value}</div>
      <div className="mt-1.5 text-[0.8125rem] text-ink">{label}</div>
      {sub && <div className="text-[0.75rem] text-ink-soft">{sub}</div>}
    </div>
  )
}

export function WorkspacePage() {
  const allowed = connectors.filter((c) => c.status === 'connected' || c.status === 'syncing')

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="max-w-5xl px-9 py-9 pb-16">
        {/* Identity */}
        <header className="flex flex-wrap items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-royal text-[1.125rem] font-[500] text-white">
            N
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[1.375rem] tracking-[-0.02em] text-ink">Neural AI</h1>
              <span className="rounded-full bg-[var(--color-royal-soft)] px-2.5 py-0.5 text-[0.75rem] font-[500] text-[var(--color-royal)]">
                Team plan
              </span>
            </div>
            <div className="text-[0.875rem] text-ink-soft">{members.length} people · neural.ai</div>
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
            <div className="flex flex-col gap-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-baseline gap-2 text-[0.875rem]">
                  <span className="font-[500] text-ink">{a.who}</span>
                  <span className="text-ink-soft">{a.what}</span>
                  <span className="ml-auto shrink-0 text-[0.8125rem] text-ink-faint">{a.when}</span>
                </div>
              ))}
            </div>
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
      </div>
    </div>
  )
}
