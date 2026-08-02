import type { Citation, Provenance, SourceKind } from '@/lib/types'
import {
  Chat as ChatGlyph,
  CoCalendar,
  CoDrive,
  CoFireflies,
  CoGithub,
  CoGmail,
  CoLinear,
  CoNotion,
  CoOutlook,
  CoSlack,
  CoTeams,
} from '@/icons'
import type { ComponentType } from 'react'
import type { IconProps } from '@/icons'

/**
 * Presentation-only helpers (icons + labels). All *content* now comes from
 * the database via src/lib/data.ts + the DataProvider — nothing here is data.
 */

/* Source glyphs, keyed for reuse by chips across the app. */
export const sourceGlyph: Record<SourceKind, ComponentType<IconProps>> = {
  chat: ChatGlyph,
  slack: CoSlack,
  gmail: CoGmail,
  outlook: CoOutlook,
  drive: CoDrive,
  notion: CoNotion,
  calendar: CoCalendar,
  linear: CoLinear,
  github: CoGithub,
  teams: CoTeams,
  fireflies: CoFireflies,
}

export const provenanceLabel: Record<Provenance, string> = {
  stated: 'User-stated',
  inferred: 'Inferred',
  aggregated: 'Aggregated',
}

/**
 * Citations attached to Anant's canned reply in the live composer (there is no
 * LLM wired yet — sending "What is Oliver working on now?" replays this answer).
 * The seed thread stores its own copy of these in the database.
 */
export const oliverCitations: Citation[] = [
  {
    memoryId: 'm_oliver_design',
    provenance: 'stated',
    quote: 'Oliver now leads design.',
    source: { kind: 'slack', label: 'Slack · #engineering', speaker: 'Priya' },
    date: '2 Jul 2026, 9:41am',
    conversation: 'Design team changes',
    context: 'Announced in #engineering',
  },
  {
    memoryId: 'm_oliver_design',
    provenance: 'stated',
    quote: 'Moved off the backend team last month.',
    source: { kind: 'chat', label: 'You', when: '6 days ago' },
    date: '2 Jul 2026, 10:05am',
    conversation: 'Design team changes',
    context: 'You told Anant in chat',
  },
  {
    memoryId: 'm_oliver_infer',
    provenance: 'inferred',
    quote: 'Now runs the design work for the team.',
    source: { kind: 'chat', label: "Anant's inference" },
    date: 'Noticed 2 Jul 2026',
    conversation: 'Design team changes',
    context: 'Drawn from 14 signals',
  },
  {
    memoryId: 'm_oliver_reviews',
    provenance: 'aggregated',
    quote: 'Leads the weekly design reviews.',
    source: { kind: 'notion', label: 'Notion · Design' },
    date: 'Updated 28 Jun 2026',
    conversation: 'Roadmap review',
    context: 'Pattern across 6 review notes',
  },
  {
    memoryId: 'm_oliver_handoff',
    provenance: 'stated',
    quote: 'Backend hand-off routes through the platform pod.',
    source: { kind: 'slack', label: 'Slack · #engineering', speaker: 'Priya' },
    date: '1 Jul 2026, 3:18pm',
    conversation: 'Design team changes',
    context: 'Thread reply from Priya',
  },
]
