import { useState } from 'react'
import type { Connector, ConnectorStatus } from '@/lib/types'
import { cx, Button } from '@/components/ui'
import { Alert, Confirm, Sync } from '@/icons'
import { logoFor } from '@/lib/logos'

const statusMeta: Record<ConnectorStatus, { label: string; className: string }> = {
  connected: { label: 'Connected', className: 'text-[var(--color-ok)]' },
  syncing: { label: 'Bringing in…', className: 'text-ink-muted' },
  error: { label: 'Needs attention', className: 'text-[var(--color-alert)]' },
  available: { label: 'Available', className: 'text-[var(--color-ok)]' },
}

/** Status shown as plain coloured text — no capsule, no background. */
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

export function ConnectorCard({ connector }: { connector: Connector }) {
  const { icon: Icon } = connector
  const logo = logoFor(connector.id)
  const [connected, setConnected] = useState(connector.status)

  const progress =
    connector.items && connector.itemsTarget
      ? Math.round((connector.items / connector.itemsTarget) * 100)
      : null

  return (
    <div className="group flex flex-col rounded-[var(--radius-lg)] border border-rule bg-paper-raised p-4 transition-colors hover:border-ink-faint/60">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border border-rule bg-veil text-ink">
          {logo ? (
            <img src={logo} alt="" className="h-6 w-6 object-contain" />
          ) : (
            <Icon size={22} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[1.0625rem] font-[500] leading-tight text-ink">
            {connector.name}
          </div>
          <div className="text-[0.75rem] text-ink-muted">{connector.category}</div>
        </div>
        <StatusPill status={connected} />
      </div>

      <div className="mt-3.5 min-h-[1.25rem] text-[0.8125rem] text-ink-muted">
        {connected === 'connected' && (
          <span>
            Updated {connector.lastSync} · <span className="tnum">{connector.items?.toLocaleString()}</span> items
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
        <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-[500] text-evergreen">
          <Confirm size={13} /> inbound only
        </span>
        {connected === 'available' ? (
          <Button size="sm" variant="primary" onClick={() => setConnected('syncing')}>
            Connect
          </Button>
        ) : (
          <button className="text-[0.75rem] font-[500] text-ink-muted hover:text-ink">Manage</button>
        )}
      </div>
    </div>
  )
}
