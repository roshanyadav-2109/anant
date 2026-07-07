import { useState } from 'react'
import type { Memory } from '@/lib/types'
import { ConfidenceMeter, ProvenanceBadge, SourceChip } from '@/components/Provenance'
import { cx, IconButton } from '@/components/ui'
import { Confirm, Edit, Forget, Sync } from '@/icons'

/**
 * The memory card — the core unit of the hero screen. The fact itself is set
 * a step larger for reading; provenance, source, confidence and one-tap
 * controls sit quietly beneath. A superseded fact keeps its history in a
 * quiet ochre ribbon rather than being overwritten.
 */
export function MemoryCard({
  memory,
  selectable,
  selected,
  onToggle,
}: {
  memory: Memory
  selectable?: boolean
  selected?: boolean
  onToggle?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [forgotten, setForgotten] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  if (forgotten) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-rule bg-transparent px-5 py-4 text-[0.875rem] text-ink-muted">
        Forgotten.{' '}
        <button className="font-[500] text-evergreen hover:underline" onClick={() => setForgotten(false)}>
          Undo
        </button>
      </div>
    )
  }

  return (
    <article
      className={cx(
        'group relative rounded-[var(--radius-lg)] border bg-paper-raised transition-colors',
        selected ? 'border-evergreen/50' : 'border-rule hover:border-ink-faint/60',
      )}
    >
      {memory.supersession && (
        <div className="flex items-center gap-2 rounded-t-[var(--radius-lg)] border-b border-[color-mix(in_srgb,var(--color-supersede)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-supersede)_9%,transparent)] px-5 py-1.5 text-[0.75rem] text-[var(--color-supersede)]">
          <Sync size={13} />
          <span>
            was <span className="line-through opacity-80">{memory.supersession.from}</span> → now{' '}
            <span className="font-[500]">{memory.supersession.to}</span>
          </span>
          <span className="ml-auto text-ink-faint">kept as history</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-3">
          {selectable && (
            <button
              onClick={onToggle}
              aria-label={selected ? 'Deselect' : 'Select'}
              className={cx(
                'focus-ring mt-1 h-4 w-4 shrink-0 rounded-[4px] border transition-colors',
                selected ? 'border-evergreen bg-evergreen' : 'border-rule bg-veil hover:border-ink-faint',
              )}
            >
              {selected && <Confirm size={12} className="text-veil" />}
            </button>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <ProvenanceBadge provenance={memory.provenance} note={memory.provenanceNote} />
              <SourceChip source={memory.source} onClick={() => {}} />
            </div>

            <button
              onClick={() => memory.detail && setOpen((v) => !v)}
              className={cx(
                'block text-left font-display text-[1.0625rem] leading-[1.45] text-ink',
                memory.detail && 'cursor-pointer',
              )}
              style={{ fontVariationSettings: "'SOFT' 2, 'WONK' 0, 'opsz' 40" }}
            >
              {memory.fact}
            </button>

            {open && memory.detail && (
              <p className="fade mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{memory.detail}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[0.8125rem] text-ink-muted">
                <span className="font-[500] text-ink-soft">{memory.subject}</span> · {memory.when}
              </span>
              <ConfidenceMeter value={memory.confidence} />

              <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <IconButton label="Edit">
                  <Edit size={17} />
                </IconButton>
                <IconButton
                  label={confirmed ? 'Confirmed' : 'Confirm'}
                  onClick={() => setConfirmed(true)}
                  className={confirmed ? 'text-evergreen' : ''}
                >
                  <Confirm size={17} />
                </IconButton>
                <IconButton label="Forget" onClick={() => setForgotten(true)}>
                  <Forget size={17} />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
