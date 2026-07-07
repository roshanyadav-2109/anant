import { useMemo, useState } from 'react'
import { TopBar } from '@/components/AppShell'
import { MemoryCard } from '@/components/MemoryCard'
import { Button, FilterChip, Segmented } from '@/components/ui'
import { Search as SearchGlyph, GraphView, ListView, Plus } from '@/icons'
import { memories } from '@/lib/mockData'
import { MemoryGraph } from '@/components/MemoryGraph'

export function MemoryPage() {
  const [view, setView] = useState<'list' | 'graph'>('list')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return memories
    return memories.filter(
      (m) =>
        m.fact.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q),
    )
  }, [query])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <>
      <TopBar
        title="Memory"
        intent="Everything Anant knows — and exactly where it came from."
        actions={
          <Button variant="outline" size="sm" leading={<Plus size={16} />}>
            Add memory
          </Button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-8 py-6">
          {/* Search + view toggle */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <SearchGlyph size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search memories, people, sources…"
                className="focus-ring w-full rounded-[var(--radius)] border border-rule bg-paper-raised py-2.5 pl-10 pr-4 text-[0.9375rem] text-ink placeholder:text-ink-faint"
              />
            </div>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: 'list', label: <><ListView size={16} /> List</> },
                { value: 'graph', label: <><GraphView size={16} /> Graph</> },
              ]}
            />
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <FilterChip label="All sources" />
            <FilterChip label="People" />
            <FilterChip label="This month" />
            <FilterChip label="High confidence" />
            <FilterChip label="Provenance" />
            {selected.size > 0 && (
              <div className="ml-auto flex items-center gap-2 text-[0.8125rem] text-ink-muted">
                <span className="font-[600] text-ink">{selected.size} selected</span>
                <button className="rounded-full border border-rule px-3 py-1 hover:border-ink-faint">Confirm</button>
                <button className="rounded-full border border-rule px-3 py-1 hover:border-ink-faint">Forget</button>
                <button className="text-ink-faint hover:text-ink" onClick={() => setSelected(new Set())}>
                  Clear
                </button>
              </div>
            )}
          </div>

          {view === 'list' ? (
            <div className="space-y-3 pb-16">
              {filtered.map((m, i) => (
                <div key={m.id} className="rise" style={{ animationDelay: `${i * 45}ms` }}>
                  <MemoryCard
                    memory={m}
                    selectable
                    selected={selected.has(m.id)}
                    onToggle={() => toggle(m.id)}
                  />
                </div>
              ))}
              <p className="pt-6 text-center text-[0.8125rem] text-ink-faint">
                {filtered.length} of {memories.length} memories · a virtualised list keeps this fast as it grows.
              </p>
            </div>
          ) : (
            <MemoryGraph />
          )}
        </div>
      </div>
    </>
  )
}
