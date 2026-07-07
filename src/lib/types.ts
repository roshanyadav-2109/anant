import type { ComponentType } from 'react'
import type { IconProps } from '@/icons'

export type Provenance = 'stated' | 'inferred' | 'aggregated'

export type ConnectorStatus = 'connected' | 'syncing' | 'error' | 'available'

export type SourceKind =
  | 'chat'
  | 'slack'
  | 'gmail'
  | 'outlook'
  | 'drive'
  | 'notion'
  | 'calendar'
  | 'linear'
  | 'github'
  | 'teams'
  | 'fireflies'

export interface SourceRef {
  kind: SourceKind
  label: string // e.g. "Slack · #engineering"
  speaker?: string
  when?: string
}

export interface Supersession {
  from: string
  to: string
}

export interface Memory {
  id: string
  fact: string
  detail?: string
  subject: string
  category: string
  provenance: Provenance
  provenanceNote?: string // e.g. "from 14 signals", "31 messages"
  source: SourceRef
  when: string
  confidence: number // 0..1
  supersession?: Supersession
}

export interface Insight {
  id: string
  kind: 'connection' | 'pattern' | 'contradiction'
  title: string
  body: string
  provenance: Provenance
  provenanceNote?: string
  source?: SourceRef
  when: string
  confidence: number
}

export interface Connector {
  id: string
  name: string
  category: string
  status: ConnectorStatus
  icon: ComponentType<IconProps>
  lastSync?: string
  items?: number
  itemsTarget?: number
  scopes?: string[]
  official?: boolean // does a free vector mark exist for release
}

export interface Citation {
  memoryId: string
  provenance: Provenance
  quote: string
  source: SourceRef
  date?: string // absolute, e.g. "2 Jul 2026, 4:12pm"
  conversation?: string // which conversation surfaced it
  context?: string // extra detail — channel, thread, how it was captured
}

export interface ChatMessage {
  id: string
  role: 'user' | 'anant'
  text: string
  citations?: Citation[]
  streaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  when: string
  messages: ChatMessage[]
}
