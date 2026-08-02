import { useState } from 'react'
import { insights, provenanceLabel } from '@/lib/mockData'
import { ProvenanceDot, SourceChip } from '@/components/Provenance'
import { Dismiss } from '@/icons'
import type { Insight } from '@/lib/types'

/* ============================================================
   Insights — Direction 01 · "The Brief"
   A morning memo from your memory. Not cards — a typeset digest:
   one lead finding rendered large with its evidence, then shorter
   noticings numbered beneath it. Read top-to-bottom.
   ============================================================ */

const kindEyebrow: Record<Insight['kind'], string> = {
  connection: 'Two things line up',
  pattern: 'Something keeps coming up',
  contradiction: "Something doesn't match",
}

const primaryLabel: Record<Insight['kind'], string> = {
  connection: 'Keep this link',
  pattern: 'Keep this',
  contradiction: 'Review the conflict',
}

function today() {
  const d = new Date()
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

/* A slim confirm/dismiss control shared by lead + list items. */
function Actions({ kind, dense }: { kind: Insight['kind']; dense?: boolean }) {
  const [resolved, setResolved] = useState<null | 'kept' | 'dismissed'>(null)
  const size = dense ? 'text-[0.8125rem]' : 'text-[0.875rem]'

  if (resolved) {
    return (
      <span className={`${size} text-ink-muted`}>
        {resolved === 'kept' ? 'Kept — folded into memory.' : 'Dismissed.'}{' '}
        <button className="font-[500] text-[var(--color-royal)] hover:underline" onClick={() => setResolved(null)}>
          Undo
        </button>
      </span>
    )
  }

  if (dense) {
    return (
      <span className="flex items-center gap-3">
        <button
          className="font-[500] text-[var(--color-royal)] hover:underline text-[0.8125rem]"
          onClick={() => setResolved('kept')}
        >
          {primaryLabel[kind]}
        </button>
        <button className="text-[0.8125rem] text-ink-muted hover:text-ink" onClick={() => setResolved('dismissed')}>
          Dismiss
        </button>
      </span>
    )
  }

  return (
    <span className="flex items-center gap-3">
      <button
        className="rounded-[var(--radius)] bg-royal px-3.5 py-1.5 text-[0.875rem] font-[500] text-white transition-opacity hover:opacity-90"
        onClick={() => setResolved('kept')}
      >
        {primaryLabel[kind]}
      </button>
      <button
        className="inline-flex items-center gap-1.5 rounded-[var(--radius)] px-2.5 py-1.5 text-[0.875rem] text-ink-muted transition-colors hover:text-ink"
        onClick={() => setResolved('dismissed')}
      >
        <Dismiss size={15} />
        Dismiss
      </button>
    </span>
  )
}

export function InsightsPage() {
  const [lead, ...rest] = insights

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-8 py-11">
        {/* Masthead */}
        <header className="flex items-baseline justify-between border-b border-rule pb-5">
          <div>
            <h1 className="text-[1.5rem] tracking-[-0.02em] text-ink">Your memory brief</h1>
            <p className="mt-1.5 text-[0.875rem] text-ink-faint">
              {today()} · {insights.length} new {insights.length === 1 ? 'noticing' : 'noticings'}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-[500] text-[var(--color-inferred)]">
            <ProvenanceDot provenance="inferred" />
            Anant figured these out
          </span>
        </header>

        {/* Lead finding — the one worth reading first */}
        {lead && (
          <article className="rise border-b border-rule py-8">
            <div className="mb-3 flex items-center gap-2 text-[0.75rem] text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-[2px] bg-royal" />
              {kindEyebrow[lead.kind]}
            </div>
            <h2 className="max-w-xl text-[1.375rem] leading-[1.32] tracking-[-0.015em] text-ink">{lead.title}</h2>
            <p className="mt-3 max-w-xl text-[1rem] leading-relaxed text-ink-soft">
              <span className="italic text-ink-muted">I noticed — </span>
              {lead.body}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem]">
              <span
                className="inline-flex items-center gap-1.5 font-[500]"
                style={{ color: `var(--color-${lead.provenance})` }}
              >
                <ProvenanceDot provenance={lead.provenance} />
                {provenanceLabel[lead.provenance]}
                {lead.provenanceNote && <span className="font-[400] text-ink-faint">· {lead.provenanceNote}</span>}
              </span>
              {lead.source && <SourceChip source={lead.source} />}
            </div>

            <div className="mt-6">
              <Actions kind={lead.kind} />
            </div>
          </article>
        )}

        {/* The rest — shorter, numbered noticings */}
        <div className="divide-y divide-rule">
          {rest.map((ins, i) => (
            <article key={ins.id} className="rise flex gap-5 py-6" style={{ animationDelay: `${(i + 1) * 60}ms` }}>
              <div className="w-5 shrink-0 pt-0.5 text-[0.75rem] tabular-nums text-ink-faint">
                {String(i + 2).padStart(2, '0')}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[1.0625rem] leading-snug tracking-[-0.01em] text-ink">{ins.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">{ins.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span
                    className="inline-flex items-center gap-1.5 text-[0.8125rem] font-[500]"
                    style={{ color: `var(--color-${ins.provenance})` }}
                  >
                    <ProvenanceDot provenance={ins.provenance} />
                    {provenanceLabel[ins.provenance]}
                    {ins.provenanceNote && <span className="font-[400] text-ink-faint">· {ins.provenanceNote}</span>}
                  </span>
                  {ins.source && <SourceChip source={ins.source} />}
                  <span className="ml-auto">
                    <Actions kind={ins.kind} dense />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="pt-8 text-center text-[0.8125rem] text-ink-faint">
          That's everything Anant noticed. It reviews your memory quietly as new things come in.
        </p>
      </div>
    </div>
  )
}
