import { useState } from 'react'
import { insights, provenanceLabel, sourceGlyph } from '@/lib/mockData'
import { logoFor } from '@/lib/logos'
import { ProvenanceDot } from '@/components/Provenance'
import { Dismiss } from '@/icons'
import type { Insight } from '@/lib/types'

/* ============================================================
   Insights — Direction 03 · "The Connection Canvas"
   Pick a noticing on the left; see the wiring on the right — the
   origin and the conclusion drawn as two nodes with the link
   between them, then the evidence and confidence. Reasoning made
   inspectable, so a skeptical user can see exactly *why*.
   ============================================================ */

const railTitle: Record<Insight['kind'], string> = {
  connection: 'A connection',
  pattern: 'A recurring theme',
  contradiction: 'A mismatch',
}

const edgeVerb: Record<Insight['kind'], string> = {
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
  connection: 'Keep this link',
  pattern: 'Keep this',
  contradiction: 'Resolve it',
}

/* A single node in the reasoning diagram. */
function Node({
  eyebrow,
  title,
  sub,
  accent,
  logo,
}: {
  eyebrow: string
  title: string
  sub?: string
  accent?: boolean
  logo?: React.ReactNode
}) {
  return (
    <div
      className={
        'flex-1 rounded-[var(--radius-lg)] border bg-paper-raised p-3.5 ' +
        (accent ? 'border-[color-mix(in_srgb,var(--color-royal)_40%,transparent)]' : 'border-rule')
      }
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] uppercase tracking-[0.1em] text-ink-faint">
        {logo}
        {eyebrow}
      </div>
      <div className="text-[0.875rem] leading-snug text-ink">{title}</div>
      {sub && <div className="mt-1 text-[0.75rem] text-ink-faint">{sub}</div>}
    </div>
  )
}

