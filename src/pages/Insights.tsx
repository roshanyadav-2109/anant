import { useState } from 'react'
import { insights } from '@/lib/mockData'
import { SourceChip } from '@/components/Provenance'
import { Dismiss } from '@/icons'
import type { Insight } from '@/lib/types'

/* ============================================================
   Insights — "The Ledger"
   A chronological spine — newest first, each entry the link Anant
   made, kept short. Keep or dismiss inline.
   ============================================================ */

const verb: Record<Insight['kind'], string> = {
  connection: 'linked two memories',
  pattern: 'saw a pattern',
  contradiction: 'found a mismatch',
}

const keepLabel: Record<Insight['kind'], string> = {
  connection: 'Keep',
  pattern: 'Keep',
  contradiction: 'Resolve',
}

function Entry({ ins, last }: { ins: Insight; last: boolean }) {
  const [resolved, setResolved] = useState<null | 'kept' | 'dismissed'>(null)
  const color = `var(--color-${ins.provenance})`

  return (
    <div className={'relative pl-8 ' + (last ? '' : 'pb-7')}>
      {/* spine node */}
      <span
        className="absolute left-[1px] top-[3px] h-[13px] w-[13px] rounded-full border-2 bg-paper-raised"
        style={{ borderColor: color }}
      />

      <div className={resolved ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
        <div className="flex items-center gap-2.5 text-[0.75rem]">
          <span className="font-[500]" style={{ color }}>
            Anant {verb[ins.kind]}
          </span>
          <span className="text-ink-faint">{ins.when}</span>
        </div>

        <p className="mt-1.5 max-w-xl text-[1rem] leading-snug text-ink">{ins.title}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {ins.source && <SourceChip source={ins.source} />}

          <span className="ml-auto flex items-center gap-3">
            {resolved ? (
              <span className="text-[0.8125rem]" style={{ color }}>
                {resolved === 'kept' ? 'Kept.' : 'Dismissed.'}{' '}
                <button className="font-[500] text-[var(--color-royal)] hover:underline" onClick={() => setResolved(null)}>
                  Undo
                </button>
              </span>
            ) : (
              <>
                <button
                  className="text-[0.8125rem] font-[500] text-[var(--color-royal)] hover:underline"
                  onClick={() => setResolved('kept')}
                >
                  {keepLabel[ins.kind]}
                </button>
                <button
                  className="inline-flex items-center gap-1 text-[0.8125rem] text-ink-soft transition-colors hover:text-ink"
                  onClick={() => setResolved('dismissed')}
                >
                  <Dismiss size={14} />
                  Dismiss
                </button>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export function InsightsPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-8 py-10">
        <header className="mb-8">
          <h1 className="text-[1.375rem] tracking-[-0.02em] text-ink">What Anant has been noticing</h1>
          <p className="mt-1.5 text-[0.875rem] text-ink-faint">Newest first</p>
        </header>

        {/* the thread */}
        <div className="relative">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-royal-line/70" />
          {insights.map((ins, i) => (
            <Entry key={ins.id} ins={ins} last={i === insights.length - 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
