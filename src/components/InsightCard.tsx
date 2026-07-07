import { useState } from 'react'
import type { Insight } from '@/lib/types'
import { ConfidenceMeter, ProvenanceBadge, SourceChip } from '@/components/Provenance'
import { Button } from '@/components/ui'
import { Aggregated, Connectors as ConnectionGlyph, Dismiss, Inferred } from '@/icons'

const kindMeta = {
  connection: { label: 'New connection', Icon: ConnectionGlyph },
  pattern: { label: 'Emerging pattern', Icon: Aggregated },
  contradiction: { label: 'Resolved contradiction', Icon: Inferred },
} as const

/**
 * Consolidation output — always framed as the system's own noticing, never
 * as user-stated fact. Confirm folds it into memory; dismiss lets it go.
 */
export function InsightCard({ insight }: { insight: Insight }) {
  const [resolved, setResolved] = useState<null | 'kept' | 'dismissed'>(null)
  const meta = kindMeta[insight.kind]

  if (resolved) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-rule px-5 py-4 text-[0.875rem] text-ink-muted">
        {resolved === 'kept' ? 'Kept — folded into memory.' : 'Dismissed.'}{' '}
        <button className="font-[600] text-evergreen hover:underline" onClick={() => setResolved(null)}>
          Undo
        </button>
      </div>
    )
  }

  return (
    <article className="group rounded-[var(--radius-lg)] border border-rule bg-paper-raised p-5 transition-colors hover:border-ink-faint/60">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-[600] uppercase tracking-[0.14em] text-ink-faint">
          <meta.Icon size={14} className="text-ink-muted" />
          {meta.label}
        </span>
        <span className="ml-auto text-[0.75rem] text-ink-faint">{insight.when}</span>
      </div>

      <h3
        className="font-display text-[1.125rem] font-[600] leading-snug text-ink"
        style={{ fontVariationSettings: "'SOFT' 2, 'opsz' 60" }}
      >
        {insight.title}
      </h3>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">
        <span className="text-ink-muted">I noticed — </span>
        {insight.body}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ProvenanceBadge provenance={insight.provenance} note={insight.provenanceNote} />
        {insight.source && <SourceChip source={insight.source} />}
        <ConfidenceMeter value={insight.confidence} showLabel={false} />
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-rule/70 pt-4">
        <Button size="sm" variant="primary" onClick={() => setResolved('kept')}>
          Confirm
        </Button>
        <Button
          size="sm"
          variant="ghost"
          leading={<Dismiss size={15} />}
          onClick={() => setResolved('dismissed')}
        >
          Dismiss
        </Button>
      </div>
    </article>
  )
}
