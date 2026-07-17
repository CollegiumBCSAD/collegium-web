# Collegium Web

The frontend web client for the Collegium.

## Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: Package manager for dependency management

## Installation

Install the dependencies:

```bash
pnpm install
```

## Development Commands

- `pnpm dev`: Start the Next.js development server at `http://localhost:3000`.
- `pnpm build`: Create an optimized production build.
- `pnpm start`: Run the built production application.
- `pnpm lint`: Run ESLint checks.

## Project Structure

- `app/`: Next.js App Router pages, layouts, and route handlers.
- `components/`: Reusable components (UI, layouts, domain-specific modules).
- `lib/`: Shared TypeScript types, utilities, auth configurations, and backend API client wrappers (`lib/api`).
- `public/`: Static assets, manifests, and service worker definitions.

For detailed architecture guidelines, role access controls, and API schemas, see [reference.md](file:///home/punisher/Documents/collegium/collegium-web/reference.md).


