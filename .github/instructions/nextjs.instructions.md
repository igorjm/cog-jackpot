---
applyTo: "app/**/*.tsx,app/**/*.ts"
description: "Next.js App Router conventions — routing, server actions, layouts, and middleware"
---

# Next.js App Router Conventions

## File Structure

- `app/(main)/` — Authenticated routes (dashboard, matches, ranking, bets, rules)
- `app/admin/` — Admin-only routes (users, results)
- `app/actions/` — Server Actions for mutations
- `app/api/` — API routes (minimal, prefer Server Actions)

## Server Actions

- Place in `app/actions/` with descriptive filenames (auth.ts, bets.ts, admin.ts).
- Always validate input with Zod before processing.
- Wrap database calls in try-catch; re-throw Next.js redirects (check `"digest" in error`).
- Return `{ error: string }` for user-facing errors, not throw.

## Layouts

- `app/(main)/layout.tsx` — Responsive: mobile bottom nav + desktop sidebar
- `app/admin/layout.tsx` — Admin header with sub-navigation
- `app/layout.tsx` — Root with font loading, no auth logic here

## Middleware

- Located at `middleware.ts` (root level)
- Handles auth redirects based on user status (PENDING, REJECTED, APPROVED)
- Static assets (images, fonts) MUST be excluded from the matcher regex
- Current exclusion pattern: `/((?!api|_next/static|_next/image|favicon.ico|public|flags|pix-qrcode.png|derlis.png|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)`

## Important

- This project uses Next.js 16 — check `node_modules/next/dist/docs/` for API changes before using unfamiliar APIs.
- Turbopack is the dev bundler (default in Next.js 16).
- `NODE_TLS_REJECT_UNAUTHORIZED=0` is required in `.env` for Neon connections.
