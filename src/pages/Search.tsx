import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProvenanceBadge, SourceChip } from '@/components/Provenance'
import { EmptyState } from '@/components/States'
import { Search as SearchGlyph } from '@/icons'
import { conversations, memories } from '@/lib/mockData'
import { relativeShort } from '@/lib/time'

type Scope = 'all' | 'memories' | 'conversations'

export function SearchPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [scope, setScope] = useState<Scope>('all')
  const query = q.trim().toLowerCase()

  // Empty query shows everything; typing filters live.
  const memHits = useMemo(
    () =>
      query
        ? memories.filter((m) => (m.fact + m.subject + m.category).toLowerCase().includes(query))
        : memories,
    [query],
  )
  const convHits = useMemo(
    () => (query ? conversations.filter((c) => c.title.toLowerCase().includes(query)) : conversations),
    [query],
  )

  const showMem = scope !== 'conversations'
  const showConv = scope !== 'memories'
  const visibleMem = showMem ? memHits : []
  const visibleConv = showConv ? convHits : []
  const total = visibleMem.length + visibleConv.length

  const scopes: { key: Scope; label: string; count: number }[] = [
    { key: 'all', label: 'Everything', count: memHits.length + convHits.length },
    { key: 'memories', label: 'Memories', count: memHits.length },
    { key: 'conversations', label: 'Conversations', count: convHits.length },
  ]

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="max-w-4xl px-9 py-8">
        {/* Search box */}
        <div className="relative">
          <SearchGlyph
            size={20}
            filled={false}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search everything Anant knows…"
            className="focus-ring w-full rounded-[var(--radius-lg)] bg-paper-raised py-3.5 pl-12 pr-4 text-[1.0625rem] text-ink shadow-[var(--shadow-card)] ring-1 ring-rule/60 placeholder:text-ink-faint"
          />
        </div>

        {/* Live scope filter */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {scopes.map((s) => {
            const active = scope === s.key
            return (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className={
                  'focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8125rem] transition-colors ' +
                  (active
                    ? 'bg-royal text-white'
                    : 'bg-paper-raised text-ink-soft ring-1 ring-rule hover:text-ink')
                }
              >
                {s.label}
                <span className={'tabular-nums ' + (active ? 'text-white/70' : 'text-ink-faint')}>{s.count}</span>
              </button>
            )
          })}
          {query && <span className="ml-1 text-[0.8125rem] text-ink-faint">for “{q}”</span>}
        </div>

        {/* Results */}
        {total === 0 ? (
          <EmptyState
            icon={SearchGlyph}
            title="Nothing found"
            body={`No ${scope === 'all' ? 'results' : scope} match “${q}”. Try a person or project name.`}
          />
        ) : (
          <div className="mt-7 space-y-8 pb-16">
            {visibleMem.length > 0 && (
              <section>
                <div className="mb-3 text-[0.75rem] font-[500] text-ink">
                  Memories <span className="tabular-nums text-ink-faint">{visibleMem.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {visibleMem.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => navigate('/memory', { state: { focusId: m.id } })}
                      className="focus-ring group rounded-[var(--radius-lg)] bg-paper-raised p-4 text-left shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70 transition-shadow hover:shadow-[var(--shadow-card)] hover:ring-ink-faint/50"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <ProvenanceBadge provenance={m.provenance} note={m.provenanceNote} />
                        <SourceChip source={m.source} />
                      </div>
                      <p className="text-[0.9375rem] leading-snug text-ink">{m.fact}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {visibleConv.length > 0 && (
              <section>
                <div className="mb-3 text-[0.75rem] font-[500] text-ink">
                  Conversations <span className="tabular-nums text-ink-faint">{visibleConv.length}</span>
                </div>
                <div className="space-y-2">
                  {visibleConv.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate('/chat', { state: { focusId: c.id } })}
                      className="focus-ring flex w-full items-center gap-3 rounded-[var(--radius-lg)] bg-paper-raised p-4 text-left shadow-[0_1px_2px_rgba(12,14,20,0.05)] ring-1 ring-rule/70 transition-shadow hover:shadow-[var(--shadow-card)] hover:ring-ink-faint/50"
                    >
                      <SourceChip source={{ kind: 'chat', label: 'Chat' }} />
                      <span className="text-[0.9375rem] text-ink">{c.title}</span>
                      <span className="ml-auto text-[0.75rem] text-ink-faint">{relativeShort(c.at)}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
