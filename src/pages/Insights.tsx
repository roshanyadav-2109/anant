import { useCallback, useEffect, useState } from 'react'
import { insights, provenanceLabel } from '@/lib/mockData'
import { ProvenanceDot, SourceChip } from '@/components/Provenance'
import { Dismiss } from '@/icons'
import type { Insight } from '@/lib/types'

/* ============================================================
   Insights — Direction 02 · "The Triage Deck"
   One insight, full focus. The connected pair is laid out, a big
   yes/no, then the next card. A counter burns down. Keyboard-fast:
   ↵ keep · X dismiss · → skip.
   ============================================================ */

const kindEyebrow: Record<Insight['kind'], string> = {
  connection: 'Two things line up — worth a look',
  pattern: 'A pattern worth a decision',
  contradiction: "These don't match — worth a decision",
}

const keepLabel: Record<Insight['kind'], string> = {
  connection: 'Keep this link',
  pattern: 'Keep this',
  contradiction: 'Resolve it',
}

export function InsightsPage() {
  const total = insights.length
  const [index, setIndex] = useState(0)
  const [outcomes, setOutcomes] = useState<Record<string, 'kept' | 'dismissed'>>({})

  const done = index >= total
  const current = done ? null : insights[index]
  const decided = Object.keys(outcomes).length

  const advance = useCallback(() => setIndex((i) => Math.min(i + 1, total)), [total])
  const resolve = useCallback(
    (id: string, outcome: 'kept' | 'dismissed') => {
      setOutcomes((o) => ({ ...o, [id]: outcome }))
      advance()
    },
    [advance],
  )

  useEffect(() => {
    if (!current) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') resolve(current.id, 'kept')
      else if (e.key.toLowerCase() === 'x') resolve(current.id, 'dismissed')
      else if (e.key === 'ArrowRight') advance()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, resolve, advance])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Progress strip */}
      <div className="flex items-center gap-3 border-b border-rule px-8 py-3.5">
        <span className="text-[0.8125rem] text-ink-muted">Reviewing what Anant noticed</span>
        <span className="text-[0.8125rem] tabular-nums text-ink">
          {Math.min(index + (done ? 0 : 1), total)} <span className="text-ink-faint">of</span> {total}
        </span>
        <div className="mx-2 h-1 flex-1 overflow-hidden rounded-full bg-paper-sunk">
          <div
            className="h-full rounded-full bg-royal transition-[width] duration-300"
            style={{ width: `${(decided / total) * 100}%` }}
          />
        </div>
        <span className="text-[0.75rem] text-ink-faint">
          {total - decided} {total - decided === 1 ? 'left' : 'left'}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-8 py-10">
        {current ? (
          <div key={current.id} className="rise relative w-full max-w-xl">
            {/* faint stacked cards behind, hinting at the queue */}
            {index < total - 1 && (
              <>
                <div className="absolute inset-x-6 -top-3 h-10 rounded-[var(--radius-lg)] border border-rule bg-paper-raised/60" />
                {index < total - 2 && (
                  <div className="absolute inset-x-10 -top-6 h-10 rounded-[var(--radius-lg)] border border-rule bg-paper-raised/40" />
                )}
              </>
            )}

            <article className="relative rounded-[var(--radius-lg)] border border-rule bg-paper-raised p-8 shadow-[var(--shadow-card)]">
              <div className="mb-4 flex items-center gap-2 text-[0.75rem] text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-[2px] bg-royal" />
                {kindEyebrow[current.kind]}
              </div>

              <h2 className="text-[1.5rem] leading-[1.28] tracking-[-0.015em] text-ink">{current.title}</h2>
              <p className="mt-4 text-[1rem] leading-relaxed text-ink-soft">
                <span className="italic text-ink-muted">I noticed — </span>
                {current.body}
              </p>

              {/* evidence */}
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule/70 pt-5 text-[0.8125rem]">
                <span
                  className="inline-flex items-center gap-1.5 font-[500]"
                  style={{ color: `var(--color-${current.provenance})` }}
                >
                  <ProvenanceDot provenance={current.provenance} />
                  {provenanceLabel[current.provenance]}
                  {current.provenanceNote && (
                    <span className="font-[400] text-ink-faint">· {current.provenanceNote}</span>
                  )}
                </span>
                {current.source && <SourceChip source={current.source} />}
                <span className="ml-auto text-ink-faint">
                  {Math.round(current.confidence * 100)}% sure
                </span>
              </div>

              {/* decision */}
              <div className="mt-7 flex items-center gap-2.5">
                <button
                  className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-royal px-4 py-2 text-[0.9375rem] font-[500] text-white transition-opacity hover:opacity-90"
                  onClick={() => resolve(current.id, 'kept')}
                >
                  {keepLabel[current.kind]}
                  <span className="opacity-70">↵</span>
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-rule px-4 py-2 text-[0.9375rem] text-ink-soft transition-colors hover:border-ink-faint"
                  onClick={() => resolve(current.id, 'dismissed')}
                >
                  <Dismiss size={16} />
                  Dismiss
                </button>
                <button
                  className="ml-auto text-[0.875rem] text-ink-muted transition-colors hover:text-ink"
                  onClick={advance}
                >
                  Skip for now →
                </button>
              </div>

              <div className="mt-5 flex gap-4 text-[0.6875rem] text-ink-faint">
                <span><b className="font-[500] text-ink-muted">↵</b> keep</span>
                <span><b className="font-[500] text-ink-muted">X</b> dismiss</span>
                <span><b className="font-[500] text-ink-muted">→</b> next</span>
              </div>
            </article>
          </div>
        ) : (
          /* done state */
          <div className="rise text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-royal-soft)] text-[var(--color-royal)]">
              <ProvenanceDot provenance="inferred" />
            </div>
            <h2 className="text-[1.25rem] tracking-[-0.015em] text-ink">You're all caught up</h2>
            <p className="mx-auto mt-2 max-w-sm text-[0.9375rem] text-ink-muted">
              You reviewed everything Anant noticed —{' '}
              {Object.values(outcomes).filter((o) => o === 'kept').length} kept,{' '}
              {Object.values(outcomes).filter((o) => o === 'dismissed').length} dismissed.
            </p>
            <button
              className="mt-6 rounded-[var(--radius)] border border-rule px-4 py-2 text-[0.875rem] text-ink-soft transition-colors hover:border-ink-faint"
              onClick={() => {
                setOutcomes({})
                setIndex(0)
              }}
            >
              Review again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
