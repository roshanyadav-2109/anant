/**
 * Official vendor brand marks, bundled locally under /public/connectors.
 * Used where a freely-licensed vector exists; Fireflies and the internal
 * "chat" source fall back to a neutral in-house glyph.
 *
 * For release, re-source each mark from the vendor's brand/press kit and
 * follow its usage guidelines (clear-space, colour, no distortion).
 */
export const brandLogo: Record<string, string> = {
  slack: '/connectors/slack.svg',
  gmail: '/connectors/gmail.svg',
  outlook: '/connectors/outlook.svg',
  drive: '/connectors/drive.svg',
  notion: '/connectors/notion.svg',
  calendar: '/connectors/calendar.svg',
  linear: '/connectors/linear.svg',
  github: '/connectors/github.svg',
  teams: '/connectors/teams.svg',
  // Additional apps
  calendly: '/connectors/calendly.svg',
  zoom: '/connectors/zoom.svg',
  meet: '/connectors/meet.svg',
  dropbox: '/connectors/dropbox.svg',
  figma: '/connectors/figma.svg',
  jira: '/connectors/jira.svg',
  asana: '/connectors/asana.svg',
  hubspot: '/connectors/hubspot.svg',
  confluence: '/connectors/confluence.svg',
  trello: '/connectors/trello.svg',
  discord: '/connectors/discord.svg',
  salesforce: '/connectors/salesforce.svg',
  // Messaging
  telegram: '/connectors/telegram.svg',
  whatsapp: '/connectors/whatsapp.svg',
  messenger: '/connectors/messenger.svg',
  wechat: '/connectors/wechat.svg',
  signal: '/connectors/signal.svg',
  // Documents & notes
  box: '/connectors/box.svg',
  onedrive: '/connectors/onedrive.svg',
  gdocs: '/connectors/gdocs.svg',
  evernote: '/connectors/evernote.svg',
  // Tasks & databases
  clickup: '/connectors/clickup.svg',
  monday: '/connectors/monday.svg',
  todoist: '/connectors/todoist.svg',
  airtable: '/connectors/airtable.svg',
  // Support & CRM
  zendesk: '/connectors/zendesk.svg',
  intercom: '/connectors/intercom.svg',
  zoho: '/connectors/zoho.svg',
  pipedrive: '/connectors/pipedrive.svg',
  // Code
  gitlab: '/connectors/gitlab.svg',
  bitbucket: '/connectors/bitbucket.svg',
  // Meetings
  loom: '/connectors/loom.svg',
}

/** Logo URL for a connector id / source kind, if an official mark is bundled. */
export function logoFor(key: string): string | undefined {
  return brandLogo[key]
}
