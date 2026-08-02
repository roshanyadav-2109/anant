import { useState } from 'react'
import { insights, sourceGlyph } from '@/lib/mockData'
import { logoFor } from '@/lib/logos'
import { Dismiss } from '@/icons'
import type { Insight, Provenance } from '@/lib/types'

/* ============================================================
   Insights — "The Ledger × Canvas"
   A chronological thread; each entry draws the link Anant made
   (origin → verb → conclusion). A right rail summarises what's
   there so the layout reads as one composition.
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

const humanProv: Record<Provenance, string> = {
  stated: 'Told to Anant',
  inferred: 'Anant inferred',
  aggregated: 'Noticed often',
}

function SourceNode({ ins }: { ins: Insight }) {
  const src = ins.source
  const logo = src && logoFor(src.kind)
  const Glyph = src ? sourceGlyph[src.kind] : null
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[var(--radius-lg)] bg-paper-raised px-3 py-2 shadow-[0_1px_2px_rgba(12,14,20,0.06)] ring-1 ring-rule/70">
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
      <span
        className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-[3px] bg-paper-raised"
        style={{ borderColor: color }}
      />

      <div className={resolved ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
        <div className="flex items-center gap-2.5 text-[0.75rem]">
          <span className="font-[500]" style={{ color }}>
            Anant {verb[ins.kind]}
          </span>
          {/today/i.test(ins.when) && ins.at && <span className="text-ink-soft">{ins.at}</span>}
        </div>

        <p className="mt-1.5 max-w-xl text-[1rem] leading-snug text-ink">{ins.title}</p>

        {/* the wiring — origin → verb → conclusion */}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-1 gap-y-2">
          <SourceNode ins={ins} />

          <span
            className="relative mx-1 hidden h-px w-8 sm:block"
            style={{ background: `color-mix(in srgb, ${color} 55%, transparent)` }}
          />
          <span
            className="rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-[500]"
            style={{ color, borderColor: `color-mix(in srgb, ${color} 40%, transparent)` }}
          >
            {edge[ins.kind]}
          </span>
          <span
            className="relative mx-1 hidden h-px w-8 sm:block"
            style={{ background: `color-mix(in srgb, ${color} 55%, transparent)` }}
          />

          <div
            className="rounded-[var(--radius-lg)] bg-[var(--color-royal-soft)] px-3 py-2 text-[0.8125rem] text-[var(--color-royal)] shadow-[0_1px_2px_rgba(79,70,229,0.12)] ring-1"
            style={{ ['--tw-ring-color' as string]: 'color-mix(in srgb, var(--color-royal) 26%, transparent)' }}
          >
            {conclusion[ins.kind]}
          </div>
        </div>

        {/* actions */}
        <div className="mt-3.5 flex items-center gap-3">
          {resolved ? (
            <span className="text-[0.8125rem]" style={{ color }}>
              {resolved === 'kept' ? 'Kept.' : 'Dismissed.'}{' '}
              <button
                className="font-[500] text-[var(--color-royal)] hover:underline"
                onClick={() => setResolved(null)}
              >
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
  // counts for the rail
  const byProv = insights.reduce<Record<string, number>>((acc, i) => {
    acc[i.provenance] = (acc[i.provenance] ?? 0) + 1
    return acc
  }, {})
  const provOrder: Provenance[] = ['stated', 'inferred', 'aggregated']
  const seenKind = new Set<string>()
  const sources = insights
    .map((i) => i.source)
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .filter((s) => (seenKind.has(s.kind) ? false : (seenKind.add(s.kind), true)))

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="grid max-w-5xl grid-cols-1 gap-x-14 px-9 py-11 lg:grid-cols-[minmax(0,1fr)_236px]">
        {/* thread */}
        <div className="min-w-0">
          <header className="mb-9">
            <h1 className="text-[1.375rem] tracking-[-0.02em] text-ink">What Anant has been noticing</h1>
          </header>

          <div className="relative">
            <div className="absolute bottom-3 left-[7px] top-3 w-px bg-royal-line/70" />
            {insights.map((ins, i) => (
              <Entry key={ins.id} ins={ins} last={i === insights.length - 1} />
            ))}
          </div>
        </div>

        {/* context rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 flex flex-col gap-3">
            <div className="rounded-[3px] bg-paper-raised p-5 shadow-[var(--shadow-card)] ring-1 ring-rule/60">
              <div className="flex items-baseline gap-2">
                <span className="text-[2.125rem] leading-none tracking-[-0.03em] tabular-nums text-ink">
                  {insights.length}
                </span>
                <span className="pb-0.5 text-[0.8125rem] text-ink-soft">to look at</span>
              </div>

              {/* distribution — the provenance mix, as a bar */}
              <div className="mt-4 flex h-2 gap-[3px]">
                {provOrder
                  .filter((p) => byProv[p])
                  .map((p) => (
                    <span
                      key={p}
                      className="rounded-full"
                      style={{ background: `var(--color-${p})`, flex: byProv[p] }}
                    />
                  ))}
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                {provOrder
                  .filter((p) => byProv[p])
                  .map((p) => (
                    <div key={p} className="flex items-center gap-2.5 text-[0.8125rem]">
                      <span className="h-2 w-2 rounded-full" style={{ background: `var(--color-${p})` }} />
                      <span className="text-ink">{humanProv[p]}</span>
                      <span className="ml-auto tabular-nums text-ink-soft">{byProv[p]}</span>
                    </div>
                  ))}
              </div>
            </div>

            {sources.length > 0 && (
              <div className="rounded-[3px] bg-paper-raised p-5 shadow-[var(--shadow-card)] ring-1 ring-rule/60">
                <div className="mb-3 text-[0.75rem] font-[500] text-ink">Drawn from</div>
                <div className="flex flex-col gap-2.5">
                  {sources.map((s) => {
                    const logo = logoFor(s.kind)
                    const Glyph = sourceGlyph[s.kind]
                    return (
                      <div key={s.kind} className="flex items-center gap-2.5 text-[0.8125rem] text-ink-soft">
                        {logo ? (
                          <img src={logo} alt="" className="h-4 w-4 shrink-0 object-contain" />
                        ) : (
                          <Glyph size={15} className="shrink-0 text-ink-muted" />
                        )}
                        <span className="truncate">{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
