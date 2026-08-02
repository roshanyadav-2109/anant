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
  /** Entitlement — whether this email has workspace (team) access or is a
   *  personal account. In production this comes from the purchase / access
   *  record; here it's derived from the email domain as a stand-in. */
  accountType: 'personal' | 'team'
  demo?: boolean
}

/** Free/consumer email providers → personal; anything else → workspace/team. */
const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'ymail.com', 'icloud.com', 'me.com', 'mac.com', 'proton.me', 'protonmail.com',
  'aol.com', 'gmx.com', 'zoho.com', 'mail.com', 'yandex.com',
])

export function accountTypeForEmail(email: string): 'personal' | 'team' {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  if (!domain) return 'personal'
  return PERSONAL_DOMAINS.has(domain) ? 'personal' : 'team'
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
  const accountType = accountTypeForEmail(email)
  return {
    email,
    name: (meta.name as string) || nameFromEmail(email),
    role: 'Admin',
    workspace: accountType === 'team' ? 'Neural AI' : 'Personal',
    accountType,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AnantUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore a prior demo session first (survives refresh without Supabase).
    const demo = localStorage.getItem('anant.demo')
    if (demo) {
      const u = JSON.parse(demo) as AnantUser
      if (!u.accountType) u.accountType = accountTypeForEmail(u.email) // backfill older sessions
      setUser(u)
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
    const accountType = accountTypeForEmail(email)
    const u: AnantUser = {
      email,
      name: name || nameFromEmail(email),
      role: 'Admin',
      workspace: accountType === 'team' ? 'Neural AI' : 'Personal',
      accountType,
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