export function InsightsPage() {
  const [selectedId, setSelectedId] = useState(insights[0]?.id)
  const [outcomes, setOutcomes] = useState<Record<string, 'kept' | 'dismissed'>>({})
  const selected = insights.find((i) => i.id === selectedId) ?? null

  function resolve(id: string, outcome: 'kept' | 'dismissed') {
    setOutcomes((o) => ({ ...o, [id]: outcome }))
    const next = insights.find((i) => i.id !== id && !outcomes[i.id])
    if (next) setSelectedId(next.id)
  }

  const pending = insights.filter((i) => !outcomes[i.id]).length

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr]">
      {/* Left rail — the list of noticings */}
      <aside className="min-h-0 overflow-y-auto border-r border-rule bg-paper-sunk/60 px-3 py-4">
        <div className="mb-3 px-2 text-[0.6875rem] uppercase tracking-[0.12em] text-ink-faint">
          {pending} to review
        </div>
        <div className="flex flex-col gap-1">
          {insights.map((ins) => {
            const active = ins.id === selectedId
            const settled = outcomes[ins.id]
            return (
              <button
                key={ins.id}
                onClick={() => setSelectedId(ins.id)}
                className={
                  'rounded-[var(--radius)] px-2.5 py-2 text-left transition-colors ' +
                  (active
                    ? 'border border-royal bg-paper-raised shadow-[var(--shadow-card)]'
                    : 'border border-transparent hover:bg-paper-raised/60')
                }
              >
                <div className="flex items-center gap-2">
                  <ProvenanceDot provenance={ins.provenance} />
                  <span className={'text-[0.8125rem] ' + (active ? 'text-ink' : 'text-ink-soft')}>
                    {railTitle[ins.kind]}
                  </span>
                  {settled && (
                    <span className="ml-auto text-[0.6875rem] text-ink-faint">
                      {settled === 'kept' ? 'kept' : 'dismissed'}
                    </span>
                  )}
                </div>
                <div className="mt-1 truncate pl-5 text-[0.75rem] text-ink-faint">{ins.source?.label}</div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Right — the reasoning */}
      <section className="min-h-0 overflow-y-auto">
        {selected ? (
          <div key={selected.id} className="fade mx-auto max-w-2xl px-9 py-9">
            <div
              className="mb-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-[500]"
              style={{ color: `var(--color-${selected.provenance})` }}
            >
              <ProvenanceDot provenance={selected.provenance} />
              {selected.provenance === 'stated'
                ? 'You told Anant this'
                : 'Anant connected these — you didn’t say it'}
            </div>

            <h2 className="max-w-xl text-[1.375rem] leading-[1.3] tracking-[-0.015em] text-ink">{selected.title}</h2>
            <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-soft">
              <span className="italic text-ink-muted">I noticed — </span>
              {selected.body}
            </p>

            {/* the wiring */}
            <div className="mt-7 flex items-stretch gap-0">
              <Node
                eyebrow="Where it came from"
                title={selected.source?.label ?? 'Your memory'}
                sub={selected.source?.when}
                logo={
                  selected.source &&
                  (logoFor(selected.source.kind) ? (
                    <img src={logoFor(selected.source.kind)!} alt="" className="h-3.5 w-3.5 object-contain" />
                  ) : (
                    (() => {
                      const G = sourceGlyph[selected.source.kind]
                      return <G size={13} className="text-ink-muted" />
                    })()
                  ))
                }
              />
              <div className="relative flex w-24 shrink-0 items-center justify-center">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[color-mix(in_srgb,var(--color-royal)_45%,transparent)]" />
                <span className="relative rounded-full border border-[color-mix(in_srgb,var(--color-royal)_40%,transparent)] bg-paper px-2.5 py-0.5 text-[0.6875rem] text-[var(--color-royal)]">
                  {edgeVerb[selected.kind]}
                </span>
              </div>
              <Node eyebrow="What Anant sees" title={conclusion[selected.kind]} accent />
            </div>

            {/* evidence footer */}
            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-rule pt-5">
              <div>
                <div className="text-[0.6875rem] uppercase tracking-[0.1em] text-ink-faint">Provenance</div>
                <div
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[0.875rem] font-[500]"
                  style={{ color: `var(--color-${selected.provenance})` }}
                >
                  <ProvenanceDot provenance={selected.provenance} />
                  {provenanceLabel[selected.provenance]}
                  {selected.provenanceNote && (
                    <span className="font-[400] text-ink-faint">· {selected.provenanceNote}</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[0.6875rem] uppercase tracking-[0.1em] text-ink-faint">How sure</div>
                <div className="mt-1.5 text-[0.875rem] text-ink">{Math.round(selected.confidence * 100)}% · {selected.when}</div>
              </div>
            </div>

            {/* actions */}
            {outcomes[selected.id] ? (
              <div className="mt-7 text-[0.875rem] text-ink-muted">
                {outcomes[selected.id] === 'kept' ? 'Kept — folded into memory.' : 'Dismissed.'}{' '}
                <button
                  className="font-[500] text-[var(--color-royal)] hover:underline"
                  onClick={() => setOutcomes((o) => { const n = { ...o }; delete n[selected.id]; return n })}
                >
                  Undo
                </button>
              </div>
            ) : (
              <div className="mt-7 flex items-center gap-2.5">
                <button
                  className="rounded-[var(--radius)] bg-royal px-4 py-2 text-[0.9375rem] font-[500] text-white transition-opacity hover:opacity-90"
                  onClick={() => resolve(selected.id, 'kept')}
                >
                  {keepLabel[selected.kind]}
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-rule px-4 py-2 text-[0.9375rem] text-ink-soft transition-colors hover:border-ink-faint"
                  onClick={() => resolve(selected.id, 'dismissed')}
                >
                  <Dismiss size={16} />
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-[0.9375rem] text-ink-faint">
            Select a noticing to see the reasoning.
          </div>
        )}
      </section>
    </div>
  )
}
