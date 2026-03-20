# Workspace

## Overview

Nisuwa Cartel Buyback — an EVE Online buyback price calculator web app for the Nisuwa Cartel alliance. Members paste item lists from the EVE client, get Jita market prices via Fuzzwork API, and see buyback values with category-based rates applied.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Frontend**: React + Vite + Tailwind CSS
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **External APIs**: ESI (EVE Swagger Interface), Fuzzwork Market Data

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── buyback/            # React + Vite frontend (Nisuwa Cartel Buyback)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace config
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## Features

### Appraisal (POST /api/appraise)
- Parses EVE Online item text (tab-separated, "x quantity", trailing number formats)
- Resolves item names → type IDs via ESI `/universe/ids/` endpoint (batch POST, up to 500 per request)
- Fetches Jita sell prices via Fuzzwork Market Data API (`market.fuzzwork.co.uk/aggregates`)
- Returns itemized breakdown with market group names and buyback rates applied
- Results are encoded in the URL using lz-string compression for sharing

### Buyback Rates (GET /api/buyback/rates)
- Fixed rates defined in `artifacts/api-server/src/lib/buyback-rates.ts`
- Categories: Sleeper Components (100% NPC Buy), Minerals (90%), Ore (85%), Ships (65%), Modules (70%), etc.
- Default rate: 90%
- **Matching is order-dependent** — more specific categories (e.g., Sleeper Components) must come before broader ones (e.g., Commodity) in the BUYBACK_RATES array

### Sleeper Components (NPC Buy Pricing)
- Items in the "Sleeper Components" market group use NPC Buy prices instead of Jita sell
- NPC orders are identified by `duration >= 365` in ESI `/markets/{region_id}/orders/` (players max 90 days)
- Queries The Forge region (10000002) for buy orders, filters NPC-only, takes highest price
- Buyback rate: 100% of NPC Buy price
- Frontend tooltip shows "Sleeper Components (NPC Buy) → 100%"

### Caching
- In-memory TTL cache (`artifacts/api-server/src/lib/cache.ts`)
- Type ID lookups: 24h cache
- Jita prices: 1h cache
- NPC Buy prices: 30 day cache (NPC prices rarely change)
- Market group names: 24h cache
- Type info: 24h cache

## Key Backend Files

- `artifacts/api-server/src/routes/appraise.ts` — Appraisal route handler
- `artifacts/api-server/src/routes/buyback.ts` — Buyback rates endpoint
- `artifacts/api-server/src/lib/eve-api.ts` — ESI + Fuzzwork API integration with caching
- `artifacts/api-server/src/lib/eve-parser.ts` — EVE item text parser
- `artifacts/api-server/src/lib/buyback-rates.ts` — Buyback rate configuration
- `artifacts/api-server/src/lib/cache.ts` — Simple TTL cache implementation

## Key Frontend Pages

- `artifacts/buyback/src/pages/Home.tsx` — Item input page
- `artifacts/buyback/src/pages/AppraisalResult.tsx` — Results page with itemized breakdown, summary cards, and rate sidebar

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with EVE Online integration routes.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: health, appraise, buyback
- Depends on: `@workspace/api-zod`

### `artifacts/buyback` (`@workspace/buyback`)

React + Vite frontend for the Nisuwa Cartel Buyback calculator. Dark sci-fi themed UI with Tailwind CSS.

- Home page: textarea input for pasting EVE items
- Result page: itemized table with prices, buyback rates, and summary cards
- URL-encoded data sharing via lz-string compression
- Uses `@workspace/api-client-react` for API hooks

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec with endpoints: healthz, appraise, buyback/rates.
Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas: `AppraiseItemsBody`, `AppraiseItemsResponse`, `GetBuybackRatesResponse`, `HealthCheckResponse`

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks: `useAppraiseItems`, `useGetBuybackRates`, `useHealthCheck`
