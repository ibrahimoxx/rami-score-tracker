# 🃏 Rami Score Tracker

A dark luxury Progressive Web App for tracking scores in the Rami card game. Built with Next.js 15, Supabase authentication, and a PostgreSQL database.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)

---

## ✨ Features

- **Auth** — Email/password, Google OAuth, and magic link sign-in
- **Match setup** — name your match, choose 2 to 6 players with custom names and color avatars
- **Round scoring** — enter points per round, mark the round winner (auto zero score)
- **Penalty system** — instant +11 / +51 penalty buttons, each removable if added by mistake
- **Live scoreboard** — always sorted ascending (lowest score = winning in Rami)
- **Round history** — full accordion history with edit support on the last round
- **Statistics** — rankings overview, score evolution chart, and records
- **End game podium** — animated 1st / 2nd / 3rd podium reveal with final scores
- **Match history** — all your past saved games with detailed read-only view
- **Cloud sync** — all data stored in Supabase, accessible from any device
- **Offline ready** — installable PWA, works without internet (serves cached assets)
- **Milestone alerts** — toast notifications at 100, 200, 500 point thresholds

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 3. Run the SQL schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql)
3. This creates all 4 tables with RLS policies enabled

### 4. Configure Google OAuth (optional)

1. In Supabase dashboard → **Authentication** → **Providers** → **Google**
2. Enable Google and follow the instructions to create OAuth credentials
3. Add `https://your-project.supabase.co/auth/v1/callback` as an authorized redirect URI in Google Cloud Console

### 5. Fill in environment variables

Rename `.env.local` and fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Find these in: Supabase dashboard → **Project Settings** → **API**

### 6. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## 🏗 Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start
```

**Deploy to Vercel:**
1. Push your repo to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in Vercel settings
4. Deploy — zero config needed

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Auth + DB | Supabase (PostgreSQL + RLS) |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| State | Zustand |
| Charts | Recharts |
| Confetti | canvas-confetti |
| Icons | Lucide React |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/login/     ← Auth page (email, Google, magic link)
│   ├── (app)/
│   │   ├── dashboard/    ← Match history for logged-in user
│   │   ├── game/         ← Active game screen
│   │   ├── game/setup/   ← Player setup screen
│   │   └── match/[id]/   ← Saved match detail
│   ├── auth/callback/    ← Supabase OAuth callback
│   └── layout.tsx
├── components/           ← Reusable UI components
├── screens/              ← Full-screen page layouts
├── store/                ← Zustand state (gameStore, historyStore)
├── lib/
│   ├── supabase/         ← Browser + server clients, middleware
│   └── db.ts             ← All Supabase CRUD operations
├── utils/                ← Score calculations, color palette
└── middleware.ts          ← Auth route protection
supabase/
└── schema.sql            ← Tables + RLS policies
```

---

## 🎮 How to Play

1. Sign in or create an account
2. From the dashboard, tap **Nouvelle Partie**
3. Enter a match name and tap **Commencer**
4. Choose the number of players and enter their names
5. After each round, enter each player's score — or mark the round winner (scores 0)
6. Use **+11** / **+51** for penalty points (tap the chip to remove if added by mistake)
7. Tap **Valider la manche** to confirm — lowest total score wins
8. End the game anytime to see the final podium — match is saved automatically

---

## 📄 License

MIT
