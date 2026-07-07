import type { ReactNode, SVGProps } from 'react'

/**
 * Anant icon set — bespoke, monochrome, hairline.
 * A single cohesive family drawn at 24×24 with a 1.4 stroke, rounded joins.
 * No third-party icon library; nothing colourful. Every glyph inherits
 * currentColor so it lives quietly inside the paper-and-ink system.
 */

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
  strokeWidth?: number
}

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

/* ---- Brand ------------------------------------------------------------- */

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

/* ---- Navigation -------------------------------------------------------- */

// Chat — a single spoken line, opening.
export function Chat(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3H5A1.5 1.5 0 0 1 3.5 14V8A1.5 1.5 0 0 1 5 6.5Z" />
      <path d="M8 10.5h8M8 13h5" opacity={0.5} />
    </Svg>
  )
}

// Memory — stacked leaves of a ledger, the record.
export function Memory(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 4.5h9l3.5 3.5V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" />
      <path d="M14.5 4.5V8h3.5" opacity={0.6} />
      <path d="M8 12h7M8 15h7M8 9h3" opacity={0.5} />
    </Svg>
  )
}

// Connectors — two nodes joined by a returning thread.
export function Connectors(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="6.5" cy="7" r="2.2" />
      <circle cx="17.5" cy="17" r="2.2" />
      <path d="M8.6 8.4C11 11 13 13 15.4 15.6" opacity={0.55} />
      <path d="M15.3 7C13 7 12 8.4 12 12" opacity={0.35} />
    </Svg>
  )
}

// Insights — a noticing eye of light.
export function Insights(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 5.5c-3.6 0-6.4 2.3-8 6 1.6 3.7 4.4 6 8 6s6.4-2.3 8-6c-1.6-3.7-4.4-6-8-6Z" />
      <circle cx="12" cy="11.5" r="2.2" />
    </Svg>
  )
}

// Search — an aperture with a stem.
export function Search(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l4.5 4.5" />
    </Svg>
  )
}

// Workspace — a set of members under one roof.
export function Workspace(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="9" cy="9" r="2.4" />
      <circle cx="16.5" cy="10.5" r="1.9" opacity={0.6} />
      <path d="M4.5 18c.5-2.8 2.3-4.3 4.5-4.3s4 1.5 4.5 4.3" />
      <path d="M15 13.5c1.8.1 3.2 1.3 3.8 3.4" opacity={0.6} />
    </Svg>
  )
}

// Settings — an adjustable node on a rail (not a cog).
export function Settings(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 8h9M17 8h3" />
      <circle cx="15" cy="8" r="2" />
      <path d="M4 16h3M11 16h9" />
      <circle cx="9" cy="16" r="2" />
    </Svg>
  )
}

// Panel — a window with a side rail; toggles the sidebar to icons only.
export function Panel(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M9.5 5.2v13.6" />
      <path d="M5.7 9h1.6M5.7 12h1.6" opacity={0.55} />
    </Svg>
  )
}

/* ---- Sovereignty ------------------------------------------------------- */

// Local / sovereign — a shield that holds a home.
export function Sovereign(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.5 5 6v5.2c0 4.2 2.8 7.6 7 9.3 4.2-1.7 7-5.1 7-9.3V6l-7-2.5Z" />
      <path d="M9.5 12.2 12 10l2.5 2.2V16h-5v-3.8Z" opacity={0.6} />
    </Svg>
  )
}

/* ---- Provenance -------------------------------------------------------- */

// User-stated — an open quotation.
export function Stated(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 8.5c-2 .6-3.2 2.2-3.2 4.4H9v3H5.2v-3M18 8.5c-2 .6-3.2 2.2-3.2 4.4H18v3h-3.8v-3" />
    </Svg>
  )
}

// Inferred — a small sighted spark.
export function Inferred(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4.5 13.4 10 19 11.5 13.4 13 12 18.5 10.6 13 5 11.5 10.6 10 12 4.5Z" />
    </Svg>
  )
}

// Aggregated — a pattern gathered from many.
export function Aggregated(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4.5 19 8l-7 3.5L5 8l7-3.5Z" />
      <path d="M5 12l7 3.5L19 12" opacity={0.55} />
      <path d="M5 16l7 3.5L19 16" opacity={0.3} />
    </Svg>
  )
}

