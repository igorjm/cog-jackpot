# Bolão Copa do Mundo 2026 — Copilot Instructions

## Project Overview

This is a fullstack World Cup 2026 betting pool app ("Bolão") built for a group of friends. Mobile-first but responsive to desktop with a sidebar layout.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components, Server Actions, Turbopack)
- **Styling**: Tailwind CSS 4 (CSS-first config via `@theme inline` in globals.css, `@tailwindcss/postcss` plugin — NO tailwind.config.ts)
- **Auth**: NextAuth v5 beta (Credentials provider, JWT strategy)
- **Database**: PostgreSQL 17 on Neon (serverless, WebSocket pooling)
- **ORM**: Prisma 6 with `@prisma/adapter-neon` (bypasses Rust engine for Neon TLS compatibility)
- **Validation**: Zod 4
- **Fonts**: Inter (body), Oswald (headings), JetBrains Mono (scores/stats)

## Architecture Conventions

- Server Components by default; `"use client"` only when needed (forms, interactivity)
- Server Actions in `app/actions/` for mutations (auth, bets, admin)
- Prisma client singleton in `lib/prisma.ts` using Neon adapter with WebSocket
- Middleware in `middleware.ts` handles auth redirects (login/pending/rejected/admin flows)
- Static files in `/public/` must be excluded from middleware matcher (regex in config)

## Color Palette (World Cup 2026 / Panini Album inspired)

| Token | Hex | Usage |
|-------|-----|-------|
| bg-primary | `#0A1A3A` | Page background (deep navy) |
| bg-elevated | `#122448` | Cards, modals |
| bg-secondary | `#1A3058` | Secondary surfaces |
| separator | `#1E3A6E` | Borders, dividers |
| text-secondary | `#94B8D8` | Muted text |
| text-tertiary | `#5A7A9A` | Very muted text |
| yellow/gold | `#FFD60A` | Branding, highlights, titles |
| green | `#22C55E` | Success, points, CTA buttons |
| red | `#EF4444` | Errors, admin badge |
| blue | `#38BDF8` | Links, info |
| orange | `#F97316` | Warnings, bronze |
| purple | `#A855F7` | Special accents |
| teal | `#2DD4BF` | Info badges |

## Coding Style

- TypeScript strict mode
- Use `cn()` from `lib/utils` for conditional classNames (clsx + twMerge)
- Components in `components/` (ui/ for primitives, root for domain)
- No barrel exports; direct imports
- Prefer `font-[family-name:var(--font-oswald)]` for heading font
- Use `font-mono` for scores and numeric displays
- All text in Portuguese (pt-BR)

## Database Notes

- Prisma schema in `prisma/schema.prisma`
- Do NOT use `prisma db push` directly (Rust engine TLS issue with Neon PG17)
- Use the custom push script: `node prisma/push-schema.js`
- Seed with: `npx tsx prisma/seed.ts`
- Admin user is excluded from rankings (filter: `role: { not: "ADMIN" }`)

## Layout Structure

- Mobile: top header + bottom tab navigation
- Desktop (md+): fixed left sidebar (w-56) + main content with `md:ml-56`
- Login/Register: fullscreen background image (`/derlis.png`) with dark overlay

## Key Business Rules

- Bet deadline: 1 hour before match start
- Scoring: Exact=10, Winner+1Score=7, Winner=5, Draw=5, 1Score=2, None=0
- Phase multipliers: Group=1×, R16=1.5×, QF=2×, SF=2.5×, 3rd=2.5×, Final=3×
- Admin can bet but is NOT included in rankings
- Users must be APPROVED (payment confirmed) to access the app
