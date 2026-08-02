import { useMemo, useState } from 'react'
import { MemoryCard } from '@/components/MemoryCard'
import { MemoryGraph } from '@/components/MemoryGraph'
import { ProvenanceDot } from '@/components/Provenance'
import { Button, FilterChip, Segmented } from '@/components/ui'
import { Confirm, Dismiss, Forget, GraphView, ListView, Plus, Search as SearchGlyph } from '@/icons'
import { memories as seedMemories, provenanceLabel } from '@/lib/mockData'
import type { Memory, Provenance } from '@/lib/types'

const provOrder: Provenance[] = ['stated', 'inferred', 'aggregated']

export function MemoryPage() {
  const [items, setItems] = useState<Memory[]>(seedMemories)
  const [view, setView] = useState<'list' | 'graph'>('list')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [undo, setUndo] = useState<{ items: Memory[]; label: string } | null>(null)
  const [newId, setNewId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (m) =>
        m.fact.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        (m.category ?? '').toLowerCase().includes(q),
    )
  }, [query, items])

  const counts = useMemo(() => {
    const by: Record<Provenance, number> = { stated: 0, inferred: 0, aggregated: 0 }
    items.forEach((m) => (by[m.provenance] += 1))
    return by
  }, [items])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function editMemory(id: string, fact: string) {
    setItems((xs) => xs.map((m) => (m.id === id ? { ...m, fact } : m)))
    if (newId === id) setNewId(null)
  }

  function confirmMemory(id: string) {
    setItems((xs) => xs.map((m) => (m.id === id ? { ...m, confirmed: true, confidence: 1 } : m)))
  }

  function forget(ids: string[], label: string) {
    if (!ids.length) return
    setUndo({ items, label })
    const set = new Set(ids)
    setItems((xs) => xs.filter((m) => !set.has(m.id)))
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach((i) => next.delete(i))
      return next
    })
    if (newId && set.has(newId)) setNewId(null)
  }

  function addMemory() {
    const id = `m_${Date.now()}`
    const fresh: Memory = {
      id,
      fact: '',
      subject: 'You',
      category: 'Note',
      provenance: 'stated',
      source: { kind: 'chat', label: 'Chat', speaker: 'You' },
      when: 'just now',
      confidence: 0.9,
    }
    setItems((xs) => [fresh, ...xs])
    setNewId(id)
    setView('list')
    setQuery('')
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 pb-16 pt-7">
        {/* Overview */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[var(--radius-lg)] border border-rule bg-paper-raised px-4 py-3">
            <div className="tnum text-[1.5rem] font-[600] leading-none text-ink">{items.length}</div>
            <div className="mt-1 text-[0.75rem] text-ink-faint">Total memories</div>
          </div>
          {provOrder.map((p) => (
            <div key={p} className="rounded-[var(--radius-lg)] border border-rule bg-paper-raised px-4 py-3">
              <div className="tnum text-[1.5rem] font-[600] leading-none text-ink">{counts[p]}</div>
              <div className="mt-1 flex items-center gap-1.5 text-[0.75rem] text-ink-faint">
                <ProvenanceDot provenance={p} />
                {provenanceLabel[p]}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
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
          <Button variant="primary" size="sm" leading={<Plus size={16} />} onClick={addMemory}>
            Add memory
          </Button>
        </div>

        {/* Filters / bulk actions */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <FilterChip label="All sources" />
          <FilterChip label="People" />
          <FilterChip label="This month" />
          <FilterChip label="High confidence" />
          <FilterChip label="Provenance" />
          {selected.size > 0 && (
            <div className="ml-auto flex items-center gap-2 text-[0.8125rem] text-ink">
              <span className="font-[600]">{selected.size} selected</span>
              <button
                onClick={() => {
                  ;[...selected].forEach(confirmMemory)
                  setSelected(new Set())
                }}
                className="inline-flex items-center gap-1 rounded-full border border-rule px-3 py-1 hover:border-ink-faint"
              >
                <Confirm size={13} /> Confirm
              </button>
              <button
                onClick={() => forget([...selected], `${selected.size} memories forgotten`)}
                className="inline-flex items-center gap-1 rounded-full border border-rule px-3 py-1 hover:border-ink-faint"
              >
                <Forget size={13} /> Forget
              </button>
              <button className="text-ink-faint hover:text-ink" onClick={() => setSelected(new Set())}>
                Clear
              </button>
            </div>
          )}
        </div>

        {view === 'list' ? (
          <div className="space-y-3">
            {filtered.map((m, i) => (
              <div key={m.id} className="rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <MemoryCard
                  memory={m}
                  selectable
                  selected={selected.has(m.id)}
                  onToggle={() => toggle(m.id)}
                  onEdit={editMemory}
                  onConfirm={confirmMemory}
                  onForget={(id) => forget([id], 'Memory forgotten')}
                  autoEdit={m.id === newId}
                />
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="rounded-[var(--radius-lg)] border border-dashed border-rule px-5 py-12 text-center text-[0.875rem] text-ink-faint">
                {query ? `No memories match “${query}”.` : 'No memories yet — add one to get started.'}
              </p>
            )}
            {filtered.length > 0 && (
              <p className="pt-4 text-center text-[0.8125rem] text-ink-faint">
                {filtered.length} of {items.length} memories
              </p>
            )}
          </div>
        ) : (
          <MemoryGraph />
        )}
      </div>

      {/* Undo bar */}
      {undo && (
        <div className="rise fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-[var(--radius)] border border-rule bg-ink px-4 py-2.5 text-[0.8125rem] text-white shadow-[var(--shadow-pop)]">
          <span>{undo.label}</span>
          <button
            onClick={() => {
              setItems(undo.items)
              setUndo(null)
            }}
            className="font-[600] text-white underline underline-offset-2"
          >
            Undo
          </button>
          <button aria-label="Dismiss" onClick={() => setUndo(null)} className="text-white/70 hover:text-white">
            <Dismiss size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
