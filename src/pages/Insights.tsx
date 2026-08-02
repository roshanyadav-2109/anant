import { InsightCard } from '@/components/InsightCard'
import { insights } from '@/lib/mockData'
import { Aggregated, Connectors as ConnectionGlyph, Inferred, type IconProps } from '@/icons'
import type { Insight } from '@/lib/types'
import type { ComponentType } from 'react'

const KINDS: { key: Insight['kind']; label: string; icon: ComponentType<IconProps> }[] = [
  { key: 'connection', label: 'New connections', icon: ConnectionGlyph },
  { key: 'pattern', label: 'Emerging patterns', icon: Aggregated },
  { key: 'contradiction', label: 'Resolved contradictions', icon: Inferred },
]

export function InsightsPage() {
  const groups = KINDS.map((k) => ({ ...k, items: insights.filter((i) => i.kind === k.key) })).filter(
    (g) => g.items.length > 0,
  )

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-9">
        {/* Summary — the consolidation moment */}
        <div className="mb-8">
          <h1 className="text-[1.375rem] font-[500] tracking-[-0.01em] text-ink">
            Anant noticed {insights.length} {insights.length === 1 ? 'thing' : 'things'}
          </h1>
          <p className="mt-1.5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted">
            While you were away, it reviewed what it knows and surfaced these. They&rsquo;re its own
            inferences — never stated fact. Confirm one to fold it into memory, or dismiss it.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {groups.map((g) => (
              <span
                key={g.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper-raised px-3 py-1 text-[0.8125rem] text-ink"
              >
                <g.icon size={14} className="text-ink-muted" />
                {g.label}
                <span className="tnum text-ink-faint">· {g.items.length}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Grouped review feed */}
        <div className="space-y-9 pb-16">
          {groups.map((g) => (
            <section key={g.key}>
              <div className="mb-3 flex items-center gap-2">
                <g.icon size={16} className="text-ink-muted" />
                <h2 className="text-[0.95rem] font-[500] text-ink">{g.label}</h2>
                <span className="tnum text-[0.8125rem] text-ink-faint">{g.items.length}</span>
              </div>
              <div className="space-y-3">
                {g.items.map((ins, i) => (
                  <div key={ins.id} className="rise" style={{ animationDelay: `${i * 50}ms` }}>
                    <InsightCard insight={ins} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
