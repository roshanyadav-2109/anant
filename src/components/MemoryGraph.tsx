import { useState } from 'react'
import { cx } from '@/components/ui'
import { memories } from '@/lib/mockData'
import { MemoryCard } from '@/components/MemoryCard'

interface GNode {
  id: string
  label: string
  type: 'person' | 'project' | 'you'
  x: number
  y: number
}

interface GEdge {
  from: string
  to: string
  label: string
  superseded?: boolean
}

// Hand-placed layout — calm, legible, not a physics jumble.
const nodes: GNode[] = [
  { id: 'you', label: 'You', type: 'you', x: 300, y: 210 },
  { id: 'oliver', label: 'Oliver', type: 'person', x: 150, y: 90 },
  { id: 'grace', label: 'Grace', type: 'person', x: 470, y: 100 },
  { id: 'design', label: 'Design', type: 'project', x: 90, y: 250 },
  { id: 'backend', label: 'Backend', type: 'project', x: 250, y: 360 },
  { id: 'thornbury', label: 'Thornbury', type: 'project', x: 500, y: 300 },
  { id: 'q3', label: 'Q3 launch', type: 'project', x: 380, y: 380 },
]

const edges: GEdge[] = [
  { from: 'oliver', to: 'design', label: 'leads' },
  { from: 'oliver', to: 'backend', label: 'was on', superseded: true },
  { from: 'grace', to: 'backend', label: 'joined' },
  { from: 'you', to: 'thornbury', label: 'coordinates' },
  { from: 'you', to: 'q3', label: 'owns' },
  { from: 'you', to: 'oliver', label: 'works with' },
  { from: 'you', to: 'grace', label: 'onboarding' },
  { from: 'q3', to: 'thornbury', label: 'promised' },
]

const typeStyle = {
  you: 'fill-[var(--color-evergreen)] text-veil',
  person: 'fill-[var(--color-paper-raised)]',
  project: 'fill-[var(--color-paper-raised)]',
} as const

export function MemoryGraph() {
  const [active, setActive] = useState<string | null>('oliver')
  const byId = (id: string) => nodes.find((n) => n.id === id)!

  const related = memories.filter((m) => {
    if (!active) return false
    const n = byId(active)
    return (
      m.subject.toLowerCase() === n.label.toLowerCase() ||
      m.fact.toLowerCase().includes(n.label.toLowerCase())
    )
  })

  return (
    <div className="grid grid-cols-1 gap-4 pb-16 lg:grid-cols-[1.4fr_1fr]">
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-rule bg-paper-raised">
        <div className="flex items-center gap-4 border-b border-rule px-4 py-2.5 text-[0.75rem] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-evergreen" /> You
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-px w-5 bg-ink-soft" /> active
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-px w-5 border-t border-dashed border-ink-faint" /> superseded
          </span>
          <span className="ml-auto text-ink-faint">Click a node to read its memories</span>
        </div>
        <svg viewBox="0 0 580 440" className="w-full" style={{ maxHeight: 460 }}>
          {edges.map((e, i) => {
            const a = byId(e.from)
            const b = byId(e.to)
            const on = active === e.from || active === e.to
            return (
              <g key={i}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={e.superseded ? 'var(--color-ink-faint)' : 'var(--color-ink-soft)'}
                  strokeWidth={on ? 1.6 : 1}
                  strokeDasharray={e.superseded ? '4 4' : undefined}
                  opacity={active ? (on ? 0.9 : 0.18) : 0.4}
                />
                {on && (
                  <text
                    x={(a.x + b.x) / 2}
                    y={(a.y + b.y) / 2 - 4}
                    textAnchor="middle"
                    className="fill-[var(--color-ink-muted)]"
                    style={{ fontSize: 10.5 }}
                  >
                    {e.label}
                  </text>
                )}
              </g>
            )
          })}
          {nodes.map((n) => {
            const on = active === n.id
            return (
              <g
                key={n.id}
                className="cursor-pointer"
                onClick={() => setActive(n.id)}
                opacity={active && !on && !edges.some((e) => (e.from === active && e.to === n.id) || (e.to === active && e.from === n.id)) ? 0.45 : 1}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.type === 'you' ? 26 : 22}
                  className={cx(typeStyle[n.type], on && n.type !== 'you' && 'stroke-[var(--color-evergreen)]')}
                  stroke={n.type === 'you' ? 'transparent' : on ? 'var(--color-evergreen)' : 'var(--color-rule)'}
                  strokeWidth={on ? 2 : 1.2}
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  className={cx(n.type === 'you' ? 'fill-[var(--color-veil)]' : 'fill-[var(--color-ink)]')}
                  style={{ fontSize: 11.5, fontWeight: 600 }}
                >
                  {n.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="space-y-3">
        <div className="eyebrow">
          {active ? `Memories about ${byId(active).label}` : 'Select a node'}
        </div>
        {related.length > 0 ? (
          related.map((m) => <MemoryCard key={m.id} memory={m} />)
        ) : (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-rule px-5 py-8 text-center text-[0.875rem] text-ink-muted">
            No memories attached to this node yet.
          </p>
        )}
      </div>
    </div>
  )
}
