import { useMemo, useState } from 'react'
import { memories } from '@/lib/mockData'
import { MemoryCard } from '@/components/MemoryCard'

type NodeType = 'you' | 'person' | 'project'

interface GNode {
  id: string
  label: string
  type: NodeType
  x: number
  y: number
}

interface GEdge {
  from: string
  to: string
  label: string
  superseded?: boolean
  weight?: number // 1..3, drives stroke width
}

/* A hand-composed layout — legible, calm, and deliberately not a physics jumble.
   You sit at the centre of gravity; people and projects orbit. */
const nodes: GNode[] = [
  { id: 'you', label: 'You', type: 'you', x: 330, y: 250 },
  { id: 'oliver', label: 'Oliver', type: 'person', x: 175, y: 128 },
  { id: 'grace', label: 'Grace', type: 'person', x: 500, y: 132 },
  { id: 'priya', label: 'Priya', type: 'person', x: 120, y: 268 },
  { id: 'dara', label: 'Dara', type: 'person', x: 560, y: 300 },
  { id: 'design', label: 'Design', type: 'project', x: 130, y: 400 },
  { id: 'backend', label: 'Backend', type: 'project', x: 300, y: 428 },
  { id: 'thornbury', label: 'Thornbury', type: 'project', x: 540, y: 428 },
  { id: 'q3', label: 'Q3 launch', type: 'project', x: 470, y: 340 },
  { id: 'security', label: 'Security review', type: 'project', x: 330, y: 90 },
]

const edges: GEdge[] = [
  { from: 'you', to: 'oliver', label: 'works with', weight: 2 },
  { from: 'you', to: 'grace', label: 'onboarding', weight: 2 },
  { from: 'you', to: 'priya', label: 'colleague', weight: 1 },
  { from: 'you', to: 'thornbury', label: 'coordinates', weight: 3 },
  { from: 'you', to: 'q3', label: 'owns', weight: 2 },
  { from: 'oliver', to: 'design', label: 'leads', weight: 2 },
  { from: 'oliver', to: 'backend', label: 'was on', superseded: true },
  { from: 'grace', to: 'backend', label: 'joined', weight: 2 },
  { from: 'priya', to: 'oliver', label: 'announced', weight: 1 },
  { from: 'q3', to: 'security', label: 'gated by', weight: 2 },
  { from: 'q3', to: 'thornbury', label: 'promised', weight: 1 },
  { from: 'dara', to: 'security', label: 'owns', weight: 2 },
  { from: 'dara', to: 'thornbury', label: 'account', weight: 1 },
]

const radius: Record<NodeType, number> = { you: 30, person: 21, project: 24 }

function nodeById(id: string) {
  return nodes.find((n) => n.id === id)!
}

