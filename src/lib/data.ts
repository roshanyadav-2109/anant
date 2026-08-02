import { supabase } from '@/lib/supabase'
import { CoGeneric } from '@/icons'
import type {
  ChatMessage,
  Citation,
  Connector,
  ConnectorStatus,
  Conversation,
  Insight,
  Memory,
  Provenance,
  SourceKind,
} from '@/lib/types'

/**
 * Typed data access over the Supabase schema (see supabase/schema.sql).
 * Every query is workspace-scoped; Row Level Security enforces tenant
 * isolation server-side, so these helpers never filter by user. Rows are
 * mapped into the app's domain types here, at the boundary.
 */

/* ---- workspace ---------------------------------------------------------- */

export async function getActiveWorkspaceId(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .order('role', { ascending: true })
    .limit(1)
    .maybeSingle()
  return data?.workspace_id ?? null
}

/* ---- memories ----------------------------------------------------------- */

interface MemoryRow {
  id: string
  fact: string
  detail: string | null
  subject: string
  category: string | null
  provenance: Provenance
  provenance_note: string | null
  source_kind: SourceKind
  source_label: string
  source_speaker: string | null
  source_when: string | null
  confidence: number
  superseded_from: string | null
  superseded_to: string | null
  when_label: string | null
}

function rowToMemory(r: MemoryRow): Memory {
  return {
    id: r.id,
    fact: r.fact,
    detail: r.detail ?? undefined,
    subject: r.subject,
    category: r.category ?? '',
    provenance: r.provenance,
    provenanceNote: r.provenance_note ?? undefined,
    source: {
      kind: r.source_kind,
      label: r.source_label,
      speaker: r.source_speaker ?? undefined,
      when: r.source_when ?? undefined,
    },
    when: r.when_label ?? r.source_when ?? '',
    confidence: r.confidence,
    supersession:
      r.superseded_from && r.superseded_to
        ? { from: r.superseded_from, to: r.superseded_to }
        : undefined,
  }
}

export async function fetchMemories(workspaceId: string): Promise<Memory[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('memories')
    .select(
      'id, fact, detail, subject, category, provenance, provenance_note, source_kind, source_label, source_speaker, source_when, confidence, superseded_from, superseded_to, when_label',
    )
    .eq('workspace_id', workspaceId)
    .eq('forgotten', false)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data as MemoryRow[]).map(rowToMemory)
}

export async function forgetMemory(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('memories').update({ forgotten: true }).eq('id', id)
  if (error) throw error
}

export async function createMemory(workspaceId: string): Promise<Memory | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('memories')
    .insert({
      workspace_id: workspaceId,
      scope: 'shared',
      fact: '',
      subject: 'You',
      category: 'Note',
      provenance: 'stated',
      source_kind: 'chat',
      source_label: 'Chat',
      source_speaker: 'You',
      confidence: 0.9,
      when_label: 'just now',
    })
    .select(
      'id, fact, detail, subject, category, provenance, provenance_note, source_kind, source_label, source_speaker, source_when, confidence, superseded_from, superseded_to, when_label',
    )
    .single()
  if (error) throw error
  return rowToMemory(data as MemoryRow)
}

export async function insertMemory(
  workspaceId: string,
  m: { fact: string; subject?: string; category?: string; sourceKind?: SourceKind; sourceLabel?: string },
): Promise<Memory | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('memories')
    .insert({
      workspace_id: workspaceId,
      scope: 'shared',
      fact: m.fact,
      subject: m.subject ?? 'You',
      category: m.category ?? 'Note',
      provenance: 'stated',
      source_kind: m.sourceKind ?? 'chat',
      source_label: m.sourceLabel ?? 'Added by you',
      confidence: 0.9,
      when_label: 'just now',
    })
    .select(
      'id, fact, detail, subject, category, provenance, provenance_note, source_kind, source_label, source_speaker, source_when, confidence, superseded_from, superseded_to, when_label',
    )
    .single()
  if (error) throw error
  return rowToMemory(data as MemoryRow)
}

export async function setConnectorStatus(
  workspaceId: string,
  key: string,
  status: 'connected' | 'syncing' | 'error' | 'available',
): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('connectors')
    .update({ status })
    .eq('workspace_id', workspaceId)
    .eq('key', key)
  if (error) throw error
}

