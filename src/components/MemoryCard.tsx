import { useState } from 'react'
import type { Memory } from '@/lib/types'
import { ConfidenceMeter, ProvenanceBadge, SourceChip } from '@/components/Provenance'
import { Button, cx, IconButton } from '@/components/ui'
import { Confirm, Edit, Forget, Sync } from '@/icons'

/**
 * The memory card — the core unit of the hero screen. Fact reads large;
 * provenance, source, confidence and one-tap controls sit beneath. Editing is
 * inline; confirm and forget are handled by the page so state persists.
 */
export function MemoryCard({
  memory,
  selectable,
  selected,
  onToggle,
  onEdit,
  onForget,
  onConfirm,
  autoEdit,
}: {
  memory: Memory
  selectable?: boolean
  selected?: boolean
  onToggle?: () => void
  onEdit?: (id: string, fact: string) => void
  onForget?: (id: string) => void
  onConfirm?: (id: string) => void
  autoEdit?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(Boolean(autoEdit))
  const [draft, setDraft] = useState(memory.fact)

  function save() {
    const t = draft.trim()
    if (!t) {
      onForget?.(memory.id)
      return
    }
    onEdit?.(memory.id, t)
    setEditing(false)
  }

  function cancel() {
    if (!memory.fact.trim()) {
      onForget?.(memory.id) // discard a brand-new, empty memory
      return
    }
    setDraft(memory.fact)
    setEditing(false)
  }

  return (
    <article
      className={cx(
        'group relative rounded-[var(--radius-lg)] border bg-paper-raised transition-colors',
        selected ? 'border-[var(--color-royal)]/50' : 'border-rule hover:border-ink-faint/60',
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
                'focus-ring mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                selected ? 'border-[var(--color-royal)] bg-[var(--color-royal)]' : 'border-rule bg-veil hover:border-ink-faint',
              )}
            >
              {selected && <Confirm size={12} className="text-white" />}
            </button>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <ProvenanceBadge provenance={memory.provenance} note={memory.provenanceNote} />
              <SourceChip source={memory.source} onClick={() => {}} />
              {memory.confirmed && (
                <span className="inline-flex items-center gap-1 text-[0.6875rem] font-[500] text-[var(--color-stated)]">
                  <Confirm size={13} /> Confirmed
                </span>
              )}
            </div>

            {editing ? (
              <div>
                <textarea
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
                    if (e.key === 'Escape') cancel()
                  }}
                  rows={2}
                  placeholder="What should Anant remember?"
                  className="focus-ring w-full resize-none rounded-[4px] border border-rule bg-veil px-3 py-2 text-[1rem] leading-snug text-ink placeholder:text-ink-faint"
                />
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="primary" onClick={save}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => memory.detail && setOpen((v) => !v)}
                  className={cx(
                    'block text-left text-[1.0625rem] leading-[1.45] text-ink',
                    memory.detail && 'cursor-pointer',
                  )}
                >
                  {memory.fact}
                </button>
                {open && memory.detail && (
                  <p className="fade mt-2 text-[0.9375rem] leading-relaxed text-ink">{memory.detail}</p>
                )}
              </>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[0.8125rem] text-ink">
                <span className="font-[500]">{memory.subject}</span> · {memory.when}
              </span>
              <ConfidenceMeter value={memory.confidence} />

              {!editing && (
                <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <IconButton label="Edit" onClick={() => setEditing(true)}>
                    <Edit size={17} />
                  </IconButton>
                  <IconButton
                    label={memory.confirmed ? 'Confirmed' : 'Confirm'}
                    onClick={() => onConfirm?.(memory.id)}
                    className={memory.confirmed ? 'text-[var(--color-stated)]' : ''}
                  >
                    <Confirm size={17} />
                  </IconButton>
                  <IconButton label="Forget" onClick={() => onForget?.(memory.id)}>
                    <Forget size={17} />
                  </IconButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
