# Torch Admin Console

Internal admin dashboard for the Torch recovery platform. It gives super admins and staff a single place to manage members, counselors, support groups, events, treatment plans, in-app content, and aggregate/behavioral analytics.

> **Status:** Frontend scaffold with static/mock data. Not yet connected to a backend — see [Roadmap](#roadmap).

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Features](#features)
- [Architecture Notes](#architecture-notes)
- [Environment Configuration](#environment-configuration)
- [Styling & Theming](#styling--theming)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| UI primitives | Radix UI, shadcn-style components (`src/app/components/ui`) |
| Charts | Recharts |
| Icons | lucide-react + hand-authored inline SVGs |
| Forms | react-hook-form (available; not yet wired into forms) |

## Project Structure

```
src/
  app/
    App.tsx            # Router + provider bootstrap (entry component)
    app-context.tsx     # Auth/theme/modal state (React Context)
    routes.tsx          # Route table, keyed by AppPageKey
    layout/
      AppLayout.tsx     # Shell: sidebar + outlet + active modal
      Sidebar.tsx       # Nav sections/items
    components/ui/      # shadcn/Radix primitives (button, dialog, table, ...)
  components/
    icons/              # Shared inline SVG icon components
    common/              # Reusable primitives (MetricCard, Modal, Table, FormFields, ...)
    modals/              # One file per modal (CreateGroupModal, AddUserModal, ...)
  pages/                 # One file per route/page, mock data colocated
  styles/                # Tailwind entry, theme tokens, fonts
main.tsx                 # Vite entry point
```

Each page in `src/pages/` currently owns its own mock dataset (e.g. `USERS`, `GROUPS`, `SIGNALS`). This keeps the UI fully functional without a backend and gives each page an obvious, isolated place to swap in a real data source later.

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm — a `pnpm-workspace.yaml` is present)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the Vite dev server (default `http://localhost:5173`, auto-increments if the port is busy) with hot module replacement.

### Production build

```bash
npm run build
```

Type-checks and bundles the app into `dist/`.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the local dev server with HMR |
| `npm run build` | Production build to `dist/` |

## Features

- **Authentication shell** — login screen gated by `AppContext.authenticated`; protected routes redirect to `/login` when signed out.
- **Support Groups** — searchable/filterable table, create-group modal.
- **Real World Resources (Events)** — weekly mini-calendar, event table, create-event modal.
- **User Management** — searchable user table, view/edit profile modal.
- **Counselor Management** — counselor directory, add-counselor modal.
- **Treatment Plans** — plan table with progress indicators, new-plan modal.
- **In-App Resources** — media/literature content library with type filters and add-content modal.
- **Aggregate Data** — population-level sobriety/engagement trend charts (Recharts) with a custom date-range picker.
- **Relapse Signals** — risk-tiered signal feed with substance/type breakdown and response-time trend.
- **Insights** — auto-generated, cohort-backed correlational insights with export modal.
- **Settings** — light/dark theme toggle, notification and access-control entry points.
- **Profile** — account summary and sign-out.

All list/detail views use static in-memory data (see [Project Structure](#project-structure)); actions like "Create", "Edit", and "Export" currently close their modal without persisting anything.

## Architecture Notes

- **Routing vs. state:** the router (`createAppRouter`) is built once and does not change shape at runtime. Auth state, theme, and the currently-open modal all flow through `AppContext` (`src/app/app-context.tsx`) instead of triggering route/router rebuilds.
- **Page keys:** `AppPageKey` (in `routes.tsx`) is the single source of truth mapping a route to a page component, resolved in `App.tsx`'s `renderPage`.
- **Modals:** a single `modal` value in `AppContext` drives which modal (if any) is rendered by `AppLayout`. Only one modal can be open at a time.
- **Theming:** dark/light mode is a boolean in `AppContext`, toggled from the Settings page, and reflected via a `data-theme` attribute plus CSS variables (see [Styling & Theming](#styling--theming)).

## Environment Configuration

There are no environment variables required yet — the app runs entirely on static data. When backend integration begins, document required variables here (API base URL, auth provider config, etc.) and add a `.env.example`.

## Styling & Theming

- Tailwind CSS 4 via `@tailwindcss/vite`.
- Design tokens and CSS custom properties live in `src/styles/theme.css` (`--app-bg`, `--app-surface`, `--app-text`, `--app-muted`, `--app-border*`, etc.) so components stay theme-agnostic.
- Fonts: Figtree (UI text) and JetBrains Mono (labels/metrics), loaded via `src/styles/fonts.css`.
- Company/design-system rules for future AI-assisted or manual UI work go in `guidelines/Guidelines.md`.

## Roadmap

- [ ] Connect pages to a real API (auth, users, groups, events, plans, content, analytics)
- [ ] Replace mock arrays in `src/pages/*` with data-fetching hooks
- [ ] Wire up form submission/validation (react-hook-form is installed but unused)
- [ ] Add automated tests (unit + e2e)
- [ ] Add environment-based configuration (`.env`, API base URL)
- [ ] Code-split the bundle (current build emits a single >500 kB chunk)

## Contributing

1. Create a branch off `main`.
2. Keep new UI pieces consistent with the existing structure: shared primitives go in `src/components/common`, icons in `src/components/icons`, one file per page/modal.
3. Run `npm run build` before opening a PR to catch type errors.
4. Keep PRs scoped — prefer several small, reviewable changes over one large one.