export async function correctMemory(id: string, fact: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('memories')
    .update({ fact, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/* ---- insights ----------------------------------------------------------- */

interface InsightRow {
  id: string
  kind: Insight['kind']
  title: string
  body: string
  provenance: Provenance
  provenance_note: string | null
  source_kind: SourceKind | null
  source_label: string | null
  confidence: number
  when_label: string | null
  at_label: string | null
}

export async function fetchInsights(workspaceId: string): Promise<Insight[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('insights')
    .select('id, kind, title, body, provenance, provenance_note, source_kind, source_label, confidence, when_label, at_label')
    .eq('workspace_id', workspaceId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as InsightRow[]).map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body,
    provenance: r.provenance,
    provenanceNote: r.provenance_note ?? undefined,
    source: r.source_kind && r.source_label ? { kind: r.source_kind, label: r.source_label } : undefined,
    when: r.when_label ?? '',
    at: r.at_label ?? undefined,
    confidence: r.confidence,
  }))
}

/* ---- connectors --------------------------------------------------------- */

interface ConnectorRow {
  key: string
  name: string
  category: string
  status: ConnectorStatus
  items: number
  items_target: number | null
  scopes: string[] | null
  official: boolean
  last_sync_label: string | null
}

export async function fetchConnectors(workspaceId: string): Promise<Connector[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('connectors')
    .select('key, name, category, status, items, items_target, scopes, official, last_sync_label')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as ConnectorRow[]).map((r) => ({
    id: r.key,
    name: r.name,
    category: r.category,
    status: r.status,
    icon: CoGeneric,
    lastSync: r.last_sync_label ?? undefined,
    items: r.items || undefined,
    itemsTarget: r.items_target ?? undefined,
    scopes: r.scopes ?? undefined,
    official: r.official,
  }))
}

/* ---- conversations + messages ------------------------------------------ */

interface ConversationRow {
  id: string
  title: string
  created_at: string
}
interface MessageRow {
  id: string
  conversation_id: string
  role: ChatMessage['role']
  text: string
  citations: Citation[]
  at_label: string | null
  created_at: string
}

export async function fetchConversations(workspaceId: string): Promise<Conversation[]> {
  if (!supabase) return []
  const { data: convs, error } = await supabase
    .from('conversations')
    .select('id, title, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = (convs ?? []) as ConversationRow[]
  const ids = rows.map((c) => c.id)
  let msgs: MessageRow[] = []
  if (ids.length) {
    const { data: m, error: me } = await supabase
      .from('messages')
      .select('id, conversation_id, role, text, citations, at_label, created_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: true })
    if (me) throw me
    msgs = (m ?? []) as MessageRow[]
  }
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    at: new Date(c.created_at).getTime(),
    messages: msgs
      .filter((m) => m.conversation_id === c.id)
      .map((m) => ({
        id: m.id,
        role: m.role,
        text: m.text,
        citations: m.citations?.length ? m.citations : undefined,
        at: m.at_label ?? '',
      })),
  }))
}

export async function createConversation(workspaceId: string, title = 'New conversation'): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('conversations')
    .insert({ workspace_id: workspaceId, title })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function addMessage(
  conversationId: string,
  role: ChatMessage['role'],
  text: string,
  citations: Citation[] = [],
  atLabel = '',
): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, text, citations, at_label: atLabel })
  if (error) throw error
}

/* ---- members ------------------------------------------------------------ */

export interface Member {
  name: string
  email: string
  role: 'Admin' | 'Member' | 'Viewer'
  access: string
  you: boolean
}

interface MemberRow {
  role: 'admin' | 'member' | 'viewer'
  user_id: string
}
interface ProfileRow {
  id: string
  full_name: string | null
  email: string | null
}

export async function fetchMembers(workspaceId: string, meEmail?: string): Promise<Member[]> {
  if (!supabase) return []
  // No PostgREST embed — workspace_members has no direct FK to profiles.
  const { data: mem, error } = await supabase
    .from('workspace_members')
    .select('role, user_id')
    .eq('workspace_id', workspaceId)
  if (error) throw error
  const rows = (mem ?? []) as MemberRow[]
  const ids = rows.map((m) => m.user_id)
  let profiles: ProfileRow[] = []
  if (ids.length) {
    const { data: p } = await supabase.from('profiles').select('id, full_name, email').in('id', ids)
    profiles = (p ?? []) as ProfileRow[]
  }
  const byId = new Map(profiles.map((p) => [p.id, p]))
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  return rows.map((m) => {
    const p = byId.get(m.user_id)
    const email = p?.email ?? ''
    const name = p?.full_name ?? (email ? email.split('@')[0] : 'Member')
    return {
      name,
      email,
      role: cap(m.role) as Member['role'],
      access: m.role === 'viewer' ? 'Shared only' : 'Private + shared',
      you: !!meEmail && email === meEmail,
    }
  })
}
