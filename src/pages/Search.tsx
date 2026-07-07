import { useMemo, useState } from 'react'
import { TopBar } from '@/components/AppShell'
import { ProvenanceBadge, SourceChip } from '@/components/Provenance'
import { FilterChip } from '@/components/ui'
import { EmptyState } from '@/components/States'
import { Search as SearchGlyph } from '@/icons'
import { conversations, memories } from '@/lib/mockData'

export function SearchPage() {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()

  const memHits = useMemo(
    () =>
      query
        ? memories.filter((m) => (m.fact + m.subject + m.category).toLowerCase().includes(query))
        : [],
    [query],
  )
  const convHits = useMemo(
    () => (query ? conversations.filter((c) => c.title.toLowerCase().includes(query)) : []),
    [query],
  )
  const total = memHits.length + convHits.length

  return (
    <>
      <TopBar title="Search" intent="One box across memories, conversations, and connected sources." />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-6">
          <div className="relative">
            <SearchGlyph size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search everything Anant knows…"
              className="focus-ring w-full rounded-[var(--radius-lg)] border border-rule bg-paper-raised py-3.5 pl-12 pr-4 text-[1.0625rem] text-ink placeholder:text-ink-faint"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FilterChip label="All types" active />
            <FilterChip label="Only Slack" />
            <FilterChip label="Only email" />
            <FilterChip label="Any time" />
          </div>

          {!query ? (
            <EmptyState
              icon={SearchGlyph}
              title="Search your memory"
              body="Find a fact, a person, a conversation, or anything a connector brought in. Scope to a single source with the filters above."
            />
          ) : total === 0 ? (
            <EmptyState
              icon={SearchGlyph}
              title="Nothing found"
              body={`No memories or conversations match “${q}”. Try a person or project name.`}
            />
          ) : (
            <div className="mt-8 space-y-8 pb-16">
              {memHits.length > 0 && (
                <section>
                  <div className="eyebrow mb-3">Memories · {memHits.length}</div>
                  <div className="space-y-2">
                    {memHits.map((m) => (
                      <div key={m.id} className="rounded-[var(--radius)] border border-rule bg-paper-raised p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <ProvenanceBadge provenance={m.provenance} note={m.provenanceNote} />
                          <SourceChip source={m.source} />
                        </div>
                        <p className="font-display text-[0.9375rem] text-ink" style={{ fontVariationSettings: "'opsz' 32" }}>
                          {m.fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {convHits.length > 0 && (
                <section>
                  <div className="eyebrow mb-3">Conversations · {convHits.length}</div>
                  <div className="space-y-2">
                    {convHits.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 rounded-[var(--radius)] border border-rule bg-paper-raised p-4">
                        <SourceChip source={{ kind: 'chat', label: 'Chat' }} />
                        <span className="text-[0.9375rem] text-ink">{c.title}</span>
                        <span className="ml-auto text-[0.75rem] text-ink-faint">{c.when}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
