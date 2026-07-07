import { TopBar } from '@/components/AppShell'
import { ConnectorCard } from '@/components/ConnectorCard'
import { connectors } from '@/lib/mockData'
import { Shield } from '@/icons'

export function ConnectorsPage() {
  const connected = connectors.filter((c) => c.status === 'connected' || c.status === 'syncing')
  const available = connectors.filter((c) => c.status === 'available' || c.status === 'error')

  return (
    <>
      <TopBar title="Connectors" intent="Bring your tools into one private memory — nothing is sent out." />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-6">
          {/* Sovereignty reassurance banner */}
          <div className="mb-8 flex items-center gap-3 rounded-[var(--radius-lg)] border border-rule bg-paper-sunk px-5 py-3.5">
            <Shield size={20} className="shrink-0 text-royal" />
            <p className="text-[0.875rem] text-ink-soft">
              Every connector <span className="font-[500] text-ink">only reads — it never sends</span>. Anant
              brings your sources into your private memory and never sends anything back out.
            </p>
          </div>

          <section className="mb-10">
            <div className="eyebrow mb-3">Connected</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {connected.map((c) => (
                <ConnectorCard key={c.id} connector={c} />
              ))}
            </div>
          </section>

          <section className="pb-16">
            <div className="eyebrow mb-3">Available</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {available.map((c) => (
                <ConnectorCard key={c.id} connector={c} />
              ))}
            </div>
            <p className="mt-5 text-[0.8125rem] text-ink-faint">
              Slack connects first. Gmail, Drive, Notion, Calendar, Linear, GitHub and more are on the way.
              Connecting is safe — your passwords are never kept in your browser.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
