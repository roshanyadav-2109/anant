import type { Connector, ConnectorStatus } from '@/lib/types'
import { cx, Button } from '@/components/ui'
import { Alert, Confirm, Sync } from '@/icons'
import { logoFor } from '@/lib/logos'

const statusMeta: Record<ConnectorStatus, { label: string; className: string }> = {
  connected: { label: 'Connected', className: 'text-[var(--color-ok)]' },
  syncing: { label: 'Importing', className: 'text-[var(--color-royal)]' },
  error: { label: 'Needs attention', className: 'text-[var(--color-alert)]' },
  available: { label: 'Available', className: 'text-ink-faint' },
}

/** Status shown as plain coloured text — no capsule. */
export function StatusPill({ status }: { status: ConnectorStatus }) {
  const m = statusMeta[status]
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-[0.75rem] font-[500]', m.className)}>
      {status === 'syncing' && <Sync size={13} className="consolidating" />}
      {status === 'connected' && <Confirm size={14} />}
      {status === 'error' && <Alert size={13} />}
      {m.label}
    </span>
  )
}

export function ConnectorCard({
  connector,
  onConnect,
  onDisconnect,
}: {
  connector: Connector
  onConnect?: () => void
  onDisconnect?: () => void
}) {
  const { icon: Icon } = connector
  const logo = logoFor(connector.id)
  const status = connector.status

  function connect() {
    onConnect?.()
  }
  function disconnect() {
    onDisconnect?.()
  }

  return (
    <div className="group flex flex-col rounded-[var(--radius-lg)] border border-rule bg-paper-raised p-4 transition-all duration-150 hover:border-ink-faint/50 hover:shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-rule bg-veil">
          {logo ? <img src={logo} alt="" className="h-6 w-6 object-contain" /> : <Icon size={22} className="text-ink" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[0.95rem] font-[500] leading-tight text-ink">{connector.name}</div>
          <div className="text-[0.75rem] text-ink-muted">{connector.category}</div>
        </div>
        <StatusPill status={status} />
      </div>

      {status === 'connected' && (
        <div className="mt-3 text-[0.8125rem] text-ink-muted">
          {connector.lastSync ? (
            (connector.items ?? 0) > 0 ? (
              <span>
                Updated {connector.lastSync} · <span className="tnum">{connector.items!.toLocaleString()}</span> items
              </span>
            ) : (
              // Completed a sync but found nothing to bring in.
              <span>Connected · nothing to import found here</span>
            )
          ) : (
            // Connected but no sync has finished yet.
            <span>Connected · nothing imported yet</span>
          )}
        </div>
      )}

      {/* Importing — a bar that fills toward completion + the live item count */}
      {status === 'syncing' && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-[0.8125rem]">
            <span className="text-[var(--color-royal)]">Importing…</span>
            <span className="tnum text-ink-muted">
              {connector.items ? `${connector.items.toLocaleString()} items` : ''}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-paper-sunk">
            <div className="bar-filling h-full rounded-full bg-royal" />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 text-[0.8125rem] text-[var(--color-alert)]">The last import didn’t finish. Try reconnecting.</div>
      )}

      <div className="mt-4 flex items-center justify-end gap-3 border-t border-rule/70 pt-3">
        {status === 'available' ? (
          <>
            {onDisconnect && (
              <button
                onClick={disconnect}
                className="text-[0.75rem] text-ink-faint transition-colors hover:text-[var(--color-alert)]"
              >
                Disconnect
              </button>
            )}
            <Button size="sm" variant="primary" onClick={connect}>
              Connect
            </Button>
          </>
        ) : (
          <button
            onClick={disconnect}
            className="text-[0.75rem] font-[500] text-ink-muted transition-colors hover:text-[var(--color-alert)]"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  )
}
