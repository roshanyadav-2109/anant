# Anant — Enterprise Web Interface

> It doesn't just answer. It remembers.

Anant is a **sovereign cognitive memory engine**. This repository is its v1
enterprise web interface — built so that **memory is the hero and chat is the
doorway**. Every fact the system knows carries its provenance: who said it,
where it came from, and whether it was stated, inferred, or aggregated.

Everything is designed to feel like a calm, trustworthy **system of record** —
local, private, and yours.

---

## Design language

A restrained, production-grade enterprise aesthetic — precise, monochrome, and
quiet, with a single decisive accent.

- **Typeface** — [Inter](https://rsms.me/inter/) only, self-hosted via
  `@fontsource-variable`. Regular (400) throughout; medium (500) for gentle
  hierarchy; semi-bold (600) reserved for the selected navigation tab.
- **Canvas** — pure **white** surfaces, near-black ink, and hairline neutral
  rules. No texture, no tint.
- **Accent** — one **deep royal blue** (`#1e40af`) used sparingly for the
  active tab, primary actions, and focus. Everything else is greyscale — no
  multi-colour.
- **Navigation** — a **black rail** with floating 2px-cornered tabs. The
  selected tab fills deep royal blue, its label turns semi-bold white, and a
  brighter-blue vertical line marks its left edge.
- **Provenance** — three tonal greyscale classes (User-stated / Inferred /
  Aggregated), distinguished by tone and icon rather than colour, used
  consistently across cards, chips, and insights.
- **Icons** — a **bespoke, monochrome, hairline icon family** drawn in-house
  (`src/icons`). No third-party icon library.
- **Sovereignty** — a persistent "Local · no data leaves" indicator on every
  screen. A headline, never a footnote.

## Screens

| Route | Screen | Notes |
| --- | --- | --- |
| `/login` | Auth & brand doorway | Sign in / up, or explore a demo workspace |
| `/memory` | **Memory (hero)** | List + graph views, provenance, confidence, supersession, edit/forget |
| `/chat` | Chat | Streaming answers, inline citation chips, live Sources panel |
| `/connectors` | Connectors | Status pills, inbound-only guarantee, sync progress |
| `/insights` | Insights | Consolidation output — framed as the system's own inference |
| `/search` | Global search | Across memories & conversations, source-scoped |
| `/settings` | Settings & sovereignty | Data location, export, delete-everything |
| `/workspace` | Workspace (admin) | Members, roles, connector governance, audit log |

## Stack

- **React 19 + TypeScript + Vite 6**
- **Tailwind CSS v4** (CSS-first tokens in `src/index.css`)
- **Supabase** for auth and the workspace-scoped data model
- **React Router 7**

## Getting started

```bash
npm install
cp .env.example .env      # fill in your Supabase URL + anon key
npm run dev               # http://localhost:5173
```

```bash
npm run build             # typecheck + production build
npm run preview           # serve the production build
```

### Environment

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

The anon key is browser-safe — Row Level Security enforces all access. The app
also runs **without** a backend: "Explore the demo workspace" opens the full,
browsable interface with seeded content.

## Backend

The database schema lives in [`supabase/schema.sql`](supabase/schema.sql) and is
applied to the project. Highlights:

- **Hard tenant isolation** — every table is workspace-scoped, enforced by RLS.
- **Provenance is first-class** — `provenance_class` enum on memories & insights.
- **Supersession as history** — memories keep `superseded_from` / `superseded_to`
  rather than overwriting.
- **Private vs shared memory** — a `memory_scope` boundary per row.
- **Sign-up bootstrap** — a trigger provisions each new user a profile, a
  personal workspace, and an admin membership.
- **Audit log** — who connected what, accessed which memory, forgot what.

`src/lib/data.ts` provides typed, RLS-safe query helpers over this schema.

## Project layout

```
src/
  icons/            Bespoke monochrome icon set
  components/       AppShell, Provenance, MemoryCard, MemoryGraph, ConnectorCard, InsightCard, ui primitives
  pages/            One file per screen
  lib/              supabase client, auth context, types, data access, seed content
  index.css         Design tokens (Tailwind v4 @theme) + base styles
supabase/
  schema.sql        Full schema with RLS
```

## Accessibility & responsiveness

Desktop-first (the primary surface), functional down to tablet. Keyboard focus
rings, semantic roles, and AA-minded contrast throughout.

---

*Anant — Neural AI. Treat the visual tokens as refined; treat the screens,
component system, provenance model, and phasing as the contract.*
