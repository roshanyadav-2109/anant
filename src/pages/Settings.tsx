import { TopBar } from '@/components/AppShell'
import { useAuth } from '@/lib/auth'
import { Button, Card, cx } from '@/components/ui'
import { Export, Forget, Lock, Node, Shield, Sovereign } from '@/icons'

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rule/70 py-3.5 last:border-0">
      <span className="text-[0.875rem] text-ink-soft">{label}</span>
      {value ? <span className="text-[0.875rem] font-[500] text-ink">{value}</span> : children}
    </div>
  )
}

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <>
      <TopBar title="Settings" intent="Sovereignty, model, and account — your machine, your rules." />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-8 py-6 pb-16">
          {/* Sovereignty — the headline panel */}
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-rule bg-paper-sunk">
            <div className="flex items-start gap-4 p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] bg-royal text-white">
                <Sovereign size={24} />
              </span>
              <div className="flex-1">
                <h2 className="font-display text-[1.375rem] font-[500] text-ink">
                  Running locally. No data leaves this machine.
                </h2>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                  Your memory, the reasoning model, and every connector run on your own hardware. Anant
                  makes no outbound network calls with your content.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-px border-t border-rule bg-rule sm:grid-cols-3">
              {[
                { icon: Lock, label: 'Data location', value: 'This device · encrypted' },
                { icon: Node, label: 'Reasoning model', value: 'Local · on-device' },
                { icon: Shield, label: 'Outbound calls', value: 'None' },
              ].map((s) => (
                <div key={s.label} className="bg-paper-raised p-4">
                  <s.icon size={18} className="text-royal" />
                  <div className="mt-2 text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">{s.label}</div>
                  <div className="text-[0.9375rem] font-[500] text-ink">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-rule p-4">
              <Button variant="outline" size="sm" leading={<Export size={16} />}>
                Export everything
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leading={<Forget size={16} />}
                className="text-[var(--color-supersede)] hover:bg-[color-mix(in_srgb,var(--color-supersede)_10%,transparent)]"
              >
                Delete everything
              </Button>
            </div>
          </div>

          {/* Model */}
          <Card className="p-6">
            <h3 className="mb-1 font-display text-[1.125rem] font-[500] text-ink">Model</h3>
            <p className="mb-2 text-[0.875rem] text-ink-muted">How Anant reasons and consolidates.</p>
            <Row label="Reasoning model" value="Anant Local · v1" />
            <Row label="Consolidation" value="Nightly" />
            <Row label="Response streaming">
              <Toggle on />
            </Row>
          </Card>

          {/* Account */}
          <Card className="p-6">
            <h3 className="mb-1 font-display text-[1.125rem] font-[500] text-ink">Account</h3>
            <p className="mb-2 text-[0.875rem] text-ink-muted">Your profile in this workspace.</p>
            <Row label="Name" value={user?.name ?? '—'} />
            <Row label="Email" value={user?.email ?? '—'} />
            <Row label="Workspace" value={user?.workspace ?? '—'} />
            <Row label="Role" value={user?.role ?? '—'} />
          </Card>
        </div>
      </div>
    </>
  )
}

function Toggle({ on }: { on?: boolean }) {
  return (
    <span
      className={cx(
        'inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors',
        on ? 'bg-evergreen' : 'bg-rule',
      )}
    >
      <span className={cx('h-4 w-4 rounded-full bg-veil transition-transform', on && 'translate-x-4')} />
    </span>
  )
}
