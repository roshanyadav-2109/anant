import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import { api, type AnantProfile } from '@/lib/anant'
import { connectorCatalog } from '@/lib/catalog'
import type { Connector, Conversation, Insight, Memory, SourceKind } from '@/lib/types'

/** Best-effort source from the engine's memory category (it has no source field). */
function sourceFromCategory(cat: string): { kind: SourceKind; label: string } {
  const c = cat.toLowerCase()
  if (/gmail|e-?mail/.test(c)) return { kind: 'gmail', label: 'Gmail' }
  if (/slack|channel/.test(c)) return { kind: 'slack', label: 'Slack' }
  if (/github|repo|commit|pull request|\bpr\b|issue|code/.test(c)) return { kind: 'github', label: 'GitHub' }
  if (/notion/.test(c)) return { kind: 'notion', label: 'Notion' }
  if (/linear/.test(c)) return { kind: 'linear', label: 'Linear' }
  if (/drive|doc|sheet|slide|spreadsheet|presentation|\bfile\b|document/.test(c))
    return { kind: 'drive', label: 'Google Drive' }
  if (/calendar|event|meeting/.test(c)) return { kind: 'calendar', label: 'Calendar' }
  return { kind: 'chat', label: 'Chat' }
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
      mem.memories.map((m, i) => ({
        id: `mem_${i}_${m.created_at}`,
        fact: m.content,
        subject: m.category || 'Memory',
        category: m.category || '',
        provenance: 'stated',
        source: sourceFromCategory(m.category || ''),
        when: m.created_at ?? '',
        confidence: 1,
      })),
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
