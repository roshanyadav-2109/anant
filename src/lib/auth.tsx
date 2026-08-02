import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, ApiError, decodeToken, getToken, setToken } from '@/lib/anant'

/**
 * Auth against the Anant Engine (see API_REFERENCE.md). The JWT carries an
 * immutable `at` claim: 'individual' | 'enterprise'. We surface that as
 * accountType 'personal' | 'team' so the rest of the app branches as before.
 */
export interface AnantUser {
  userId: string
  username: string
  name: string
  accountType: 'personal' | 'team'
  orgId?: string
  role?: string
}

interface EnterpriseSignup {
  username: string
  password: string
  name?: string
  email: string
  org_name: string
  org_slug: string
}

interface AuthValue {
  user: AnantUser | null
  loading: boolean
  signIn: (username: string, password: string, door: 'individual' | 'enterprise') => Promise<{ error?: string }>
  signUpIndividual: (username: string, password: string, name?: string) => Promise<{ error?: string }>
  signUpEnterprise: (b: EnterpriseSignup) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

function userFromClaims(extra?: { user_id?: string; org_id?: string; role?: string }): AnantUser | null {
  const c = decodeToken()
  if (!c) return null
  const accountType = c.at === 'enterprise' ? 'team' : 'personal'
  const username = (c.username as string) || (c.sub as string) || 'you'
  return {
    userId: extra?.user_id ?? (c.sub as string) ?? '',
    username,
    name: (c.name as string) || username,
    accountType,
    orgId: extra?.org_id ?? (c.org as string | undefined),
    role: extra?.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AnantUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore a session from the stored token on boot.
  useEffect(() => {
    if (getToken()) setUser(userFromClaims())
    setLoading(false)
  }, [])

  const value = useMemo<AuthValue>(() => {
    function adopt(res: { access_token: string; user_id?: string; org_id?: string; role?: string }) {
      setToken(res.access_token)
      setUser(userFromClaims(res))
    }
    function toError(e: unknown): { error?: string } {
      if (e instanceof ApiError) return { error: e.message }
      return { error: 'Something went wrong. Please try again.' }
    }
    return {
      user,
      loading,
      async signIn(username, password, door) {
        try {
          const res = door === 'enterprise' ? await api.enterpriseLogin(username, password) : await api.login(username, password)
          adopt(res)
          return {}
        } catch (e) {
          return toError(e)
        }
      },
      async signUpIndividual(username, password, name) {
        try {
          adopt(await api.signup(username, password, name))
          return {}
        } catch (e) {
          return toError(e)
        }
      },
      async signUpEnterprise(b) {
        try {
          adopt(await api.enterpriseSignup(b))
          return {}
        } catch (e) {
          return toError(e)
        }
      },
      async signOut() {
        try {
          await api.logoutAll()
        } catch {
          /* ignore — clear locally regardless */
        }
        setToken(null)
        setUser(null)
      },
    }
  }, [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
