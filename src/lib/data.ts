import { supabase } from '@/lib/supabase'
import type { Memory, Provenance, SourceKind } from '@/lib/types'

/**
 * Typed data access over the Supabase schema (see supabase/schema.sql).
 * Every query is workspace-scoped; Row Level Security enforces tenant
 * isolation server-side, so these helpers never need to filter by user.
 *
 * The screens currently render seeded demo content (per the spec, the
 * Memory / Insights read surface is served by the local engine). These
 * helpers are the ready path to swap that for live rows.
 */

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
    when: r.source_when ?? '',
    confidence: r.confidence,
    supersession:
      r.superseded_from && r.superseded_to
        ? { from: r.superseded_from, to: r.superseded_to }
        : undefined,
  }
}

/** The active workspace for the signed-in user (their admin workspace first). */
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

export async function fetchMemories(workspaceId: string): Promise<Memory[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('memories')
    .select(
      'id, fact, detail, subject, category, provenance, provenance_note, source_kind, source_label, source_speaker, source_when, confidence, superseded_from, superseded_to',
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

export async function correctMemory(id: string, fact: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from('memories')
    .update({ fact, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
