import { TopBar } from '@/components/AppShell'
import { InsightCard } from '@/components/InsightCard'
import { insights } from '@/lib/mockData'

export function InsightsPage() {
  return (
    <>
      <TopBar title="Insights" intent="What Anant noticed while consolidating — its own inferences, never fact." />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-6">
          <div className="mb-6 rounded-[var(--radius-lg)] border border-rule bg-paper-raised px-5 py-4">
            <p className="text-[0.9375rem] leading-relaxed text-ink-soft">
              While you were away, Anant reviewed what it knows and surfaced a few things. These are
              <span className="font-[600] text-ink"> its own inferences</span> — confirm one to fold it into
              memory, or dismiss it.
            </p>
          </div>

          <div className="space-y-3 pb-16">
            {insights.map((ins, i) => (
              <div key={ins.id} className="rise" style={{ animationDelay: `${i * 70}ms` }}>
                <InsightCard insight={ins} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
