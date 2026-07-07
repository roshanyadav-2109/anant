import type { Provenance, SourceRef } from '@/lib/types'
import { Aggregated, Inferred, Stated } from '@/icons'
import { sourceGlyph } from '@/lib/mockData'
import { cx } from '@/components/ui'

const meta: Record<
  Provenance,
  { label: string; Icon: typeof Stated; dot: string; text: string; ring: string; bg: string }
> = {
  stated: {
    label: 'User-stated',
    Icon: Stated,
    dot: 'bg-[var(--color-stated)]',
    text: 'text-[var(--color-stated)]',
    ring: 'border-[color-mix(in_srgb,var(--color-stated)_35%,transparent)]',
    bg: 'bg-[color-mix(in_srgb,var(--color-stated)_9%,var(--color-paper-raised))]',
  },
  inferred: {
    label: 'Inferred',
    Icon: Inferred,
    dot: 'bg-[var(--color-inferred)]',
    text: 'text-[var(--color-inferred)]',
    ring: 'border-[color-mix(in_srgb,var(--color-inferred)_35%,transparent)]',
    bg: 'bg-[color-mix(in_srgb,var(--color-inferred)_9%,var(--color-paper-raised))]',
  },
  aggregated: {
    label: 'Aggregated',
    Icon: Aggregated,
    dot: 'bg-[var(--color-aggregated)]',
    text: 'text-[var(--color-aggregated)]',
    ring: 'border-[color-mix(in_srgb,var(--color-aggregated)_35%,transparent)]',
    bg: 'bg-[color-mix(in_srgb,var(--color-aggregated)_10%,var(--color-paper-raised))]',
  },
}

/**
 * The single most important component: one consistent visual language for
 * how a fact came to be known. Inferred and aggregated read as the system's
 * own conclusions; stated reads plainly and with the most trust.
 */
export function ProvenanceBadge({
  provenance,
  note,
  className,
}: {
  provenance: Provenance
  note?: string
  className?: string
}) {
  const m = meta[provenance]
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-[500]',
        m.ring,
        m.bg,
        m.text,
        className,
      )}
    >
      <m.Icon size={13} />
      <span className="tracking-[0.02em]">{m.label}</span>
      {note && (
        <span className="font-[400] text-ink-faint">· {note}</span>
      )}
    </span>
  )
}

export function ProvenanceDot({ provenance }: { provenance: Provenance }) {
  return <span className={cx('inline-block h-2 w-2 rounded-full', meta[provenance].dot)} />
}

/* ---- Source chip — origin, linking back to source ---------------------- */

export function SourceChip({
  source,
  className,
  onClick,
}: {
  source: SourceRef
  className?: string
  onClick?: () => void
}) {
  const Glyph = sourceGlyph[source.kind]
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      onClick={onClick}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border border-rule bg-veil px-2.5 py-1 text-[0.75rem] text-ink-soft',
        onClick && 'focus-ring transition-colors hover:border-ink-faint hover:text-ink',
        className,
      )}
    >
      <Glyph size={14} className="text-ink-muted" />
      <span>{source.label}</span>
      {source.speaker && <span className="text-ink-faint">· {source.speaker}</span>}
      {source.when && <span className="text-ink-faint">· {source.when}</span>}
    </Tag>
  )
}

/* ---- Confidence meter — compact 0..1 ----------------------------------- */

export function ConfidenceMeter({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  const pct = Math.round(value * 100)
  const bars = 5
  const filled = Math.round(value * bars)
  return (
    <span className="inline-flex items-center gap-2" title={`Confidence ${pct}%`}>
      {showLabel && <span className="eyebrow !tracking-[0.14em]">confidence</span>}
      <span className="inline-flex items-end gap-[3px]" aria-hidden>
        {Array.from({ length: bars }).map((_, i) => (
          <span
            key={i}
            className={cx(
              'w-[3px] rounded-full',
              i < filled ? 'bg-ink' : 'bg-rule',
            )}
            style={{ height: `${6 + i * 2.5}px` }}
          />
        ))}
      </span>
      <span className="tnum text-[0.75rem] text-ink-muted">{pct}%</span>
    </span>
  )
}
