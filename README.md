# 🃏 Rami Score Tracker

A dark luxury Progressive Web App for tracking scores in the Rami card game. Built for speed, elegance, and offline use.

![PWA](https://img.shields.io/badge/PWA-ready-blueviolet)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)

---

## ✨ Features

- **Match setup** — name your match, choose 2 to 6 players with custom names and color avatars
- **Round scoring** — enter points per round, mark the round winner (auto zero score)
- **Penalty system** — instant +11 / +51 penalty buttons, each removable if added by mistake
- **Live scoreboard** — always sorted ascending (lowest score = winning in Rami)
- **Round history** — full accordion history with edit support on the last round
- **Statistics** — rankings overview, score evolution chart (Recharts), and records
- **End game podium** — animated 1st / 2nd / 3rd podium reveal with final scores
- **Match history** — all past saved games with detailed read-only view and charts
- **Offline ready** — installable PWA, works without internet
- **Milestone alerts** — toast notifications at 100, 200, 500 point thresholds

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| State | Zustand (persisted to localStorage) |
| Charts | Recharts |
| Confetti | canvas-confetti |
| PWA | vite-plugin-pwa |
| Icons | Lucide React |

---

## 📱 Screenshots

> Welcome screen · Game screen · Podium · Match history

*Mobile-first, portrait optimized. Installable on iOS and Android.*

---

## 🎮 How to Play

1. Enter a match name and tap **Commencer**
2. Choose the number of players and enter their names
3. After each round, enter each player's score — or mark the round winner (scores 0)
4. Use **+11** / **+51** for penalty points (tap the chip to remove if added by mistake)
5. Tap **Valider la manche** to confirm — lowest total score wins
6. End the game anytime to see the final podium and save the match

---

## 📄 License

MIT
