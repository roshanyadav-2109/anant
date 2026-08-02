import type { ReactNode, SVGProps } from 'react'
import { solar } from './solar-data'

/**
 * Anant icon set.
 * Primary UI glyphs are Solar (Bold) — a premium, filled family (© CC BY 4.0,
 * see NOTICE). The Anant brand mark and the neutral connector stand-ins remain
 * bespoke. Every glyph inherits currentColor.
 */

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
  strokeWidth?: number
}

/** Render a Solar glyph by key from the generated data. */
function solarIcon(key: string) {
  const d = solar[key]
  return function Icon({ size = 20, className, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={d?.vb ?? '0 0 24 24'}
        fill="currentColor"
        className={className}
        aria-hidden="true"
        {...rest}
        dangerouslySetInnerHTML={{ __html: d?.inner ?? '' }}
      />
    )
  }
}

/* ---- Navigation & UI (Solar Bold) -------------------------------------- */

export const Chat = solarIcon('Chat')
export const Memory = solarIcon('Memory')
export const Connectors = solarIcon('Connectors')
export const Insights = solarIcon('Insights')
export const Search = solarIcon('Search')
export const Workspace = solarIcon('Workspace')
export const Settings = solarIcon('Settings')
export const Panel = solarIcon('Panel')
export const Sovereign = solarIcon('Sovereign')

/* ---- Provenance -------------------------------------------------------- */

export const Stated = solarIcon('Stated')
export const Inferred = solarIcon('Inferred')
export const Aggregated = solarIcon('Aggregated')

/* ---- Actions ----------------------------------------------------------- */

export const Edit = solarIcon('Edit')
export const Forget = solarIcon('Forget')
export const Confirm = solarIcon('Confirm')
export const Dismiss = solarIcon('Dismiss')
export const Plus = solarIcon('Plus')
export const Send = solarIcon('Send')
export const ChevronDown = solarIcon('ChevronDown')
export const ChevronRight = solarIcon('ChevronRight')
export const ArrowRight = solarIcon('ArrowRight')
export const Filter = solarIcon('Filter')
export const ListView = solarIcon('ListView')
export const GraphView = solarIcon('GraphView')
export const Stop = solarIcon('Stop')
export const Regenerate = solarIcon('Regenerate')
export const Attach = solarIcon('Attach')
export const Sync = solarIcon('Sync')
export const Alert = solarIcon('Alert')
export const Dots = solarIcon('Dots')
export const Export = solarIcon('Export')
export const Time = solarIcon('Time')
export const Person = solarIcon('Person')
export const Lock = solarIcon('Lock')
export const Logout = solarIcon('Logout')
export const Node = solarIcon('Node')
export const Shield = solarIcon('Shield')

/* ---- Bespoke: brand mark + neutral connector stand-ins ----------------- */

function Svg({ size = 20, strokeWidth = 1.8, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

// Anant mark — a knotted thread that returns to itself: memory that holds.
export function Mark({ size = 24, ...p }: IconProps) {
  return (
    <Svg size={size} strokeWidth={1.5} {...p}>
      <path d="M12 3.5 C6.8 3.5 4 7 4 11.2 C4 16.4 8 20.5 12 20.5 C16 20.5 20 16.4 20 11.2 C20 7 17.2 3.5 12 3.5 Z" opacity={0.35} />
      <path d="M8.5 15.5 C8.5 11 10 8 12 8 C14 8 15.5 11 15.5 15.5" />
      <circle cx="12" cy="8" r="1.15" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function CoSlack(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="10.4" y="4.5" width="3.2" height="8" rx="1.6" />
      <rect x="10.4" y="12.5" width="3.2" height="7" rx="1.6" opacity={0.55} />
      <rect x="4.5" y="10.4" width="8" height="3.2" rx="1.6" opacity={0.8} />
      <rect x="12.5" y="10.4" width="7" height="3.2" rx="1.6" opacity={0.4} />
    </Svg>
  )
}

export function CoGmail(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="6.5" width="16" height="11" rx="1.6" />
      <path d="M4.5 7.5 12 13l7.5-5.5" />
    </Svg>
  )
}

export function CoOutlook(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="6.5" width="16" height="11" rx="1.6" opacity={0.5} />
      <rect x="4" y="6.5" width="9" height="11" rx="1.6" />
      <circle cx="8.5" cy="12" r="2.2" />
    </Svg>
  )
}

export function CoDrive(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9.5 4.5h5L21 15h-5L9.5 4.5Z" />
      <path d="M9.5 4.5 3 15l2.5 4.5L12 9 9.5 4.5Z" opacity={0.55} />
      <path d="M5.5 19.5h10L18 15H8l-2.5 4.5Z" opacity={0.3} />
    </Svg>
  )
}

export function CoNotion(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5" y="4.5" width="14" height="15" rx="1.6" />
      <path d="M8.5 15.5v-7l7 7v-7" />
    </Svg>
  )
}

export function CoCalendar(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4.5" y="6" width="15" height="13" rx="1.6" />
      <path d="M4.5 10h15M8.5 4v3.5M15.5 4v3.5" opacity={0.7} />
      <path d="M8 13.5h2.5" opacity={0.5} />
    </Svg>
  )
}

export function CoLinear(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.5 13.5 10.5 19.5M4.6 9.5 14.5 19.4M6.5 6.5 17.5 17.5M10.5 4.6 19.4 13.5M14.5 4.5 19.5 9.5" opacity={0.85} />
    </Svg>
  )
}

export function CoGithub(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.8c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.6 7.6 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3.1-1.8 3.8-3.6 4 .3.3.6.8.6 1.6v2.4c0 .2.1.5.6.4A8 8 0 0 0 20 11.8c0-4.4-3.6-8-8-8Z" />
    </Svg>
  )
}

export function CoTeams(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="8" width="9" height="9" rx="1.6" />
      <path d="M5.5 10.5h6M8.5 10.5V15" opacity={0.7} />
      <circle cx="16.5" cy="8" r="2.2" opacity={0.55} />
      <path d="M13 17c.4-2 1.8-3 3.5-3s3.1 1 3.5 3" opacity={0.4} />
    </Svg>
  )
}

export function CoFireflies(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7.5" opacity={0.35} />
      <path d="M12 4.5v-.01M19.5 12h.01M12 19.5v.01M4.5 12h-.01" opacity={0.7} />
    </Svg>
  )
}

export function CoGeneric(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9 12h6M12 9v6" opacity={0.5} />
    </Svg>
  )
}
