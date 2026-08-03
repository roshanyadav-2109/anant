import type { Provenance, SourceKind } from '@/lib/types'
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
 * Presentation-only helpers (icons + labels). All content comes from the
 * Anant Engine via src/lib/anant.ts + the DataProvider — nothing here is data.
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
