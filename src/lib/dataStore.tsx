import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import { api, type AnantProfile } from '@/lib/anant'
import { connectorCatalog } from '@/lib/catalog'
import type { Connector, Conversation, Insight, Memory, Provenance, SourceKind } from '@/lib/types'

/**
 * The engine's memory object is only { category, content, created_at } — no
 * source field — and `category` is a content type (conversation | factual |
 * emotional | goal | relational). So the source can only be *inferred from the
 * content* (best-effort; the engine should return a real source field). And
 * provenance is derived from the category.
 */
function sourceFor(content: string, category: string): { kind: SourceKind; label: string } {
  const c = content.toLowerCase()
  if (/\bspreadsheet\b|google sheet|\btab\(s\)|\bslides?\b|presentation|google doc|\bdrive\b/.test(c))
    return { kind: 'drive', label: 'Google Drive' }
  if (/^\s*email\b|^\s*subject:|from:\s*.*@|\bgmail\b|\binbox\b/.test(c)) return { kind: 'gmail', label: 'Gmail' }
  if (/pull request|\bpr #|\bissue #|\bcommit\b|\brepository\b|github/.test(c)) return { kind: 'github', label: 'GitHub' }
  if (/\bslack\b|#[a-z0-9_-]+\s+channel/.test(c)) return { kind: 'slack', label: 'Slack' }
  if (/\bnotion\b/.test(c)) return { kind: 'notion', label: 'Notion' }
  if (/\blinear\b|\bLIN-\d/.test(content)) return { kind: 'linear', label: 'Linear' }
  if (/\bcalendar\b|\bmeeting\b|\bevent\b/.test(c)) return { kind: 'calendar', label: 'Calendar' }
  // Fall back to a neutral label rather than a wrong specific source.
  return { kind: 'chat', label: category === 'conversation' ? 'Chat' : 'Anant memory' }
}

function provFor(category: string): Provenance {
  const c = category.toLowerCase()
  if (c === 'emotional' || c === 'relational') return 'inferred'
  return 'stated'
}

/** A short, human title for a memory — the quoted name if any, else the opening words. */
function titleFor(content: string, category: string): string {
  const quoted = content.match(/["'“']([^"'”']{2,60})["'”']/)
  if (quoted) return quoted[1].trim()
  const firstLine = content.split('\n').map((s) => s.trim()).find(Boolean) || ''
  if (!firstLine) return category ? category[0].toUpperCase() + category.slice(1) : 'Memory'
  const words = firstLine.split(/\s+/).slice(0, 6).join(' ')
  return firstLine.length > words.length ? words + '…' : words
}

/** Turn the engine's raw timestamp ("2026-08-03 18:49:59.632580+00:00") into a friendly label. */
function whenLabel(iso?: string): string {
  if (!iso) return ''
  const t = Date.parse(iso.replace(' ', 'T').replace(/(\.\d{3})\d+/, '$1'))
  if (!t) return ''
  const m = Math.floor((Date.now() - t) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Loads workspace data from the Anant Engine once the user is signed in and
 * maps it into the app's view types. Nothing is hardcoded — memories,
 * insights, conversations, profile and members all come from the engine.
 */
export interface Member {
  name: string
  email: string
  role: 'Admin' | 'Member' | 'Viewer'
  access: string
  you: boolean
}

interface DataValue {
  loading: boolean
  memories: Memory[]
  insights: Insight[]
  connectors: Connector[]
  conversations: Conversation[]
  members: Member[]
  profile: AnantProfile | null
  stats: { entities: number; memories: number; relationships: number; emotions: number; patterns: number } | null
  refresh: () => Promise<void>
}

const DataContext = createContext<DataValue | null>(null)

const kindFor = (t: string): Insight['kind'] => {
  const s = t.toLowerCase()
  if (s.includes('connect') || s.includes('relation')) return 'connection'
  if (s.includes('conflict') || s.includes('contradict')) return 'contradiction'
  return 'pattern'
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [memories, setMemories] = useState<Memory[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [profile, setProfile] = useState<AnantProfile | null>(null)
  const [stats, setStats] = useState<DataValue['stats']>(null)

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    const [mem, pat, convs, prof, st] = await Promise.all([
      api.memories(50).catch(() => ({ memories: [], total: 0 })),
      api.patterns().catch(() => ({ patterns: [] })),
      api.listConversations(50).catch(() => ({ conversations: [] })),
      api.profile().catch(() => null),
      api.stats().catch(() => null),
    ])

    setMemories(
      mem.memories.map((m, i) => {
        const content = m.content || ''
        const category = m.category || ''
        return {
          id: `mem_${i}_${m.created_at}`,
          fact: content,
          subject: titleFor(content, category),
          category,
          provenance: provFor(category),
          source: sourceFor(content, category),
          when: whenLabel(m.created_at),
          confidence: 1,
        }
      }),
    )
    setInsights(
      pat.patterns.map((p, i) => ({
        id: `pat_${i}`,
        kind: kindFor(p.type),
        title: p.type,
        body: p.description,
        provenance: 'inferred',
        when: '',
        confidence: p.confidence ?? 0.5,
      })),
    )
    setConversations(
      convs.conversations.map((cv) => ({
        id: cv.id,
        title: cv.title || 'Conversation',
        at: Date.parse(cv.updated_at || cv.created_at || '') || 0,
        messages: [],
      })),
    )
    setProfile(prof)
    setStats(st)

    if (user.accountType === 'team' && user.orgId) {
      const res = await api.members(user.orgId).catch(() => ({ members: [] }))
      const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
      setMembers(
        res.members.map((m) => ({
          name: m.username,
          email: '',
          role: (m.role === 'owner' ? 'Admin' : cap(m.role)) as Member['role'],
          access: m.role === 'member' ? 'Shared only' : 'Private + shared',
          you: m.user_id === user.userId,
        })),
      )
    } else {
      setMembers([])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <DataContext.Provider
      value={{ loading, memories, insights, connectors: connectorCatalog, conversations, members, profile, stats, refresh: load }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
