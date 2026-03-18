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
- `/` — Home (hero, 3 product cards, featured tours scroll, how-it-works, vehicle fleet, trust logos, CTA)
- `/tours` — Tour listing grid with category filters
- `/tours/:slug` — Tour detail with itinerary & booking widget
- `/tours/custom` — Create-your-own 5-step wizard
- `/transfers` — Transfer booking (airport routes with per-vehicle pricing, custom route builder)
- `/checkout` — 3-step checkout (contact → review → payment mock)
- `/checkout/confirmation` — Booking confirmation with reference number + next steps
- `/login` — Login form with Google SSO mock
- `/register` — Registration form with Google SSO mock
- `/account` — Tourist portal overview (quick stats, action cards, recent booking, pending CYO quote)
- `/account/bookings` — My Trips with Upcoming/Past tabs, BookingCards, CYO quote banner
- `/account/bookings/:id` — Trip detail (status timeline, trip info, driver card, trip details form, price summary, reschedule/cancel modals, CYO quote view)
- `/account/invoices` — Invoice table with download PDF buttons
- `/account/profile` — Profile settings (personal info, password, connected accounts, danger zone)
- `/driver` — Driver dashboard (mobile-first: today's trip card, weekly stats, quick actions, recent activity)
- `/driver/trips` — Trip list with Upcoming/Past tabs, trip cards with status/pickup/tourist info
- `/driver/trips/:id` — Trip detail (status banner, tourist contact buttons, trip info grid, special requests, admin notes, itinerary accordion, earnings, status action buttons)
- `/driver/earnings` — Earnings summary cards (this month/last/all time), period filter, trip-by-trip breakdown, pending payout, export button
- `/driver/profile` — Profile editor (photo, bio, languages, experience), availability toggle, vehicle cards with add/edit forms
- `/admin` — Admin dashboard (KPI cards, revenue chart, CYO alert, recent bookings table)
- `/admin/tours` — Tours management (DataTable with search/filters, status toggles)
- `/admin/tours/new` — Create new tour (full builder: basic info, duration, classification, included/not-included, itinerary builder, pricing with vehicle rates/add-ons/seasonal, settings, images)
- `/admin/tours/:slug/edit` — Edit existing tour (pre-populated form with loading gate)
- `/admin/drivers` — Drivers management (DataTable with photos, languages, vehicles, trips, status toggles)
- `/admin/drivers/new` — Add new driver (account, personal info, vehicles, payout rates, status)
- `/admin/drivers/:id/edit` — Edit driver
- `/admin/bookings` — Bookings list (DataTable with type/status filters, export CSV)
- `/admin/bookings/:id` — Booking detail (customer card, trip details, management with status/driver assignment, payment info, cancellation danger zone with refund modal)
- `/admin/requests` — CYO pipeline (kanban view with 7 status columns + list view toggle)
- `/admin/requests/:id` — CYO request detail (customer request read-only, quote builder with line items/extras/total, Stripe payment link generation, activity log)
- `/admin/fleet` — Fleet & availability (5 vehicle inventory cards with editable counts, availability calendar grid with color-coded cells and click popovers)
- `/admin/settings` — Settings (5 tabs: Payments/Stripe keys, Currency display options, Policies/terms, Driver payouts, Notifications with email management and toggles)

### Shared Components (src/components/shared/)
- SectionHeading — Overline + display heading with italic `*word*`
- TourCard — Image card with gradient, duration badge, region chips, price
- VehicleSelector — Horizontal radio cards with vehicle images
- CurrencySelector — Dropdown with flag + code, stores in CurrencyContext
- PriceSummary — Line items, add-ons, surcharge, total with converted currency
- BookingCard — Type icon, title, dates, StatusBadge, vehicle, price
- StatusBadge — Colored pill per status (confirmed/pending/cancelled/etc)
- Stepper — Numbered circles with connecting lines
- MapPlaceholder — Sage-bg waypoint list with dot markers
- KPICard — Icon, label, value, trend arrow
- DataTable — Search, filters, sortable headers, pagination
- Modal — Overlay + card with title, body, cancel/confirm

### Contexts
- CurrencyContext — React context for multi-currency support (6 currencies, GBP base)

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

React + Vite web app for Peacock Drivers. Frontend-only prototype with structured JSON data.
- Entry: `src/main.tsx` → `src/App.tsx`
- Data layer: `src/lib/mock-data.ts` imports from JSON files in `src/data/`
- JSON data files:
  - `src/data/tours.json` — 4 tours with full day-by-day itineraries
  - `src/data/vehicles.json` — 5 vehicle types with real images at `/vehicles/`
  - `src/data/transfers.json` — 6 airport routes + 5 popular routes with per-vehicle pricing
  - `src/data/currencies.json` — 6 currencies (GBP base) with exchange rates
  - `src/data/bookings.json` — 5 sample bookings + 3 CYO requests
- Vehicle images: `public/vehicles/` (car.jpg, minivan.jpg, large-minivan.jpg, small-bus.jpg, medium-bus.jpg)
- Design tokens: `src/index.css` (CSS custom properties)
- Vehicle IDs: car, minivan, large-van, small-bus, medium-bus
- Tour slugs: classic-sri-lanka, wild-sri-lanka, beaches-and-culture, hill-country-explorer

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
