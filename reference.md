# Collegium – Frontend (Web): AI Context Reference

> **Purpose:** This file is a ground-truth reference for any AI assistant working inside this repository. Read this before touching any file. Do not hallucinate features, components, or routes that are not described here.

---

## What Is Collegium?

Collegium is a university-verified collegiate esports management platform for the **Philippine collegiate circuit**. It is built as a **Progressive Web App (PWA)** and supports four game titles:

| Title | Abbreviation | Genre | Data Source |
|---|---|---|---|
| Valorant | VAL | FPS (PC) | Riot Games REST API (automated) |
| League of Legends | LOL | MOBA (PC) | Riot Games REST API (automated) |
| Mobile Legends: Bang Bang | MLBB | MOBA (Mobile) | Two-step peer-confirmation (manual) |
| Call of Duty: Mobile | CODM | FPS (Mobile) | Two-step peer-confirmation (manual) |

Access is restricted to users with verified **`.edu.ph` institutional email addresses** only.

---

## Repository Role

This repo is the **frontend web client**. It is one of two repos:

| Repo | Role |
|---|---|
| `collegium-web` ← **this repo** | Next.js v14 frontend PWA |
| `collegium-server` | NestJS backend API server (separate repo) |

This repo communicates with the backend server via REST API calls. It does **not** contain business logic, database access, or ranking computation — those live exclusively in the backend.

---

## Tech Stack

### Framework
- **Next.js v14** — App Router architecture, server-side rendering (SSR) enabled
- Do not use the Pages Router. All routes use the `app/` directory

### Language
- **TypeScript v5** — strict typing enforced throughout

### Styling
- **Tailwind CSS v3** — utility-first, no custom CSS files unless absolutely necessary
- **shadcn/ui** — component library built on Radix UI primitives; use these before building custom components

### Authentication
- **Auth.js (NextAuth.js) v5** — handles session management, `.edu.ph` domain verification, and role hydration on the client

### PWA
- Service worker enabled for offline caching of: match schedules, portfolio data, community announcements
- Must be accessible on both desktop and mobile browsers without native app installation

### Deployment
- **Vercel** — frontend hosting target

---

## App Router Directory Structure

All routes live under `app/`. Use the Next.js App Router conventions strictly.

```
app/
├── (public)/                  # Public-facing pages (no auth required)
│   ├── leaderboard/           # University Glicko-2 leaderboard
│   ├── universities/[id]/     # University profile page
│   ├── players/[id]/          # Public athlete portfolio view
│   └── community/             # Community news hub
│
├── (auth)/                    # Auth flows
│   ├── login/                 # Login page (Auth.js)
│   └── register/              # Registration (enforces .edu.ph)
│
├── (dashboard)/               # Authenticated area (all roles)
│   ├── layout.tsx             # Dashboard shell with sidebar nav
│   ├── home/                  # Role-aware home/overview screen
│   │
│   ├── scrims/                # Peer-to-Peer Scrim Board
│   │   ├── page.tsx           # Browse available scrim slots
│   │   ├── post/              # Post a new availability slot (COACH only)
│   │   └── [id]/              # Scrim request detail + chat
│   │
│   ├── tournaments/           # Tournament Module
│   │   ├── page.tsx           # List all tournaments
│   │   ├── create/            # Create tournament (ADMIN/COACH)
│   │   └── [id]/
│   │       ├── page.tsx       # Tournament overview
│   │       ├── bracket/       # Bracket viewer (live updates via polling/Redis)
│   │       └── war-room/      # War Room chat (COACH + ORGANIZER only)
│   │
│   ├── match-log/             # Match logging flows
│   │   ├── [id]/submit/       # Submit match result / screenshot (COACH)
│   │   └── [id]/verify/       # Peer-verification screen (opposing COACH)
│   │
│   ├── portfolio/
│   │   └── [userId]/          # Dual-layer athlete portfolio (self + public)
│   │
│   └── admin/                 # System Administrator panel (ADMIN only)
│       ├── users/             # User management
│       ├── universities/      # University management
│       └── disputes/          # Disputed match resolution
│
components/
├── ui/                        # shadcn/ui re-exports and overrides
├── layout/                    # Sidebar, topbar, shell components
├── scrims/                    # Scrim Board specific components
├── tournaments/               # Bracket, match card, tournament form components
├── war-room/                  # Chat UI components
├── ranking/                   # Leaderboard table, university card, rating badge
├── portfolio/                 # Practice vs Tournament stats display
└── shared/                    # Generic reusable components (buttons, modals, etc.)

lib/
├── api/                       # API client functions (fetch wrappers per domain)
├── auth/                      # Auth.js config, session helpers, role guards
├── types/                     # Shared TypeScript types mirroring backend schemas
└── utils/                     # Formatting helpers, date utils, VCS display helpers

public/
└── ...                        # Static assets, PWA manifest, service worker
```

