import { useMemo, useState } from 'react'
import { MemoryGraph } from '@/components/MemoryGraph'
import { ConfidenceMeter, ProvenanceDot } from '@/components/Provenance'
import { Button, cx } from '@/components/ui'
import {
  Aggregated, ArrowRight, Confirm, Dismiss, Edit, Forget, GraphView, Inferred, ListView,
  Plus, Search as SearchGlyph, Stated,
} from '@/icons'
import { memories as seedMemories, sourceGlyph } from '@/lib/mockData'
import { logoFor } from '@/lib/logos'
import type { Memory, Provenance, SourceKind } from '@/lib/types'

const provOrder: Provenance[] = ['stated', 'inferred', 'aggregated']
const provShort: Record<Provenance, string> = {
  stated: 'Told to Anant',
  inferred: 'Anant figured out',
  aggregated: 'Noticed often',
}
const provIcon = { stated: Stated, inferred: Inferred, aggregated: Aggregated } as const
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

function ProvGlyph({ p }: { p: Provenance }) {
  const I = provIcon[p]
  return <I size={16} style={{ color: `var(--color-${p})` }} />
}

/** Underline tabs — "List view" / "Graphical view". */
function ViewToggle({ value, onChange }: { value: 'list' | 'graph'; onChange: (v: 'list' | 'graph') => void }) {
  const opts = [
    { v: 'list' as const, I: ListView, label: 'List view' },
    { v: 'graph' as const, I: GraphView, label: 'Graphical view' },
  ]
  return (
    <div className="flex items-center gap-5">
      {opts.map(({ v, I, label }) => {
        const active = value === v
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            aria-pressed={active}
            className={cx(
              'focus-ring relative flex items-center gap-1.5 pb-1.5 text-[0.875rem] transition-colors',
              active ? 'font-[500] text-ink' : 'font-[400] text-ink-muted hover:text-ink',
            )}
          >
            <I size={16} className={active ? 'text-[var(--color-royal)]' : ''} />
            {label}
            {active && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[var(--color-royal)]" />}
          </button>
        )
      })}
    </div>
  )
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
  memory, autoEdit, onEdit, onConfirm, onForget, onClose,
}: {
  memory: Memory
  autoEdit: boolean
  onEdit: (id: string, fact: string) => void
  onConfirm: (id: string) => void
  onForget: (id: string) => void
  onClose: () => void
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
      <div className="mb-2 flex justify-end">
        <button aria-label="Close" onClick={onClose} className="focus-ring text-ink-muted transition-colors hover:text-ink">
          <Dismiss size={18} />
        </button>
      </div>

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

      {memory.supersession && !editing && (
        <p className="mt-3 text-[0.9rem] italic text-[var(--color-royal)]">
          Was {memory.supersession.from} — now {memory.supersession.to}. The earlier version is kept as history.
        </p>
      )}

      {/* Where this came from — plain text, no block */}
      <div className="mt-6">
        <div className="mb-2 text-[0.9rem] font-[500] text-ink">Where this came from</div>
        <div className="flex items-center gap-2">
          <ProvenanceDot provenance={memory.provenance} />
          <span className="text-[0.95rem] font-[500] text-ink">{provTitle[memory.provenance]}</span>
        </div>
        <p className="mt-1 text-[0.875rem] leading-relaxed text-ink">{provNote[memory.provenance]}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 text-[0.875rem] text-ink">
          <SourceMark kind={memory.source.kind} size={16} />
          <span>{memory.source.label}</span>
          {memory.source.speaker && <span>· {memory.source.speaker}</span>}
          {memory.source.when && <span>· {memory.source.when}</span>}
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
          active ? 'bg-paper-raised font-[500] shadow-[0_1px_2px_rgba(12,14,20,0.06)]' : 'font-[400] hover:bg-paper-raised/70')}
      >
        {dot && <ProvGlyph p={dot} />}
        {kind && <SourceMark kind={kind} size={14} />}
        <span className="flex-1 truncate">{label}</span>
      </button>
    )
  }

  const rail = (
    <aside className="flex min-h-0 w-[224px] shrink-0 flex-col overflow-y-auto border-r border-rule bg-paper-sunk/70 p-3">
      <Button variant="primary" className="mb-4 w-full justify-center" leading={<Plus size={16} />} onClick={addMemory}>
        Add memory
      </Button>
      {filtersActive && (
        <button onClick={clearFilters} className="mb-1.5 flex w-full items-center rounded-[6px] px-2.5 py-1.5 text-left text-[0.8125rem] font-[500] text-[var(--color-royal)] hover:bg-paper-sunk">
          Clear filters
        </button>
      )}
      <div>
        <div className="mb-1 px-2.5 text-[0.9375rem] font-[500] text-ink">Type</div>
        <div className="space-y-0.5">
          {provOrder.map((p) => (
            <FacetItem key={p} active={prov === p} label={provShort[p]} dot={p} onClick={() => setProv(prov === p ? 'all' : p)} />
          ))}
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 px-2.5 text-[0.9375rem] font-[500] text-ink">Sources</div>
        <div className="space-y-0.5">
          {sources.map((k) => (
            <FacetItem key={k} active={src === k} label={k[0].toUpperCase() + k.slice(1)} kind={k} onClick={() => setSrc(src === k ? 'all' : k)} />
          ))}
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 px-2.5 text-[0.9375rem] font-[500] text-ink">People</div>
        <div className="space-y-0.5">
          {subjects.map((s) => (
            <FacetItem key={s} active={subject === s} label={s} onClick={() => setSubject(subject === s ? 'all' : s)} />
          ))}
        </div>
      </div>
    </aside>
  )

  const middleHeader = (
    <div className="flex shrink-0 items-center gap-3 border-b border-rule px-4 py-3">
      <div className="relative flex-1">
        <SearchGlyph size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memories…"
          className="focus-ring w-full rounded-[var(--radius)] border border-rule bg-paper-raised py-2 pl-9 pr-3 text-[0.875rem] text-ink placeholder:text-ink-faint"
        />
      </div>
      <ViewToggle value={view} onChange={setView} />
    </div>
  )

  return (
    <div className="flex h-full min-h-0">
      {rail}

      {/* Content region — header spans the middle + right columns */}
      <div className="flex min-h-0 flex-1 flex-col bg-paper-raised">
        {middleHeader}

        {view === 'graph' ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5"><MemoryGraph query={query} /></div>
        ) : (
          <div className={cx('grid min-h-0 flex-1', selected ? 'grid-cols-[minmax(0,1fr)_400px]' : 'grid-cols-1')}>
            {/* Middle column: the list */}
            <div className="flex min-h-0 flex-col">
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
                      <span className="mt-0.5"><ProvGlyph p={m.provenance} /></span>
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

          {/* Detail pane — collapses (reflows) when closed */}
          {selected && (
            <div className="slide-in-right min-h-0 overflow-y-auto border-l border-rule bg-paper-raised">
              <MemoryDetail
                key={selected.id}
                memory={selected}
                autoEdit={selected.id === newId}
                onEdit={editMemory}
                onConfirm={confirmMemory}
                onForget={forgetMemory}
                onClose={() => setSelectedId(null)}
              />
            </div>
          )}
        </div>
        )}
      </div>

      {undo && (
        <div className="rise fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-[var(--radius)] border border-rule bg-ink px-4 py-2.5 text-[0.8125rem] text-white shadow-[var(--shadow-pop)]">
          <span>{undo.label}</span>
          <button onClick={() => { setItems(undo.items); setUndo(null) }} className="font-[500] text-white underline underline-offset-2">Undo</button>
          <button aria-label="Dismiss" onClick={() => setUndo(null)} className="text-white/70 hover:text-white"><Dismiss size={15} /></button>
        </div>
      )}
    </div>
  )
}
