import { useState } from 'react'
import type { Connector, ConnectorStatus } from '@/lib/types'
import { cx, Button } from '@/components/ui'
import { Alert, Confirm, Sync } from '@/icons'

const statusMeta: Record<
  ConnectorStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  connected: {
    label: 'Connected',
    className:
      'border-[color-mix(in_srgb,var(--color-evergreen)_30%,transparent)] bg-evergreen-soft text-evergreen',
  },
  syncing: {
    label: 'Syncing',
    className: 'border-rule bg-paper-sunk text-ink-soft',
    pulse: true,
  },
  error: {
    label: 'Error',
    className:
      'border-[color-mix(in_srgb,var(--color-supersede)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-supersede)_10%,transparent)] text-[var(--color-supersede)]',
  },
  available: { label: 'Available', className: 'border-rule bg-veil text-ink-muted' },
}

export function StatusPill({ status }: { status: ConnectorStatus }) {
  const m = statusMeta[status]
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-[600]',
        m.className,
      )}
    >
      {status === 'syncing' && <Sync size={12} className="consolidating" />}
      {status === 'connected' && <Confirm size={12} />}
      {status === 'error' && <Alert size={12} />}
      {m.label}
    </span>
  )
}

export function ConnectorCard({ connector }: { connector: Connector }) {
  const { icon: Icon } = connector
  const [connected, setConnected] = useState(connector.status)

  const progress =
    connector.items && connector.itemsTarget
      ? Math.round((connector.items / connector.itemsTarget) * 100)
      : null

  return (
    <div className="group flex flex-col rounded-[var(--radius-lg)] border border-rule bg-paper-raised p-4 transition-colors hover:border-ink-faint/60">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-rule bg-veil text-ink">
          <Icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[1.0625rem] font-[600] leading-tight text-ink">
            {connector.name}
          </div>
          <div className="text-[0.75rem] text-ink-muted">{connector.category}</div>
        </div>
        <StatusPill status={connected} />
      </div>

      <div className="mt-3.5 min-h-[1.25rem] text-[0.8125rem] text-ink-muted">
        {connected === 'connected' && (
          <span>
            Synced {connector.lastSync} · <span className="tnum">{connector.items?.toLocaleString()}</span> items
          </span>
        )}
        {connected === 'syncing' && (
          <span>
            <span className="tnum">{connector.items?.toLocaleString()}</span> of ~
            <span className="tnum">{connector.itemsTarget?.toLocaleString()}</span>
          </span>
        )}
        {connected === 'available' && <span>Bring this into your private memory.</span>}
      </div>

      {progress !== null && connected === 'syncing' && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-paper-sunk">
          <div
            className="h-full rounded-full bg-evergreen transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-rule/70 pt-3">
        <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-[600] text-evergreen">
          <Confirm size={13} /> inbound only
        </span>
        {connected === 'available' ? (
          <Button size="sm" variant="primary" onClick={() => setConnected('syncing')}>
            Connect
          </Button>
        ) : (
          <button className="text-[0.75rem] font-[600] text-ink-muted hover:text-ink">Manage</button>
        )}
      </div>
    </div>
  )
}
