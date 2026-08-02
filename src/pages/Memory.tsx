import { useMemo, useState } from 'react'
import { MemoryGraph } from '@/components/MemoryGraph'
import { ConfidenceMeter, ProvenanceDot } from '@/components/Provenance'
import { Button, cx, Segmented } from '@/components/ui'
import {
  ArrowRight, Confirm, Dismiss, Edit, Forget, GraphView, ListView,
  Memory as MemoryGlyph, Plus, Search as SearchGlyph, Sync,
} from '@/icons'
import { memories as seedMemories, sourceGlyph } from '@/lib/mockData'
import { logoFor } from '@/lib/logos'
import type { Memory, Provenance, SourceKind } from '@/lib/types'

const provOrder: Provenance[] = ['stated', 'inferred', 'aggregated']
const provShort: Record<Provenance, string> = {
  stated: 'Facts',
  inferred: 'Insights',
  aggregated: 'Patterns',
}
const provTitle: Record<Provenance, string> = {
  stated: 'Said directly',
  inferred: 'Anant figured this out',
  aggregated: 'A pattern Anant noticed',
}
const provNote: Record<Provenance, string> = {
  stated: 'Someone said this in so many words — Anant kept it exactly.',
  inferred: "This wasn't said outright; Anant worked it out from your activity.",
  aggregated: 'Anant saw this come up again and again, not just once.',
}

function SourceMark({ kind, size = 15 }: { kind: SourceKind; size?: number }) {
  const logo = logoFor(kind)
  if (logo) return <img src={logo} alt="" style={{ width: size, height: size }} className="object-contain" />
  const Glyph = sourceGlyph[kind]
  return <Glyph size={size} className="text-ink-muted" />
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2">
      <dt className="w-24 shrink-0 text-[0.8125rem] text-ink-muted">{label}</dt>
      <dd className="flex-1 text-[0.8125rem] text-ink">{children}</dd>
    </div>
  )
}

