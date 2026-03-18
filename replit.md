# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── peacock-app/        # Peacock Drivers web app (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## Peacock Drivers Web App

Sri Lanka travel booking web app with mock data (high-fidelity prototype). Located at `artifacts/peacock-app/`.

### Design System
- **Display font**: Instrument Serif (Google Fonts) — all headings, tour names
- **Body font**: DM Sans (Google Fonts) — body text, buttons, forms
- **Primary colors**: Forest Green (#1B3C34), Amber (#D4842A)
- **Surfaces**: White, Cream (#F8F5F0), Sage (#E4EAE4)
- **Key pattern**: Section headings use one italic word for editorial warmth
- **All buttons**: Pill-shaped (border-radius: 999px)

### Pages/Routes
- `/` — Home (hero, product cards, featured tours, how it works)
- `/tours` — Tour listing grid with category filters
- `/tours/:slug` — Tour detail with itinerary & booking widget
- `/tours/custom` — Create-your-own 5-step wizard
- `/checkout` — 3-step checkout (contact → review → payment)
- `/account` — Tourist portal (bookings, invoices, profile)
- `/driver` — Driver dashboard (mobile-first design)
- `/admin` — Admin panel (KPI dashboard, tours, bookings, drivers, fleet, CYO pipeline)

### Key Dependencies
- wouter (routing), framer-motion (animations), recharts (admin charts)
- @dnd-kit (drag and drop), react-hook-form + zod (form validation)
- date-fns (date formatting), lucide-react (icons)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/peacock-app` (`@workspace/peacock-app`)

React + Vite web app for Peacock Drivers. Frontend-only prototype with mock data.
- Entry: `src/main.tsx` → `src/App.tsx`
- Mock data: `src/lib/mock-data.ts`
- Design tokens: `src/index.css` (CSS custom properties)

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server.
- Entry: `src/index.ts`
- Routes: `src/routes/`

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config.
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks from OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package.
