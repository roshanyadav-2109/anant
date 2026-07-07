import { TopBar } from '@/components/AppShell'
import { Button, Card, cx } from '@/components/ui'
import { connectors } from '@/lib/mockData'
import { Lock, Person, Plus, Shield } from '@/icons'

const members = [
  { name: 'Tejash', email: 'tejash@neural.ai', role: 'Admin' as const, memory: 'private + shared' },
  { name: 'Grace', email: 'grace@neural.ai', role: 'Member' as const, memory: 'private + shared' },
  { name: 'Oliver', email: 'oliver@neural.ai', role: 'Member' as const, memory: 'private + shared' },
  { name: 'Dara', email: 'dara@neural.ai', role: 'Viewer' as const, memory: 'shared only' },
]

const audit = [
  { who: 'Grace', what: 'connected Linear', when: '2h ago' },
  { who: 'Tejash', what: 'forgot 12 memories from Gmail', when: 'yesterday' },
  { who: 'Oliver', what: 'accessed shared memory · Q3 launch', when: 'yesterday' },
  { who: 'Dara', what: 'viewed audit log', when: '2 days ago' },
]

const roleTone: Record<string, string> = {
  Admin: 'border-evergreen/30 bg-evergreen-soft text-evergreen',
  Member: 'border-rule bg-paper-sunk text-ink-soft',
  Viewer: 'border-rule bg-veil text-ink-muted',
}

export function WorkspacePage() {
  return (
    <>
      <TopBar
        title="Workspace"
        intent="Members, roles, connector governance, and audit — tenant-isolated."
        actions={
          <Button variant="outline" size="sm" leading={<Plus size={16} />}>
            Invite member
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 px-8 py-6 pb-16">
          {/* Isolation banner */}
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-rule bg-paper-raised px-5 py-3.5">
            <Lock size={18} className="shrink-0 text-evergreen" />
            <p className="text-[0.875rem] text-ink-soft">
              Hard tenant isolation — every view is scoped to <span className="font-[500] text-ink">Neural AI</span>.
              A clear boundary separates each person&rsquo;s private memory from team-shared memory.
            </p>
          </div>

          {/* Members */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-rule px-5 py-3.5">
              <div className="eyebrow">Members · {members.length}</div>
              <div className="text-[0.75rem] text-ink-faint">Admin / Member / Viewer</div>
            </div>
            <div>
              {members.map((m) => (
                <div key={m.email} className="flex items-center gap-3 border-b border-rule/70 px-5 py-3 last:border-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-rule bg-veil text-ink-muted">
                    <Person size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.875rem] font-[500] text-ink">{m.name}</div>
                    <div className="truncate text-[0.75rem] text-ink-muted">{m.email}</div>
                  </div>
                  <span className="hidden text-[0.75rem] text-ink-faint sm:block">{m.memory}</span>
                  <span className={cx('rounded-full border px-2.5 py-1 text-[0.6875rem] font-[500]', roleTone[m.role])}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Connector governance */}
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-rule px-5 py-3.5">
                <Shield size={16} className="text-evergreen" />
                <div className="eyebrow !tracking-[0.12em]">Connector governance</div>
              </div>
              <div className="p-3">
                {connectors.slice(0, 6).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-[var(--radius)] px-2 py-2 hover:bg-paper-sunk/50">
                    <c.icon size={18} className="text-ink-soft" />
                    <span className="flex-1 text-[0.875rem] text-ink">{c.name}</span>
                    <span
                      className={cx(
                        'text-[0.75rem] font-[500]',
                        c.status === 'available' ? 'text-ink-faint' : 'text-evergreen',
                      )}
                    >
                      {c.status === 'available' ? 'Permitted' : 'Active'}
                    </span>
                  </div>
                ))}
                <p className="px-2 pt-2 text-[0.75rem] text-ink-faint">
                  Admins choose which connectors the org allows. SSO via SAML / OIDC.
                </p>
              </div>
            </Card>

            {/* Audit */}
            <Card className="overflow-hidden">
              <div className="border-b border-rule px-5 py-3.5">
                <div className="eyebrow">Audit log</div>
              </div>
              <div className="p-3">
                {audit.map((a, i) => (
                  <div key={i} className="flex items-baseline gap-2 px-2 py-2 text-[0.8125rem]">
                    <span className="font-[500] text-ink">{a.who}</span>
                    <span className="text-ink-soft">{a.what}</span>
                    <span className="ml-auto shrink-0 text-ink-faint">{a.when}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
