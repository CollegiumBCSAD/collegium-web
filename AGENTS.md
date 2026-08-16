# Collegium — Development Guidelines and Engineering Standards

This document outlines mandatory architectural patterns, coding conventions, and software engineering standards for the codebase. 

All developers and automated agents must inspect the surrounding codebase conventions first and strictly adhere to these guidelines to ensure code quality, maintainability, reusability, and type safety.

---

## 1. Codebase Inspection Protocol
Before implementing features, modifying components, or introducing state:
1. **Inspect existing conventions**: Analyze how existing pages, components, and services are implemented (e.g., `components/scrims/`, `components/dashboard/`, or `context/AuthContext.tsx`).
2. **Reuse established utilities**: Use existing helpers in `@/lib/`, `@/context/`, `@/services/`, and `@/types`. Do not duplicate data-fetching logic or component models.

---

## 2. Type System and Centralized Interfaces (`@/types`)
- **Centralized Definitions**: All TypeScript interfaces and types must be defined in or imported from `@/types` (`types/*.ts`).
- **No Duplicate Inline Types**: Do not define inline `interface` or `type` blocks within page files (`page.tsx`) or component files (`*.tsx`).
- **Domain Modules**:
  - `@/types/auth`: `UserProfile`, `AuthContextType`, `UniversityInfo`
  - `@/types/games`: `GameId`, `GameInfo`
  - `@/types/teams`: `Team`, `TeamMember`, `JoinRequest`, `CaptainRequest`
  - `@/types/scrims`: `ScrimOffer`, `ScrimStatus`
  - `@/types/tournaments`: `Tournament`, `BracketMatch`, `MatchBoxScore`, `PlayerStats`

---

## 3. Component Granularity and Modularity
- **Container Pages**: Page files (`app/(public)/*/page.tsx`) must remain concise containers that compose modular sub-components.
- **Component File Limits**: Avoid monolithic components exceeding 200 lines of code. Decompose complex UI into sub-components inside feature directories:
  - `components/scrims/` (`ScrimCard.tsx`, `PostScrimModal.tsx`, `ScrimFilterBar.tsx`)
  - `components/dashboard/` (`AthleteProfileBanner.tsx`, `TeamRosterCard.tsx`, `DashboardShortcutTile.tsx`)
  - `components/tournaments/` (`TournamentCard.tsx`)
- **Explicit Component Contracts**: Every component must explicitly define a typed interface for its props using symbols imported from `@/types`.

---

## 4. Modular API Services Layer (`@/services`)
- **Dedicated Services Layer**: All HTTP requests and endpoint logic must be located within domain-specific services in `services/`:
  - `@/services/apiClient`: Base HTTP client (`apiClient.get`, `apiClient.post`, `apiClient.patch`, `apiClient.delete`) supporting request authorization and silent token refresh.
  - `@/services/authService`: Methods for authentication (`login`, `register`, `getMe`, `logout`, `refreshToken`).
  - `@/services/teamsService`: Methods for team management (`getTeams`, `getTeamById`, `createTeam`, `joinTeam`).
  - `@/services/scrimsService`: Methods for scrim offers (`getScrims`, `createScrim`, `acceptScrim`).
  - `@/services/tournamentsService`: Methods for tournament data (`getTournaments`, `getBracket`, `getBoxScore`).
- **Global Contexts**:
  - `useAuth()`: Manages user profile state, session status, and authentication credentials.
  - `useGame()`: Manages selected game title, theme accents, and modal state.
- **Silent Token Auto-Refresh**: The base API client automatically attempts token renewal via `/auth/refresh` upon encountering `401 Unauthorized` responses. Manual token refresh loops in UI components are prohibited.
- **Data Persistence**: Invoke domain API services (`@/services`). Fallback to local storage (e.g., `lib/teams.ts`) only when operating in offline/demo environments.

---

## 5. Design System and Modal Guidelines
- **Visual Identity**: Maintain modern dark theme, curated game accent colors (`#E53A4C` for Valorant, `#00A3FF` for LoL, `#E5B800` for CODM, `#A855F7` for MLBB), glassmorphism (`backdrop-blur-md`), and consistent typography (`font-display` for headers, `font-sans` for body).
- **Modal Lifecycle Requirements**: Modal components must implement:
  1. Backdrop click-to-close behavior.
  2. Keyboard listener for the `Escape` key (`useEffect`).
  3. Body scroll locking (`document.body.style.overflow = "hidden"` on open, `"unset"` on unmount).
  4. Accessible close button with an `aria-label="Close Modal"` attribute.

---

## 6. Verification and Quality Assurance
Prior to completing any task or submitting a pull request:
- [ ] Execute `npm run lint` — Must pass with **0 errors and 0 warnings**.
- [ ] Execute `npm run build` — Must compile successfully without TypeScript errors.
- [ ] Type Audit — Confirm all component props and models are imported from `@/types`.
- [ ] Git Commit Discipline — Write clear, conventional commit messages (`refactor: ...`, `feat: ...`, `fix: ...`).
