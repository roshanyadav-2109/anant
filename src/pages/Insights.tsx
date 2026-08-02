import { useState } from 'react'
import { insights, sourceGlyph } from '@/lib/mockData'
import { logoFor } from '@/lib/logos'
import { Dismiss } from '@/icons'
import type { Insight } from '@/lib/types'

/* ============================================================
   Insights — "The Ledger × Canvas"
   A chronological thread where each entry draws the link Anant
   made: origin → verb → conclusion, wired out visually. Terse,
   colour-led, keep/dismiss inline.
   ============================================================ */

const verb: Record<Insight['kind'], string> = {
  connection: 'linked two memories',
  pattern: 'saw a pattern',
  contradiction: 'found a mismatch',
}

const edge: Record<Insight['kind'], string> = {
  connection: 'points to',
  pattern: 'recurs as',
  contradiction: 'conflicts with',
}

const conclusion: Record<Insight['kind'], string> = {
  connection: 'a link worth keeping',
  pattern: 'a habit to protect',
  contradiction: 'a flag to resolve',
}

const keepLabel: Record<Insight['kind'], string> = {
  connection: 'Keep',
  pattern: 'Keep',
  contradiction: 'Resolve',
}

function SourceNode({ ins }: { ins: Insight }) {
  const src = ins.source
  const logo = src && logoFor(src.kind)
  const Glyph = src ? sourceGlyph[src.kind] : null
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[var(--radius-lg)] border border-rule bg-paper-raised px-3 py-2">
      {logo ? (
        <img src={logo} alt="" className="h-4 w-4 shrink-0 object-contain" />
      ) : Glyph ? (
        <Glyph size={15} className="shrink-0 text-ink-soft" />
      ) : null}
      <span className="truncate text-[0.8125rem] text-ink">{src?.label ?? 'Your memory'}</span>
    </div>
  )
}

function Entry({ ins, last }: { ins: Insight; last: boolean }) {
  const [resolved, setResolved] = useState<null | 'kept' | 'dismissed'>(null)
  const color = `var(--color-${ins.provenance})`

  return (
    <div className={'relative pl-9 ' + (last ? '' : 'pb-8')}>
      {/* spine node */}
      <span
        className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-[3px] bg-paper-raised"
        style={{ borderColor: color }}
      />

      <div className={resolved ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
        <div className="flex items-center gap-2.5 text-[0.75rem]">
          <span className="font-[500]" style={{ color }}>
            Anant {verb[ins.kind]}
          </span>
          {/today/i.test(ins.when) && <span className="text-ink-soft">today</span>}
        </div>

        <p className="mt-1.5 max-w-xl text-[1rem] leading-snug text-ink">{ins.title}</p>

        {/* the wiring — origin → verb → conclusion */}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-1 gap-y-2">
          <SourceNode ins={ins} />

          <span className="relative mx-1 hidden h-px w-8 sm:block" style={{ background: `color-mix(in srgb, ${color} 55%, transparent)` }} />
          <span
            className="rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-[500]"
            style={{ color, borderColor: `color-mix(in srgb, ${color} 40%, transparent)` }}
          >
            {edge[ins.kind]}
          </span>
          <span className="relative mx-1 hidden h-px w-8 sm:block" style={{ background: `color-mix(in srgb, ${color} 55%, transparent)` }} />

          <div
            className="rounded-[var(--radius-lg)] border bg-[var(--color-royal-soft)] px-3 py-2 text-[0.8125rem] text-[var(--color-royal)]"
            style={{ borderColor: 'color-mix(in srgb, var(--color-royal) 30%, transparent)' }}
          >
            {conclusion[ins.kind]}
          </div>
        </div>

        {/* actions */}
        <div className="mt-3.5 flex items-center gap-3">
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
                className="rounded-[var(--radius)] bg-royal px-3.5 py-1.5 text-[0.8125rem] font-[500] text-white transition-opacity hover:opacity-90"
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
        </div>
      </div>
    </div>
  )
}

export function InsightsPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="max-w-2xl px-9 py-10">
        <header className="mb-9">
          <h1 className="text-[1.375rem] tracking-[-0.02em] text-ink">What Anant has been noticing</h1>
        </header>

        {/* the thread */}
        <div className="relative">
          <div className="absolute bottom-3 left-[7px] top-3 w-px bg-royal-line/70" />
          {insights.map((ins, i) => (
            <Entry key={ins.id} ins={ins} last={i === insights.length - 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