/* ---- Actions ----------------------------------------------------------- */

export function Edit(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.5 19.5h4l9-9a1.8 1.8 0 0 0 0-2.5l-1.5-1.5a1.8 1.8 0 0 0-2.5 0l-9 9v4Z" />
      <path d="M13 7.5 16.5 11" opacity={0.5} />
    </Svg>
  )
}

// Forget — a leaf released, not a hostile bin.
export function Forget(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 8h12M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" />
      <path d="M7 8l.8 10.5A1.5 1.5 0 0 0 9.3 20h5.4a1.5 1.5 0 0 0 1.5-1.5L17 8" />
      <path d="M10.5 11.5v5M13.5 11.5v5" opacity={0.45} />
    </Svg>
  )
}

export function Confirm(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12.5 10 17.5 19 7" />
    </Svg>
  )
}

export function Dismiss(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
    </Svg>
  )
}

export function Plus(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  )
}

export function Send(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 19V6.5M12 6.5 6.5 12M12 6.5 17.5 12" />
    </Svg>
  )
}

export function ChevronDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.5 9.5 12 15l5.5-5.5" />
    </Svg>
  )
}

export function ChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9.5 6.5 15 12l-5.5 5.5" />
    </Svg>
  )
}

export function ArrowRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.5 12h14M13 6.5 18.5 12 13 17.5" />
    </Svg>
  )
}

export function Filter(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.5 7h15M7 12h10M10 17h4" />
    </Svg>
  )
}

export function ListView(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 7h11M8 12h11M8 17h11" />
      <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" opacity={0.6} />
    </Svg>
  )
}

export function GraphView(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="6" cy="7" r="1.8" />
      <circle cx="17.5" cy="9" r="1.8" />
      <circle cx="11" cy="17.5" r="1.8" />
      <path d="M7.5 8.2 9.6 16M7.4 7.6 15.8 8.6M16.6 10.6 12.3 16" opacity={0.5} />
    </Svg>
  )
}

export function Stop(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
    </Svg>
  )
}

export function Regenerate(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M19 12a7 7 0 1 1-2-4.9" />
      <path d="M19 5v3.5h-3.5" />
    </Svg>
  )
}

export function Attach(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M18 11.5 12 17.5a3.5 3.5 0 0 1-5-5l6.5-6.5a2.3 2.3 0 0 1 3.3 3.3L10.3 15.8a1.1 1.1 0 0 1-1.6-1.6l5.8-5.8" />
    </Svg>
  )
}

export function Sync(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 9a7 7 0 0 1 12-2.5M19 15a7 7 0 0 1-12 2.5" />
      <path d="M16.5 4v3H13.5M7.5 20v-3h3" />
    </Svg>
  )
}

export function Alert(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4.5 20.5 19h-17L12 4.5Z" />
      <path d="M12 10v4M12 16.5v.01" opacity={0.7} />
    </Svg>
  )
}

export function Dots(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth={2.2} />
    </Svg>
  )
}

export function Export(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 15V4.5M12 4.5 8.5 8M12 4.5 15.5 8" />
      <path d="M5 14v3.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V14" opacity={0.6} />
    </Svg>
  )
}

export function Time(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v4.2l2.8 1.8" />
    </Svg>
  )
}

export function Person(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="9" r="3" />
      <path d="M5.5 19c.6-3.2 3.2-5 6.5-5s5.9 1.8 6.5 5" />
    </Svg>
  )
}

export function Lock(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.6" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
      <path d="M12 14v2.5" opacity={0.5} />
    </Svg>
  )
}

export function Logout(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13 5.5H6.5A1.5 1.5 0 0 0 5 7v10a1.5 1.5 0 0 0 1.5 1.5H13" />
      <path d="M16 8.5 19.5 12 16 15.5M10 12h9.5" opacity={0.85} />
    </Svg>
  )
}

export function Node(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="12" cy="12" r="7.5" opacity={0.4} />
    </Svg>
  )
}

export function Shield(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.5 5 6v5.2c0 4.2 2.8 7.6 7 9.3 4.2-1.7 7-5.1 7-9.3V6l-7-2.5Z" />
      <path d="M8.8 11.8 11 14l4.2-4.4" opacity={0.7} />
    </Svg>
  )
}

/* ---- Connector glyphs (monochrome stand-ins, never colourful) ---------- */

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
