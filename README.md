# ⚽ Bolão Copa do Mundo 2026

[![Deploy](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)](https://bolao-cog.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL_17-00E599?logo=postgresql&logoColor=white)](https://neon.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

![Bolão Copa 2026](public/banner-derlis.png)

A fullstack World Cup 2026 betting pool app for friends. Mobile-first, real-time scoring, admin-managed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, RSC, Server Actions, Turbopack) |
| UI | Tailwind CSS 4, Oswald + Inter fonts |
| Auth | NextAuth v5 (Credentials, JWT) |
| Database | PostgreSQL 17 (Neon serverless) |
| ORM | Prisma 6 with `@prisma/adapter-neon` (WebSocket) |
| Validation | Zod 4 |
| Runtime | Node.js 20+ |

## Features

- **User registration** with admin approval (payment-gated)
- **Match betting** — predict scores for all 104 World Cup matches
- **Automated scoring** — exact score (10pts), correct winner + 1 score (7pts), correct winner (5pts), correct draw (5pts), 1 score correct (2pts)
- **Phase multipliers** — knockout rounds multiply points (1.5× to 3×)
- **Live ranking** with tiebreakers and position change tracking
- **Admin panel** — approve users, enter results, triggers recalculation
- **Responsive** — mobile bottom nav + desktop sidebar

## Getting Started

### Prerequisites

- Node.js 20+
- A Neon PostgreSQL database (free tier works)

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&pgbouncer=true"
NODE_TLS_REJECT_UNAUTHORIZED="0"
AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
NEXT_PUBLIC_PIX_KEY="your-pix-key"
NEXT_PUBLIC_ENTRY_FEE="50.00"
```

### Install & Run

```bash
npm install
npm run db:push    # push schema to database
npm run db:seed    # seed matches + admin user
npm run dev        # start dev server (http://localhost:3000)
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:seed` | Seed 104 matches + admin user |
| `npm run db:reset` | Reset DB + reseed |

## Project Structure

```
app/
├── (main)/          # Authenticated app (dashboard, matches, ranking, bets, rules)
├── admin/           # Admin panel (users, results)
├── login/           # Login page (with background image)
├── register/        # Registration
├── pending/         # Payment pending screen
├── rejected/        # Rejected screen
├── actions/         # Server actions (auth, bets, admin)
└── api/             # API routes

components/
├── ui/              # Reusable primitives (Button, Input, Badge)
├── match-card.tsx   # Match display with score + bet info
├── bet-form.tsx     # Score input for betting
├── phase-tabs.tsx   # Phase/group navigation
├── ranking-*.tsx    # Podium + table
└── countdown-timer.tsx

lib/
├── auth.ts          # NextAuth config
├── prisma.ts        # Prisma client (Neon adapter)
├── ranking.ts       # Ranking calculation + tiebreakers
├── constants.ts     # Points, multipliers, prize distribution
└── deadline.ts      # Bet deadline logic (1h before match)

prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Seed data (matches, admin)
```

## Scoring Rules

| Result | Points |
|--------|--------|
| Exact score | 10 |
| Correct winner + 1 correct score | 7 |
| Correct winner only | 5 |
| Correct draw (different score) | 5 |
| 1 score correct (wrong winner) | 2 |
| Wrong / didn't bet | 0 |

Points are multiplied by phase: Group (1×), R32 (1.25×), Round of 16 (1.5×), Quarters (2×), Semis (2.5×), Final (3×).

## License

This project is licensed under the [MIT License](./LICENSE).
