import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import {
  fetchConnectors,
  fetchConversations,
  fetchInsights,
  fetchMembers,
  fetchMemories,
  getActiveWorkspaceId,
  type Member,
} from '@/lib/data'
import type { Connector, Conversation, Insight, Memory } from '@/lib/types'

/**
 * Loads all workspace-scoped data from Supabase once the user is signed in,
 * and exposes it to the app. Nothing here is hardcoded — every array comes
 * from the database (RLS-scoped to the signed-in user's workspace).
 */
interface DataValue {
  loading: boolean
  workspaceId: string | null
  memories: Memory[]
  insights: Insight[]
  connectors: Connector[]
  conversations: Conversation[]
  members: Member[]
  refresh: () => Promise<void>
}

const DataContext = createContext<DataValue | null>(null)

const empty: Omit<DataValue, 'loading' | 'refresh'> = {
  workspaceId: null,
  memories: [],
  insights: [],
  connectors: [],
  conversations: [],
  members: [],
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [state, setState] = useState(empty)

  const load = useCallback(async () => {
    if (!user) {
      setState(empty)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const workspaceId = await getActiveWorkspaceId()
      if (!workspaceId) {
        setState(empty)
        return
      }
      // Resilient: a failure in one fetch must not blank the others.
      const [memories, insights, connectors, conversations, members] = await Promise.all([
        fetchMemories(workspaceId).catch((e) => (console.error('memories', e), [])),
        fetchInsights(workspaceId).catch((e) => (console.error('insights', e), [])),
        fetchConnectors(workspaceId).catch((e) => (console.error('connectors', e), [])),
        fetchConversations(workspaceId).catch((e) => (console.error('conversations', e), [])),
        fetchMembers(workspaceId, user.email).catch((e) => (console.error('members', e), [])),
      ])
      setState({ workspaceId, memories, insights, connectors, conversations, members })
    } catch (e) {
      console.error('data load failed', e)
      setState(empty)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <DataContext.Provider value={{ loading, ...state, refresh: load }}>{children}</DataContext.Provider>
  )
}

export function useData(): DataValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
