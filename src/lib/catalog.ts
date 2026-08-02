import { CoGeneric } from '@/icons'
import type { Connector } from '@/lib/types'

/**
 * The catalogue of apps you can connect. The engine currently has a real
 * connector for Slack only (POST /api/connectors/slack/*); the rest are shown
 * as available and light up as their integrations ship. Nothing is "connected"
 * here — real status comes from the engine.
 */
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
