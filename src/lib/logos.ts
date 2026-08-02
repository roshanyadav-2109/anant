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
}

/** Logo URL for a connector id / source kind, if an official mark is bundled. */
export function logoFor(key: string): string | undefined {
  return brandLogo[key]
}