/** Curved edge path, trimmed to each node's rim so lines never dive into nodes. */
function edgePath(a: GNode, b: GNode) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy) || 1
  const ux = dx / dist
  const uy = dy / dist
  const ra = radius[a.type] + 3
  const rb = radius[b.type] + 6
  const x1 = a.x + ux * ra
  const y1 = a.y + uy * ra
  const x2 = b.x - ux * rb
  const y2 = b.y - uy * rb
  // gentle arc: push control point perpendicular to the segment
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const curve = 0.12
  const cx = mx + -uy * dist * curve
  const cy = my + ux * dist * curve
  return { d: `M${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, mx: cx, my: cy }
}

export function MemoryGraph() {
  const [active, setActive] = useState<string>('oliver')
  const [hover, setHover] = useState<string | null>(null)

  const focus = hover ?? active

  // adjacency for dimming / highlighting
  const neighbours = useMemo(() => {
    const set = new Set<string>([focus])
    edges.forEach((e) => {
      if (e.from === focus) set.add(e.to)
      if (e.to === focus) set.add(e.from)
    })
    return set
  }, [focus])

  const related = useMemo(() => {
    const n = nodeById(active)
    const key = n.label.toLowerCase()
    return memories.filter(
      (m) => m.subject.toLowerCase() === key || m.fact.toLowerCase().includes(key),
    )
  }, [active])

  return (
    <div className="grid grid-cols-1 gap-4 pb-16 lg:grid-cols-[1.45fr_1fr]">
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-rule bg-paper-raised">
        {/* Legend */}
        <div className="flex items-center gap-4 border-b border-rule px-4 py-2.5 text-[0.72rem] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-royal" /> You
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-ink-faint bg-veil" /> Person
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-3.5 rounded-[4px] border border-ink-faint bg-veil" /> Project
          </span>
          <span className="ml-auto inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-px w-5 bg-ink-soft" /> active
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-px w-5 border-t border-dashed border-ink-faint" /> superseded
            </span>
          </span>
        </div>

        <svg viewBox="0 0 660 480" className="fade w-full select-none" style={{ maxHeight: 500 }}>
          <defs>
            <pattern id="grid-dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--color-rule)" />
            </pattern>
            <radialGradient id="focus-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-royal)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--color-royal)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width="660" height="480" fill="url(#grid-dots)" opacity="0.6" />

          {/* soft glow behind the focused node */}
          {(() => {
            const n = nodeById(focus)
            return <circle cx={n.x} cy={n.y} r={70} fill="url(#focus-glow)" />
          })()}

          {/* Edges */}
          {edges.map((e, i) => {
            const a = nodeById(e.from)
            const b = nodeById(e.to)
            const { d, mx, my } = edgePath(a, b)
            const on = e.from === focus || e.to === focus
            const dim = focus ? !on : false
            const stroke = e.superseded
              ? 'var(--color-ink-faint)'
              : on
                ? 'var(--color-royal)'
                : 'var(--color-ink-soft)'
            return (
              <g key={i} opacity={dim ? 0.12 : 1} style={{ transition: 'opacity 0.2s' }}>
                <path
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={on ? 2 : 0.8 + (e.weight ?? 1) * 0.35}
                  strokeDasharray={e.superseded ? '4 4' : undefined}
                  strokeLinecap="round"
                />
                {on && (
                  <>
                    <rect
                      x={mx - e.label.length * 3.1 - 5}
                      y={my - 9}
                      width={e.label.length * 6.2 + 10}
                      height={16}
                      rx={8}
                      fill="var(--color-paper-raised)"
                      opacity={0.9}
                    />
                    <text x={mx} y={my + 2.5} textAnchor="middle" className="fill-[var(--color-ink-muted)]" style={{ fontSize: 10 }}>
                      {e.label}
                    </text>
                  </>
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const isFocus = n.id === focus
            const near = neighbours.has(n.id)
            const dim = focus ? !near : false
            const w = Math.max(52, n.label.length * 7.4 + 22)

            return (
              <g
                key={n.id}
                className="cursor-pointer"
                opacity={dim ? 0.32 : 1}
                style={{ transition: 'opacity 0.2s' }}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setActive(n.id)}
              >
                {n.type === 'you' && (
                  <>
                    <circle cx={n.x} cy={n.y} r={radius.you} fill="var(--color-royal)" />
                    <text x={n.x} y={n.y + 4.5} textAnchor="middle" fill="#fff" style={{ fontSize: 13, fontWeight: 500 }}>
                      You
                    </text>
                  </>
                )}

                {n.type === 'person' && (
                  <>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={radius.person}
                      fill="var(--color-veil)"
                      stroke={isFocus ? 'var(--color-royal)' : 'var(--color-rule)'}
                      strokeWidth={isFocus ? 2 : 1.3}
                    />
                    <text x={n.x} y={n.y + 5} textAnchor="middle" className="fill-[var(--color-ink)]" style={{ fontSize: 15, fontWeight: 500 }}>
                      {n.label[0]}
                    </text>
                    <text x={n.x} y={n.y + radius.person + 14} textAnchor="middle" className="fill-[var(--color-ink-soft)]" style={{ fontSize: 11, fontWeight: isFocus ? 500 : 400 }}>
                      {n.label}
                    </text>
                  </>
                )}

                {n.type === 'project' && (
                  <>
                    <rect
                      x={n.x - w / 2}
                      y={n.y - 15}
                      width={w}
                      height={30}
                      rx={7}
                      fill="var(--color-veil)"
                      stroke={isFocus ? 'var(--color-royal)' : 'var(--color-rule)'}
                      strokeWidth={isFocus ? 2 : 1.3}
                    />
                    <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-[var(--color-ink)]" style={{ fontSize: 11.5, fontWeight: isFocus ? 500 : 400 }}>
                      {n.label}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>

        <div className="border-t border-rule px-4 py-2 text-[0.72rem] text-ink-faint">
          Hover to trace a thread · click a node to read its memories
        </div>
      </div>

      {/* Memory cards for the selected node */}
      <div className="space-y-3">
        <div className="eyebrow">Memories about {nodeById(active).label}</div>
        {related.length > 0 ? (
          related.map((m) => <MemoryCard key={m.id} memory={m} />)
        ) : (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-rule px-5 py-8 text-center text-[0.875rem] text-ink-muted">
            Nothing recorded against this node yet.
          </p>
        )}
      </div>
    </div>
  )
}