/* ---- The detail pane: a dedicated, designed record view ---------------- */
function MemoryDetail({
  memory, autoEdit, onEdit, onConfirm, onForget,
}: {
  memory: Memory
  autoEdit: boolean
  onEdit: (id: string, fact: string) => void
  onConfirm: (id: string) => void
  onForget: (id: string) => void
}) {
  const [editing, setEditing] = useState(autoEdit)
  const [draft, setDraft] = useState(memory.fact)

  function save() {
    const t = draft.trim()
    if (!t) return onForget(memory.id)
    onEdit(memory.id, t)
    setEditing(false)
  }

  return (
    <div className="flex min-h-full flex-col p-6">
      {memory.supersession && (
        <div className="mb-4 flex items-center gap-2 rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--color-supersede)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-supersede)_9%,transparent)] px-3 py-1.5 text-[0.75rem] text-[var(--color-supersede)]">
          <Sync size={13} />
          <span>was <span className="line-through opacity-80">{memory.supersession.from}</span> → now <span className="font-[600]">{memory.supersession.to}</span></span>
        </div>
      )}

      {editing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
            if (e.key === 'Escape') { setDraft(memory.fact); setEditing(false) }
          }}
          rows={3}
          placeholder="What should Anant remember?"
          className="focus-ring w-full resize-none rounded-[var(--radius)] border border-rule bg-veil px-3.5 py-3 text-[1.15rem] leading-snug text-ink placeholder:text-ink-faint"
        />
      ) : (
        <h2 className="text-[1.35rem] font-[500] leading-snug tracking-[-0.01em] text-ink">
          {memory.fact || 'Untitled memory'}
        </h2>
      )}

      {memory.detail && !editing && (
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{memory.detail}</p>
      )}

      {/* Where this came from — plain-language provenance */}
      <div className="mt-6">
        <div className="eyebrow mb-2">Where this came from</div>
        <div
          className="rounded-[var(--radius)] border border-rule bg-paper-sunk/60 p-3.5"
          style={{ borderLeft: `3px solid var(--color-${memory.provenance})` }}
        >
          <div className="flex items-center gap-2">
            <ProvenanceDot provenance={memory.provenance} />
            <span className="text-[0.9rem] font-[600] text-ink">{provTitle[memory.provenance]}</span>
          </div>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-soft">{provNote[memory.provenance]}</p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[0.8125rem] text-ink">
            <SourceMark kind={memory.source.kind} size={16} />
            <span>{memory.source.label}</span>
            {memory.source.speaker && <span className="text-ink-muted">· {memory.source.speaker}</span>}
            {memory.source.when && <span className="text-ink-muted">· {memory.source.when}</span>}
          </div>
        </div>
      </div>

      {/* Details */}
      <dl className="mt-5 divide-y divide-rule/70 border-y border-rule/70">
        <MetaRow label="About"><span className="font-[500]">{memory.subject}</span></MetaRow>
        {memory.category && <MetaRow label="Category">{memory.category}</MetaRow>}
        <MetaRow label="Updated">{memory.when}</MetaRow>
        <MetaRow label="How sure"><ConfidenceMeter value={memory.confidence} showLabel={false} /></MetaRow>
        {memory.confirmed && (
          <MetaRow label="Status"><span className="inline-flex items-center gap-1 text-[var(--color-stated)]"><Confirm size={14} /> Confirmed</span></MetaRow>
        )}
      </dl>

      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        {editing ? (
          <>
            <Button size="sm" variant="primary" onClick={save}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setDraft(memory.fact); setEditing(false) }}>Cancel</Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" leading={<Edit size={15} />} onClick={() => setEditing(true)}>Edit</Button>
            <Button size="sm" variant="outline" leading={<Confirm size={15} />} onClick={() => onConfirm(memory.id)}>
              {memory.confirmed ? 'Confirmed' : 'Confirm'}
            </Button>
            <Button size="sm" variant="ghost" leading={<Forget size={15} />} onClick={() => onForget(memory.id)}>Forget</Button>
            <button className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-[var(--radius)] px-2.5 py-1.5 text-[0.8125rem] font-[500] text-[var(--color-royal)] hover:underline">
              Open original <ArrowRight size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function MemoryPage() {
  const [items, setItems] = useState<Memory[]>(seedMemories)
  const [view, setView] = useState<'list' | 'graph'>('list')
  const [query, setQuery] = useState('')
  const [prov, setProv] = useState<Provenance | 'all'>('all')
  const [src, setSrc] = useState<SourceKind | 'all'>('all')
  const [subject, setSubject] = useState<string | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(seedMemories[0]?.id ?? null)
  const [newId, setNewId] = useState<string | null>(null)
  const [undo, setUndo] = useState<{ items: Memory[]; label: string } | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(
      (m) =>
        (prov === 'all' || m.provenance === prov) &&
        (src === 'all' || m.source.kind === src) &&
        (subject === 'all' || m.subject === subject) &&
        (!q || (m.fact + m.subject + (m.category ?? '')).toLowerCase().includes(q)),
    )
  }, [items, query, prov, src, subject])

  const sources = useMemo(() => [...new Set(items.map((m) => m.source.kind))], [items])
  const subjects = useMemo(() => [...new Set(items.map((m) => m.subject))], [items])

  const selected = items.find((m) => m.id === selectedId) ?? null
  const filtersActive = prov !== 'all' || src !== 'all' || subject !== 'all' || query.trim() !== ''

  function editMemory(id: string, fact: string) {
    setItems((xs) => xs.map((m) => (m.id === id ? { ...m, fact } : m)))
    if (newId === id) setNewId(null)
  }
  function confirmMemory(id: string) {
    setItems((xs) => xs.map((m) => (m.id === id ? { ...m, confirmed: true, confidence: 1 } : m)))
  }
  function forgetMemory(id: string) {
    setUndo({ items, label: 'Memory forgotten' })
    const rest = items.filter((m) => m.id !== id)
    setItems(rest)
    if (selectedId === id) setSelectedId(rest[0]?.id ?? null)
    if (newId === id) setNewId(null)
  }
  function addMemory() {
    const id = `m_${Date.now()}`
    const fresh: Memory = {
      id, fact: '', subject: 'You', category: 'Note', provenance: 'stated',
      source: { kind: 'chat', label: 'Chat', speaker: 'You' }, when: 'just now', confidence: 0.9,
    }
    setItems((xs) => [fresh, ...xs])
    setNewId(id)
    setSelectedId(id)
    setView('list')
    setProv('all'); setSrc('all'); setSubject('all'); setQuery('')
  }
  function clearFilters() { setProv('all'); setSrc('all'); setSubject('all'); setQuery('') }

  function FacetItem({ active, label, onClick, dot, kind }: {
    active: boolean; label: string; onClick: () => void; dot?: Provenance; kind?: SourceKind
  }) {
    return (
      <button
        onClick={onClick}
        className={cx('flex w-full items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-[0.9375rem] text-ink transition-colors',
          active ? 'bg-paper-sunk font-[500]' : 'font-[400] hover:bg-paper-sunk/60')}
      >
        {dot && <ProvenanceDot provenance={dot} />}
        {kind && <SourceMark kind={kind} size={14} />}
        <span className="flex-1 truncate">{label}</span>
      </button>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-rule px-6 py-3">
        <div className="relative max-w-md flex-1">
          <SearchGlyph size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories…"
            className="focus-ring w-full rounded-[var(--radius)] border border-rule bg-paper-raised py-2 pl-9 pr-3 text-[0.875rem] text-ink placeholder:text-ink-faint"
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
        <Button variant="primary" size="sm" leading={<Plus size={16} />} onClick={addMemory}>Add memory</Button>
      </div>

      {view === 'graph' ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5"><MemoryGraph /></div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[216px_minmax(0,1fr)_400px]">
          {/* Facet rail */}
          <aside className="min-h-0 overflow-y-auto border-r border-rule bg-paper-sunk/40 p-3">
            {filtersActive && (
              <button onClick={clearFilters} className="mb-1.5 flex w-full items-center justify-between rounded-[6px] px-2.5 py-1.5 text-left text-[0.8125rem] font-[500] text-[var(--color-royal)] hover:bg-paper-sunk">
                Clear filters
              </button>
            )}
            <div>
              <div className="mb-1 px-2.5 text-[0.9375rem] font-[600] text-ink">Type</div>
              <div className="space-y-0.5">
                {provOrder.map((p) => (
                  <FacetItem key={p} active={prov === p} label={provShort[p]} dot={p} onClick={() => setProv(prov === p ? 'all' : p)} />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 px-2.5 text-[0.9375rem] font-[600] text-ink">Sources</div>
              <div className="space-y-0.5">
                {sources.map((k) => (
                  <FacetItem key={k} active={src === k} label={k[0].toUpperCase() + k.slice(1)} kind={k} onClick={() => setSrc(src === k ? 'all' : k)} />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 px-2.5 text-[0.9375rem] font-[600] text-ink">People</div>
              <div className="space-y-0.5">
                {subjects.map((s) => (
                  <FacetItem key={s} active={subject === s} label={s} onClick={() => setSubject(subject === s ? 'all' : s)} />
                ))}
              </div>
            </div>
          </aside>

          {/* Compact list */}
          <div className="flex min-h-0 flex-col border-r border-rule">
            <div className="flex shrink-0 items-center justify-between border-b border-rule px-4 py-2 text-[0.72rem] text-ink-muted">
              <span>{filtered.length} {filtered.length === 1 ? 'memory' : 'memories'}</span>
              {filtersActive && <span>filtered</span>}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-5 py-12 text-center text-[0.875rem] text-ink-faint">No memories match these filters.</p>
              ) : (
                filtered.map((m) => {
                  const active = m.id === selectedId
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedId(m.id)}
                      className={cx('relative flex w-full items-start gap-2.5 border-b border-rule/60 px-4 py-3 text-left transition-colors',
                        active ? 'bg-evergreen-soft' : 'hover:bg-paper-sunk')}
                    >
                      {active && <span className="absolute left-0 top-0 h-full w-[2.5px] bg-[var(--color-royal)]" />}
                      <span className="mt-1"><ProvenanceDot provenance={m.provenance} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.875rem] text-ink">{m.fact || 'New memory'}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[0.72rem] text-ink-faint">
                          <SourceMark kind={m.source.kind} size={12} />
                          <span className="truncate">{m.subject} · {m.when}</span>
                        </span>
                      </span>
                      <span className="tnum mt-0.5 shrink-0 text-[0.6875rem] text-ink-faint">{Math.round(m.confidence * 100)}%</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Detail pane */}
          <div className="min-h-0 overflow-y-auto bg-paper-raised">
            {selected ? (
              <MemoryDetail
                key={selected.id}
                memory={selected}
                autoEdit={selected.id === newId}
                onEdit={editMemory}
                onConfirm={confirmMemory}
                onForget={forgetMemory}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-[10px] border border-rule bg-paper-sunk text-evergreen">
                  <MemoryGlyph size={24} />
                </span>
                <p className="text-[0.9375rem] font-[500] text-ink">Select a memory</p>
                <p className="mt-1 text-[0.8125rem] text-ink-muted">Pick one from the list to see its full provenance and controls.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {undo && (
        <div className="rise fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-[var(--radius)] border border-rule bg-ink px-4 py-2.5 text-[0.8125rem] text-white shadow-[var(--shadow-pop)]">
          <span>{undo.label}</span>
          <button onClick={() => { setItems(undo.items); setUndo(null) }} className="font-[600] text-white underline underline-offset-2">Undo</button>
          <button aria-label="Dismiss" onClick={() => setUndo(null)} className="text-white/70 hover:text-white"><Dismiss size={15} /></button>
        </div>
      )}
    </div>
  )
}
