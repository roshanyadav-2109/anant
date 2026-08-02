import { ConnectorCard } from '@/components/ConnectorCard'
import { connectors } from '@/lib/mockData'

export function ConnectorsPage() {
  const connected = connectors.filter((c) => c.status === 'connected' || c.status === 'syncing')
  const available = connectors.filter((c) => c.status === 'available' || c.status === 'error')

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        {connected.length > 0 && (
          <section className="mb-9">
            <div className="mb-3 flex items-baseline gap-2">
              <h2 className="text-[0.95rem] font-[500] text-ink">Connected</h2>
              <span className="tnum text-[0.8125rem] text-ink-faint">{connected.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {connected.map((c) => (
                <ConnectorCard key={c.id} connector={c} />
              ))}
            </div>
          </section>
        )}

        <section className="pb-16">
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-[0.95rem] font-[500] text-ink">Available</h2>
            <span className="tnum text-[0.8125rem] text-ink-faint">{available.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((c) => (
              <ConnectorCard key={c.id} connector={c} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
