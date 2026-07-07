import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AnantUser {
  email: string
  name: string
  role: 'Admin' | 'Member' | 'Viewer'
  workspace: string
  demo?: boolean
}

interface AuthValue {
  user: AnantUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string; needsConfirm?: boolean }>
  signInDemo: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

function nameFromEmail(email: string) {
  const raw = email.split('@')[0].replace(/[._-]+/g, ' ')
  return raw.replace(/\b\w/g, (c) => c.toUpperCase())
}

function userFromSession(session: Session): AnantUser {
  const email = session.user.email ?? 'you@local'
  const meta = session.user.user_metadata ?? {}
  return {
    email,
    name: (meta.name as string) || nameFromEmail(email),
    role: 'Admin',
    workspace: 'Neural AI',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AnantUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore a prior demo session first (survives refresh without Supabase).
    const demo = localStorage.getItem('anant.demo')
    if (demo) {
      setUser(JSON.parse(demo))
      setLoading(false)
      return
    }
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(userFromSession(data.session))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session ? userFromSession(session) : null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      async signIn(email, password) {
        if (!supabase) {
          signInDemoInternal(email)
          return {}
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error ? { error: error.message } : {}
      },
      async signUp(email, password, name) {
        if (!supabase) {
          signInDemoInternal(email, name)
          return {}
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (error) return { error: error.message }
        // If email confirmation is on, there is no session yet.
        return { needsConfirm: !data.session }
      },
      signInDemo() {
        signInDemoInternal('you@local', 'Tejash')
      },
      async signOut() {
        localStorage.removeItem('anant.demo')
        if (supabase) await supabase.auth.signOut()
        setUser(null)
      },
    }),
    [user, loading],
  )

  function signInDemoInternal(email: string, name?: string) {
    const u: AnantUser = {
      email,
      name: name || nameFromEmail(email),
      role: 'Admin',
      workspace: 'Neural AI',
      demo: true,
    }
    localStorage.setItem('anant.demo', JSON.stringify(u))
    setUser(u)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
