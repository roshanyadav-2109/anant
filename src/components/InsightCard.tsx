import { useState } from 'react'
import type { Insight } from '@/lib/types'
import { ProvenanceDot, SourceChip } from '@/components/Provenance'
import { Button } from '@/components/ui'
import { Aggregated, Connectors as ConnectionGlyph, Dismiss, Inferred } from '@/icons'
import { provenanceLabel } from '@/lib/mockData'

const kindMeta = {
  connection: { label: 'New connection', Icon: ConnectionGlyph },
  pattern: { label: 'Emerging pattern', Icon: Aggregated },
  contradiction: { label: 'Resolved contradiction', Icon: Inferred },
} as const

/**
 * Consolidation output — always framed as the system's own noticing, never as
 * user-stated fact. Confirm folds it into memory; dismiss lets it go.
 */
export function InsightCard({ insight }: { insight: Insight }) {
  const [resolved, setResolved] = useState<null | 'kept' | 'dismissed'>(null)
  const meta = kindMeta[insight.kind]

  if (resolved) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-rule px-5 py-4 text-[0.875rem] text-ink-muted">
        {resolved === 'kept' ? 'Kept — folded into memory.' : 'Dismissed.'}{' '}
        <button className="font-[500] text-[var(--color-royal)] hover:underline" onClick={() => setResolved(null)}>
          Undo
        </button>
      </div>
    )
  }

  return (
    <article className="group rounded-[var(--radius-lg)] border border-rule bg-paper-raised p-5 transition-all duration-150 hover:border-ink-faint/50 hover:shadow-[var(--shadow-card)]">
      <div className="mb-2 flex items-center gap-2 text-[0.75rem]">
        <meta.Icon size={15} className="text-ink-muted" />
        <span className="font-[500] text-ink">{meta.label}</span>
        <span className="ml-auto text-ink-faint">{insight.when}</span>
      </div>

      <h3 className="text-[1.05rem] font-[500] leading-snug text-ink">{insight.title}</h3>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">
        <span className="italic text-ink-muted">I noticed — </span>
        {insight.body}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.8125rem]">
        <span className="inline-flex items-center gap-1.5 font-[500]" style={{ color: `var(--color-${insight.provenance})` }}>
          <ProvenanceDot provenance={insight.provenance} />
          {provenanceLabel[insight.provenance]}
          {insight.provenanceNote && <span className="font-[400] text-ink-faint">· {insight.provenanceNote}</span>}
        </span>
        {insight.source && <SourceChip source={insight.source} />}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-rule/70 pt-4">
        <Button size="sm" variant="primary" onClick={() => setResolved('kept')}>
          Confirm
        </Button>
        <Button size="sm" variant="ghost" leading={<Dismiss size={15} />} onClick={() => setResolved('dismissed')}>
          Dismiss
        </Button>
      </div>
    </article>
  )
}
