import { CoGeneric } from '@/icons'
import type { Connector } from '@/lib/types'

/**
 * The catalogue of apps you can connect. Five are LIVE against the engine
 * (Slack, GitHub, Notion, Linear, and Google → Gmail/Drive/Docs/Calendar via
 * one OAuth). The rest are shown as available and light up as integrations
 * ship. Real status comes from each connector's /status endpoint.
 */

export type ConnectorService = 'slack' | 'github' | 'notion' | 'linear' | 'google'

export interface ConnectField {
  name: string
  label: string
  placeholder: string
  password?: boolean
}

export interface LiveConnector {
  service: ConnectorService
  oauth?: boolean
  /** Fields collected in the connect form (static-token connectors). */
  fields?: ConnectField[]
  /** The form field whose value identifies the source for sync/forget. */
  idField?: string
  /** A link to where the user creates the token (static-token connectors). */
  helpUrl?: string
  helpLabel?: string
}

/** catalog id → live connector config. Four Google tiles share one OAuth. */
export const liveConnectors: Record<string, LiveConnector> = {
  slack: {
    service: 'slack',
    idField: 'channel_id',
    helpUrl: 'https://api.slack.com/apps',
    helpLabel: 'Create a Slack app & bot token',
    fields: [
      { name: 'bot_token', label: 'Bot token', placeholder: 'xoxb-…', password: true },
      { name: 'workspace_id', label: 'Workspace ID', placeholder: 'T01234ABC' },
      { name: 'channel_id', label: 'Channel ID', placeholder: 'C01234ABC' },
      { name: 'channel_name', label: 'Channel name', placeholder: 'general' },
    ],
  },
  github: {
    service: 'github',
    idField: 'repo',
    helpUrl: 'https://github.com/settings/tokens',
    helpLabel: 'Create a GitHub access token',
    fields: [
      { name: 'token', label: 'Access token', placeholder: 'ghp_…', password: true },
      { name: 'repo', label: 'Repository', placeholder: 'owner/repo' },
    ],
  },
  notion: {
    service: 'notion',
    idField: 'workspace',
    helpUrl: 'https://www.notion.so/my-integrations',
    helpLabel: 'Create a Notion integration',
    fields: [
      { name: 'token', label: 'Integration token', placeholder: 'secret_…', password: true },
      { name: 'workspace', label: 'Workspace label', placeholder: 'my-workspace' },
    ],
  },
  linear: {
    service: 'linear',
    idField: 'workspace',
    helpUrl: 'https://linear.app/settings/api',
    helpLabel: 'Create a Linear API key',
    fields: [
      { name: 'api_key', label: 'API key', placeholder: 'lin_api_…', password: true },
      { name: 'workspace', label: 'Workspace label', placeholder: 'my-team' },
    ],
  },
  gmail: { service: 'google', oauth: true },
  drive: { service: 'google', oauth: true },
  gdocs: { service: 'google', oauth: true },
  calendar: { service: 'google', oauth: true },
}

const c = (id: string, name: string, category: string): Connector => ({
  id,
  name,
  category,
  status: 'available',
  icon: CoGeneric,
  official: true,
})

export const connectorCatalog: Connector[] = [
  c('slack', 'Slack', 'Messaging'),
  c('gmail', 'Gmail', 'Email'),
  c('outlook', 'Outlook', 'Email'),
  c('drive', 'Google Drive', 'Documents'),
  c('notion', 'Notion', 'Documents'),
  c('calendar', 'Google Calendar', 'Calendar'),
  c('linear', 'Linear', 'Tasks'),
  c('github', 'GitHub', 'Code'),
  c('teams', 'Teams', 'Messaging'),
  c('fireflies', 'Fireflies', 'Transcripts'),
  c('calendly', 'Calendly', 'Scheduling'),
  c('zoom', 'Zoom', 'Meetings'),
  c('meet', 'Google Meet', 'Meetings'),
  c('dropbox', 'Dropbox', 'Documents'),
  c('figma', 'Figma', 'Design'),
  c('jira', 'Jira', 'Tasks'),
  c('asana', 'Asana', 'Tasks'),
  c('confluence', 'Confluence', 'Documents'),
  c('trello', 'Trello', 'Tasks'),
  c('hubspot', 'HubSpot', 'CRM'),
  c('salesforce', 'Salesforce', 'CRM'),
  c('discord', 'Discord', 'Messaging'),
  c('telegram', 'Telegram', 'Messaging'),
  c('whatsapp', 'WhatsApp Business', 'Messaging'),
  c('messenger', 'Messenger', 'Messaging'),
  c('wechat', 'WeChat', 'Messaging'),
  c('signal', 'Signal', 'Messaging'),
  c('box', 'Box', 'Documents'),
  c('onedrive', 'OneDrive', 'Documents'),
  c('gdocs', 'Google Docs', 'Documents'),
  c('evernote', 'Evernote', 'Notes'),
  c('clickup', 'ClickUp', 'Tasks'),
  c('monday', 'monday.com', 'Tasks'),
  c('todoist', 'Todoist', 'Tasks'),
  c('airtable', 'Airtable', 'Databases'),
  c('zendesk', 'Zendesk', 'Support'),
  c('intercom', 'Intercom', 'Support'),
  c('zoho', 'Zoho CRM', 'CRM'),
  c('pipedrive', 'Pipedrive', 'CRM'),
  c('gitlab', 'GitLab', 'Code'),
  c('bitbucket', 'Bitbucket', 'Code'),
  c('loom', 'Loom', 'Meetings'),
]