---

## Role-Based Access Control (RBAC) — Frontend

The session exposes the user's role. Use this to conditionally render UI and protect routes.

| Role | Enum Value | Key UI Access |
|---|---|---|
| Athlete | `ATHLETE` | Portfolio (own), Scrim Board (read), Tournament viewer |
| Coach / Manager | `COACH` | Scrim post + approve, match submission, War Room, bracket management |
| Non-Athlete | `NON_ATHLETE` | Public leaderboard, community hub, read-only portfolio views |
| System Administrator | `ADMIN` | All of the above + admin panel, dispute resolution |

**Client-side route guards:** Use middleware or layout-level session checks to redirect unauthorized users. Do not rely solely on hiding UI elements — the route itself must be protected.

---

## Key Pages and Their Purpose

### Leaderboard (`/leaderboard`)
- Displays university-wide Glicko-2 standings
- Shows: university name, rating (`glicko2_rating`), rating deviation (`glicko2_rd`), rank position
- Filterable by game title (`VALORANT | LOL | MLBB | CODM`)
- Public — no auth required
- Data is read-only; computed by the backend ranking engine

### University Profile (`/universities/[id]`)
- Displays a university's registered varsity players, team history, and rating trend
- Public — no auth required

### Athlete Portfolio (`/portfolio/[userId]` and `/players/[id]`)
- **Dual-layer display** — this is a core feature, not optional:
  - **Practice Reliability Score** — derived from scrim completion rate, consistency, opponent diversity (no KDA shown here)
  - **Peak Performance Score** — derived from tournament stats (KDA, objective score, role metrics, weighted by Tournament Multiplier)
- Do not merge these two into a single stat block
- Both layers must be visually distinct

### Scrim Board (`/scrims`)
- Lists available practice slots posted by university coaches
- Filterable by: game title, rank band
- COACH role: can post new slots, approve/reject incoming requests
- On approval: a private scrim chat is auto-generated (handled by backend, surfaced here as a chat thread)

### Tournament Bracket (`/tournaments/[id]/bracket`)
- Renders single-elimination or round-robin bracket
- Live updates: poll the backend or subscribe to bracket update events
- Match cards show: university names, scores, match status
- COACH/ADMIN: can confirm match results from this view

### War Room (`/tournaments/[id]/war-room`)
- Private chatroom auto-created when a tournament match is confirmed
- Accessible only to: Tournament Organizer + the two University Coaches of the matched teams
- Do not render this route for ATHLETE or NON_ATHLETE roles — redirect away
- Messages are real-time via the backend's Redis pub/sub layer

### Match Logging (`/match-log/[id]/submit` and `/match-log/[id]/verify`)
- **Submit** (winning COACH): upload scoreboard screenshot + enter stats (for MLBB/CODM); for VAL/LOL stats are auto-fetched by backend
- **Verify** (opposing COACH): review submitted data, confirm or dispute
- Match is only marked `is_verified = true` after both parties act — reflect this state clearly in the UI

