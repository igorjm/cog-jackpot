---
applyTo: "prisma/**,lib/prisma.ts"
description: "Database and Prisma conventions — Neon adapter, schema changes, and querying patterns"
---

# Database Conventions

## Prisma + Neon Setup

This project uses `@prisma/adapter-neon` with WebSocket connections to bypass the Prisma Rust engine's TLS incompatibility with Neon PG17.

- Client singleton: `lib/prisma.ts`
- Schema: `prisma/schema.prisma`

## Schema Changes

NEVER use `npx prisma db push` — it will fail with TLS errors.

Use the custom script instead:
```bash
node prisma/push-schema.js
```

This uses the `pg` package directly to execute raw SQL DDL.

## Seeding

```bash
npx tsx prisma/seed.ts
```

## Querying Patterns

- Always filter rankings with `role: { not: "ADMIN" }` to exclude admin from player rankings.
- Use `status: "APPROVED"` for queries that should only include active players.
- Bet queries should use `points: { not: null }` to get only scored bets.
- Use `include` for relations, not separate queries (leverage Prisma's join optimization).
