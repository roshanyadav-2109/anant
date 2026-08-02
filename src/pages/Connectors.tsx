import { ConnectorCard } from '@/components/ConnectorCard'
import { useData } from '@/lib/dataStore'
import { Attach, Connectors as LinkGlyph, Edit, Plus, type IconProps } from '@/icons'
import type { ComponentType } from 'react'

function PathwayTile({
  icon: Icon, label, hint, accent,
}: {
  icon: ComponentType<IconProps>
  label: string
  hint: string
  accent?: boolean
}) {
  return (
    <button
      className={cxTile(accent)}
    >
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
  const { connectors } = useData()
  const connected = connectors.filter((c) => c.status === 'connected' || c.status === 'syncing')
  const available = connectors.filter((c) => c.status === 'available' || c.status === 'error')

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* Add to memory — four pathways (the entry point) */}
        <section className="mb-10">
          <h2 className="mb-3 text-[0.95rem] font-[500] text-ink">Add to your memory</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <PathwayTile icon={Edit} label="Paste text" hint="Notes, a snippet" />
            <PathwayTile icon={LinkGlyph} label="Add a link" hint="Article or page" />
            <PathwayTile icon={Attach} label="Upload a file" hint="PDF, doc, transcript" />
            <PathwayTile icon={Plus} label="Connect an app" hint="Slack, Gmail, Drive…" accent />
          </div>
        </section>

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