### Admin Panel (`/admin`)
- User management: view, role-change, suspend accounts
- University management: approve new university registrations
- Disputes: review flagged peer-confirmation conflicts, manually override match results

---

## Auth.js Configuration Notes

- Provider: credentials (email + password) with `.edu.ph` domain enforcement
- On session: expose `user.role`, `user.universityId`, `user.displayName`
- Middleware must protect all `/dashboard/*` routes
- Redirect unauthenticated users to `/login`
- Redirect authenticated NON_ATHLETE away from COACH/ADMIN routes

---

## API Communication

All backend calls go through `lib/api/`. Do not make raw `fetch()` calls inside components.

Follow this pattern per domain:

```ts
// lib/api/scrims.ts
export async function getScrimSlots(filters: ScrimFilters) { ... }
export async function postScrimSlot(data: CreateScrimDto) { ... }
export async function approveScrimRequest(scrimId: string) { ... }
```

The backend base URL comes from the environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001   # local dev
```

---

## Environment Variables Required

```env
# Backend API
NEXT_PUBLIC_API_URL=

# Auth.js
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# App
NODE_ENV=development | production
```

---

## Component Conventions

- Use **shadcn/ui** components first — `Button`, `Card`, `Dialog`, `Table`, `Badge`, `Tabs`, `Input`, `Select`, etc.
- Do not install a separate UI library alongside shadcn/ui
- All data-fetching components that show loading states must use **Suspense** with a skeleton fallback
- Forms use **React Hook Form** + **Zod** for validation
- No inline styles — Tailwind utility classes only
- Dark mode: design with the esports community aesthetic in mind; dark backgrounds are expected

---

## TypeScript Types

Mirror the backend schema exactly. Keep types in `lib/types/`. Do not redefine the same shape in multiple files.

Key types to keep consistent:

```ts
type Role = 'ATHLETE' | 'COACH' | 'NON_ATHLETE' | 'ADMIN';
type GameTitle = 'VALORANT' | 'LOL' | 'MLBB' | 'CODM';
type MatchMode = 'TOURNAMENT' | 'SCRIM';
type DataSource = 'API' | 'PEER_VERIFIED';

interface University {
  id: string;
  name: string;
  domain: string;
  glicko2Rating: number;
  glicko2Rd: number;
  glicko2Sigma: number;
}

interface PlayerStat {
  id: string;
  matchId: string;
  userId: string;
  kills: number | null;       // null in Scrim Mode — always handle this
  deaths: number | null;
  assists: number | null;
  objectiveScore: number | null;
  vcsScore: number;
  dataSource: DataSource;
}
```

---

## What This Repo Does NOT Do

- It does **not** compute VCS scores, Glicko-2 ratings, or Bottom-Up Aggregation — all ranking logic is backend-only
- It does **not** call the Riot Games API directly — the backend handles all third-party API calls
- It does **not** store match data — it only displays what the backend returns
- It does **not** validate `.edu.ph` emails independently — that is Auth.js + backend responsibility
- It does **not** contain any Prisma or database code
- It does **not** handle Redis pub/sub directly — it consumes real-time data surfaced by the backend

---

## Naming Conventions

| Thing | Convention |
|---|---|
| Next.js route folders | `kebab-case` |
| React components | `PascalCase.tsx` |
| Utility/helper files | `camelCase.ts` |
| API client files | `camelCase.ts` named by domain (e.g. `scrims.ts`) |
| TypeScript types/interfaces | `PascalCase` |
| Enums / union literal types | `SCREAMING_SNAKE_CASE` values |
| Tailwind class ordering | Follow prettier-plugin-tailwindcss order |
| Environment variables | `SCREAMING_SNAKE_CASE`; prefix public vars with `NEXT_PUBLIC_` |

---

