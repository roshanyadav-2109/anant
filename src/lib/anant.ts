/**
 * Anant Engine API client — the real backend (see API_REFERENCE.md, 44 routes).
 * JWT bearer auth; the token carries `at` (individual|enterprise) and, for
 * enterprise, an `org` claim. Base URL is configurable per environment.
 */

const BASE =
  (import.meta.env.VITE_ANANT_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://scoldedly-unfinical-julius.ngrok-free.dev'
const NGROK = String(import.meta.env.VITE_ANANT_NGROK ?? '') === 'true' || BASE.includes('ngrok')

const TOKEN_KEY = 'anant.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}

/** JWT claims we care about, decoded client-side (no verification). */
export interface TokenClaims {
  at?: 'individual' | 'enterprise'
  org?: string
  sub?: string
  name?: string
  username?: string
  [k: string]: unknown
}
export function decodeToken(token = getToken()): TokenClaims | null {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as TokenClaims
  } catch {
    return null
  }
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

type Opts = { method?: string; body?: unknown; auth?: boolean; signal?: AbortSignal }

async function request<T>(path: string, opts: Opts = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = opts
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (NGROK) headers['ngrok-skip-browser-warning'] = 'true'
  if (auth) {
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch {
    throw new ApiError(0, `Can’t reach the Anant engine at ${BASE}. Is it running and reachable (CORS)?`)
  }
  if (res.status === 401 && auth) {
    setToken(null)
    throw new ApiError(401, 'Session expired — please sign in again.')
  }
  const text = await res.text()
  const data = text ? safeJson(text) : null
  if (!res.ok) {
    const msg = extractError(data) || `Request failed (${res.status})`
    throw new ApiError(res.status, msg, data)
  }
  return data as T
}

function safeJson(t: string): unknown {
  try {
    return JSON.parse(t)
  } catch {
    return t
  }
}
function extractError(data: unknown): string | null {
  if (!data || typeof data !== 'object') return typeof data === 'string' ? data : null
  const d = data as Record<string, unknown>
  if (typeof d.detail === 'string') return d.detail
  if (Array.isArray(d.detail)) return (d.detail as { msg?: string }[]).map((x) => x.msg).filter(Boolean).join(', ')
  if (typeof d.message === 'string') return d.message
  return null
}

/* ===================== Auth ===================== */

export interface AuthResult {
  access_token: string
  token_type: string
  user_id: string
  org_id?: string
  role?: string
}

export const api = {
  base: BASE,
  health: () => request<{ status: string; version: string }>('/api/health', { auth: false }),

  // Individual door
  signup: (username: string, password: string, name?: string) =>
    request<AuthResult>('/api/auth/signup', { method: 'POST', auth: false, body: { username, password, name } }),
  login: (username: string, password: string) =>
    request<AuthResult>('/api/auth/login', { method: 'POST', auth: false, body: { username, password } }),

  // Enterprise door
  enterpriseSignup: (b: {
    username: string; password: string; name?: string; email: string; org_name: string; org_slug: string
  }) => request<AuthResult>('/api/auth/enterprise/signup', { method: 'POST', auth: false, body: b }),
  enterpriseLogin: (username: string, password: string) =>
    request<AuthResult>('/api/auth/enterprise/login', { method: 'POST', auth: false, body: { username, password } }),
  acceptInvite: (invite_token: string, username: string, password: string, name?: string) =>
    request<AuthResult>('/api/auth/enterprise/accept-invite', {
      method: 'POST', auth: false, body: { invite_token, username, password, name },
    }),

  logoutAll: () => request<{ status: string }>('/api/auth/logout-all', { method: 'POST' }),
  emailRequest: (email: string) =>
    request<{ status: string; dev_token?: string }>('/api/auth/email/request', { method: 'POST', body: { email } }),
  emailVerify: (token: string) =>
    request<{ status: string; email: string }>('/api/auth/email/verify', { method: 'POST', body: { token } }),

  /* ===================== Chat ===================== */
  chat: (message: string, conversation_id?: string) =>
    request<{ response: string; thinking: string | null; persona: string; conversation_id: string; sources: string[] }>(
      '/api/chat', { method: 'POST', body: { message, conversation_id } },
    ),
  listConversations: (limit = 30, offset = 0) =>
    request<{ conversations: { id: string; title: string; created_at: string; updated_at: string; message_count: number; preview: string }[] }>(
      `/api/conversations?limit=${limit}&offset=${offset}`,
    ),
  createConversation: () => request<{ id: string; title: string }>('/api/conversations', { method: 'POST' }),
  getMessages: (id: string, limit = 100) =>
    request<{ messages: { id: string; role: 'user' | 'assistant'; content: string; thinking?: string; persona?: string; created_at: string }[] }>(
      `/api/conversations/${id}/messages?limit=${limit}`,
    ),
  deleteConversation: (id: string) => request<{ status: string }>(`/api/conversations/${id}`, { method: 'DELETE' }),
  renameConversation: (id: string, title: string) =>
    request<{ status: string }>(`/api/conversations/${id}`, { method: 'PATCH', body: { title } }),
  feedback: (feedback: 'good' | 'bad', conversation_id?: string) =>
    request<{ status: string }>('/api/feedback', { method: 'POST', body: { feedback, conversation_id } }),

  /* ===================== Memory & profile ===================== */
  profile: () => request<AnantProfile>('/api/profile'),
  setName: (name: string) => request<{ status: string }>('/api/profile/name', { method: 'POST', body: { name } }),
  memories: (limit = 20) =>
    request<{ memories: { category: string; content: string; created_at: string }[]; total: number }>(
      `/api/memories?limit=${limit}`,
    ),
  emotions: (days = 30) =>
    request<{ emotions: { state: string; intensity: number; cause?: string; timestamp?: string }[] }>(
      `/api/emotions?days=${days}`,
    ),
  patterns: () => request<{ patterns: { type: string; description: string; confidence: number }[] }>('/api/patterns'),
  stats: () => request<{ entities: number; memories: number; relationships: number; emotions: number; patterns: number }>('/api/stats'),
  graph: () => request<{ html: string }>('/api/graph'),
  dream: () => request<Record<string, number>>('/api/dream', { method: 'POST' }),
  forget: () => request<{ status: string }>('/api/forget', { method: 'POST' }),
  forYou: () => request<AnantForYou>('/api/foryou'),
  forYouRefresh: () => request<AnantForYou>('/api/foryou/refresh', { method: 'POST' }),
  exportJson: () => request<string>('/api/export/json'),
  exportMarkdown: () => request<string>('/api/export/markdown'),

  /* ===================== Organizations (enterprise) ===================== */
  createOrg: (name: string, slug: string) =>
    request<{ org_id: string; name: string; slug: string; your_role: string }>('/api/orgs', { method: 'POST', body: { name, slug } }),
  switchOrg: (org_id: string) =>
    request<{ access_token: string; org_id: string; role: string }>('/api/orgs/switch', { method: 'POST', body: { org_id } }),
  invite: (org_id: string, email: string, role: 'member' | 'manager') =>
    request<{ status: string; email: string; role: string; dev_token?: string }>(`/api/orgs/${org_id}/invites`, { method: 'POST', body: { email, role } }),
  members: (org_id: string) =>
    request<{ members: { user_id: string; username: string; role: string; status: string }[] }>(`/api/orgs/${org_id}/members`),
  patchMember: (org_id: string, member_id: string, patch: { role?: string; status?: string }) =>
    request<{ status: string }>(`/api/orgs/${org_id}/members/${member_id}`, { method: 'PATCH', body: patch }),
  removeMember: (org_id: string, member_id: string) =>
    request<{ status: string }>(`/api/orgs/${org_id}/members/${member_id}`, { method: 'DELETE' }),
  audit: (org_id: string, limit = 50) =>
    request<{ events: { ts: string; actor: string; action: string; object: string; decision: string }[] }>(`/api/orgs/${org_id}/audit?limit=${limit}`),

  /* ===================== Slack connector ===================== */
  slackConnect: (bot_token: string, workspace_id: string) =>
    request<unknown>('/api/connectors/slack/connect', { method: 'POST', body: { bot_token, workspace_id } }),
  slackSync: () => request<unknown>('/api/connectors/slack/sync', { method: 'POST' }),
  slackStatus: () => request<{ status: string }>('/api/connectors/slack/status'),
  slackDelete: () => request<unknown>('/api/connectors/slack', { method: 'DELETE' }),
}

/* ===================== Streaming chat (SSE) ===================== */

export async function chatStream(
  message: string,
  conversation_id: string | undefined,
  handlers: {
    onToken: (chunk: string) => void
    onDone: (final: { response: string; thinking: string | null; persona: string; conversation_id: string }) => void
    onError: (err: unknown) => void
  },
  signal?: AbortSignal,
): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (NGROK) headers['ngrok-skip-browser-warning'] = 'true'
  const t = getToken()
  if (t) headers.Authorization = `Bearer ${t}`
  try {
    const res = await fetch(`${BASE}/api/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, conversation_id }),
      signal,
    })
    if (!res.ok || !res.body) {
      if (res.status === 401) setToken(null)
      throw new ApiError(res.status, `Stream failed (${res.status})`)
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''
      for (const part of parts) {
        const line = part.split('\n').find((l) => l.startsWith('data:'))
        if (!line) continue
        const json = line.slice(5).trim()
        if (!json) continue
        let evt: { type: string; content?: string; response?: string; thinking?: string | null; persona?: string; conversation_id?: string }
        try {
          evt = JSON.parse(json)
        } catch {
          continue
        }
        if (evt.type === 'token' && evt.content) handlers.onToken(evt.content)
        else if (evt.type === 'done')
          handlers.onDone({
            response: evt.response ?? '',
            thinking: evt.thinking ?? null,
            persona: evt.persona ?? '',
            conversation_id: evt.conversation_id ?? conversation_id ?? '',
          })
        else if (evt.type === 'error') handlers.onError(evt)
      }
    }
  } catch (err) {
    handlers.onError(err)
  }
}

/* ===================== Response types ===================== */

export interface AnantProfile {
  identity: { name?: string; age?: string; location?: string; education?: string; occupation?: string; company?: string }
  people: { name: string; relation: string; detail?: string }[]
  work: { name: string; role: string }[]
  education: { name: string; relation: string }[]
  likes: string[]
  dislikes: string[]
  goals: string[]
  health: string[]
  events: { name: string; when: string }[]
  mood?: string
}

export interface AnantForYou {
  life_pulse?: string
  cross_domain_insights?: string[]
  people_intelligence?: string[]
  goal_reality?: string[]
  blind_spots?: string[]
  tomorrow_actions?: string[]
  suggestions?: string[]
  generated_at?: string
}
