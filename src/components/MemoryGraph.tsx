import { useEffect, useState } from 'react'
import { api } from '@/lib/anant'

/**
 * The memory graph — rendered from the engine's own interactive graph
 * (GET /api/graph → self-contained HTML). Nothing here is hardcoded; it fills
 * in as the engine builds entities and relationships.
 */
export function MemoryGraph(props: { query?: string }) {
  void props // the engine graph is self-contained; the list view handles search
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .graph()
      .then((r) => {
        if (!cancelled) {
          setHtml(r.html || '')
          setError(false)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-[0.9375rem] text-ink-faint">
        Building the graph…
      </div>
    )
  }
  if (error || !html) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
        <p className="text-[0.9375rem] text-ink">The graph is still forming</p>
        <p className="text-[0.8125rem] text-ink-muted">
          It fills in as Anant connects the people, projects and ideas in your memory.
        </p>
      </div>
    )
  }

  return (
    <iframe
      title="Memory graph"
      srcDoc={html}
      sandbox="allow-scripts allow-same-origin"
      className="h-full min-h-[520px] w-full rounded-[var(--radius-lg)] border border-rule bg-paper-raised"
    />
  )
}
