import { useState } from 'react'
import { useData } from '@/lib/dataStore'
import { Dismiss } from '@/icons'
import type { Insight } from '@/lib/types'

/* ============================================================
   Insights — what Anant noticed. Plain language: a short list of
   patterns and connections it found, each you can keep or dismiss.
   ============================================================ */

const kindMeta: Record<Insight['kind'], { label: string; color: string }> = {
  connection: { label: 'A connection', color: 'var(--color-inferred)' },
  pattern: { label: 'A pattern', color: 'var(--color-aggregated)' },
  contradiction: { label: 'Worth a check', color: 'var(--color-alert)' },
}

function InsightRow({ ins }: { ins: Insight }) {
  const [resolved, setResolved] = useState<null | 'kept' | 'dismissed'>(null)
  const meta = kindMeta[ins.kind]

  return (
    <article className="rounded-[var(--radius-lg)] bg-paper-raised p-5 shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70">
      <div className="mb-2 flex items-center gap-2 text-[0.8125rem]">
        <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
        <span className="font-[500]" style={{ color: meta.color }}>
          {meta.label}
        </span>
        {ins.confidence > 0 && (
          <span className="text-ink-faint">· {Math.round(ins.confidence * 100)}% sure</span>
        )}
      </div>

      <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink">{ins.body || ins.title}</p>

      <div className="mt-4 flex items-center gap-3">
        {resolved ? (
          <span className="text-[0.8125rem] text-ink-muted">
            {resolved === 'kept' ? 'Kept.' : 'Dismissed.'}{' '}
            <button className="font-[500] text-[var(--color-royal)] hover:underline" onClick={() => setResolved(null)}>
              Undo
            </button>
          </span>
        ) : (
          <>
            <button
              onClick={() => setResolved('kept')}
              className="rounded-[var(--radius)] bg-royal px-3.5 py-1.5 text-[0.8125rem] font-[500] text-white transition-opacity hover:opacity-90"
            >
              Keep
            </button>
            <button
              onClick={() => setResolved('dismissed')}
              className="inline-flex items-center gap-1 text-[0.8125rem] text-ink-soft transition-colors hover:text-ink"
            >
              <Dismiss size={14} />
              Dismiss
            </button>
          </>
        )}
      </div>
    </article>
  )
}

export function InsightsPage() {
  const { insights, loading } = useData()

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="max-w-2xl px-9 py-10">
        <header className="mb-2">
          <h1 className="text-[1.375rem] tracking-[-0.02em] text-ink">What Anant noticed</h1>
        </header>
        <p className="mb-7 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted">
          Patterns and connections Anant found across your memory. Keep the useful ones; dismiss the rest.
        </p>

        {loading ? (
          <p className="text-[0.9375rem] text-ink-faint">Loading…</p>
        ) : insights.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] bg-paper-raised p-8 text-center shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70">
            <p className="text-[0.95rem] text-ink">Nothing to show yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[0.875rem] text-ink-muted">
              As you chat and add memories, Anant spots patterns and connections and surfaces them here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-16">
            {insights.map((ins) => (
              <InsightRow key={ins.id} ins={ins} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
