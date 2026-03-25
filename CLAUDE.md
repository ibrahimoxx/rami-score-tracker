# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build (runs type-check + lint implicitly)
npm run start    # Serve production build
npm run lint     # ESLint check
npx tsc --noEmit # Type-check only (no output files)
```

Always run `npx tsc --noEmit` after code changes to catch type errors before they reach build.

## Environment

Requires `.env.local` at project root (never commit this file):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Supabase (auth + PostgreSQL) · Zustand · Framer Motion · Recharts

### Route Groups

```
src/app/
  (auth)/login/        → Public auth page (login, register, forgot password)
  (app)/dashboard/     → Main home: RAMI logo + new game form (left) + match history (right)
  (app)/game/          → Active game: game view or podium on finish
  (app)/game/setup/    → Player setup + penalty rules config (after naming a match)
  (app)/match/[id]/    → Match detail / stats view
  auth/callback/       → Handles both OAuth (code) and email confirmation (token_hash+type)
  auth/reset-password/ → Password reset after clicking email link
```

**Auth flow:** `src/middleware.ts` → `src/lib/supabase/middleware.ts` refreshes the session on every request and redirects unauthenticated users to `/login`. Routes under `(app)/` are protected; `/login` and `/auth/*` are public.

### Data Layer

- `src/lib/db.ts` — all Supabase queries (CRUD for matches, players, rounds, round_scores). Maps snake_case DB columns → camelCase TypeScript. This is the only file that touches Supabase from the client side.
- `src/lib/supabase/client.ts` — `createBrowserClient()` for `'use client'` components
- `src/lib/supabase/server.ts` — `createServerClient()` for Server Components and Route Handlers
- `src/lib/supabase/middleware.ts` — session refresh middleware

### State (Zustand)

- `src/store/gameStore.ts` — active game state; all actions are async and call `src/lib/db.ts`. Key actions: `startGame`, `addRound`, `endGame`, `loadActiveGame`.
- `src/store/historyStore.ts` — finished matches list; `loadMatches()` fetches from Supabase on demand.
- `src/store/toastStore.ts` — ephemeral toast notifications.

### Component Hierarchy

```
(app)/layout.tsx          → Server component: auth check, renders AppHeader
  dashboard/page.tsx      → Two-column layout (WelcomeForm + HistoryScreen)
  game/page.tsx           → Manages view state: 'welcome' | 'game' | 'podium'
    GameScreen            → ScoreBoard + RoundInputPanel + RoundHistoryDrawer
    PodiumScreen          → End-game results
  game/setup/page.tsx     → PlayerSetupScreen (player names + penalty rules)
  match/[id]/page.tsx     → MatchDetailScreen + StatsModal
```

All components under `(app)/` are `'use client'`. Screens in `src/screens/` are full-page views; components in `src/components/` are reusable UI.

### Database Schema

4 tables: `matches → players`, `matches → rounds → round_scores`. All have Row Level Security — users can only access their own data. Schema lives in `supabase/schema.sql`. For existing DBs needing the `penalty_rules` column: `ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalty_rules JSONB NOT NULL DEFAULT '[]';`

### Key Design Constraints

- **Hooks before early returns** — Next.js ESLint enforces this. Always declare all `useState`/`useMemo`/`useEffect`/`useCallback` before any conditional `return`.
- **`createClient()` inside handlers** — Never call `createClient()` at module level in auth/login; it must be inside async handler functions to avoid build-time prerender errors.
- **Penalty rules** — Configured per-match at setup time, stored as `JSONB` array of integers in `matches.penalty_rules`. The `RoundInputPanel` renders one button per rule dynamically.
- **No visual changes** — All Framer Motion animations, Tailwind classes, and color tokens (`--gold`, `--ivory`, `--bg-primary`, etc.) are intentional and must not be altered.

## Security Rules (apply to every project)

- `.env`, `.env.local`, `.env.*.local` — always in `.gitignore`, never committed
- `.claude/`, `.vscode/` — always in `.gitignore`, no AI tool traces in repo
- All user data behind RLS policies — no table accessible without auth
- Middleware protects all app routes — whitelist public paths explicitly
- No `dangerouslySetInnerHTML`, no direct SQL string interpolation
- Supabase anon key is public by design — RLS is the actual security layer
- Before any push: run `git status` and verify no secrets or tool config files are staged
