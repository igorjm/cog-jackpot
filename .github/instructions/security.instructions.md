---
applyTo: "middleware.ts,lib/auth.ts,lib/auth.config.ts,lib/rate-limit.ts,lib/validations.ts,app/actions/**,app/api/**,vercel.json,.github/workflows/**,.env.example"
description: "Security, auth, and infrastructure conventions — loaded when editing auth, API routes, cron jobs, or CI workflows"
---

# Security Instructions

These rules apply when editing authentication, authorization, API routes, cron jobs, or deployment config.

## Non-Negotiables

1. **Server-side authz** — Every mutation in `app/actions/` and every handler in `app/api/` must verify the session and enforce role/status before side effects.
2. **Validate all input** — Use Zod schemas from `lib/validations.ts` or co-located `z.object()`; never trust `FormData`, query params, or JSON body directly.
3. **Protect cron routes** — `/api/cron/*` must require `Authorization: Bearer ${CRON_SECRET}` and return 401 when missing or wrong.
4. **No secrets in client code** — Only `NEXT_PUBLIC_*` vars may appear in client components; API keys and `CRON_SECRET` stay server-only.
5. **No secrets in repo** — Never commit real credentials; update `.env.example` with placeholder names only.

## Patterns

### Admin guard (Server Action)

```typescript
const session = await auth();
if (!session?.user || session.user.role !== "ADMIN") {
  return { error: "Acesso negado" };
}
```

### Cron guard (Route Handler)

```typescript
const authHeader = request.headers.get("authorization");
if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### User-scoped query

```typescript
// ✅ Filter by session user id
where: { id: session.user.id, ... }

// ❌ Trust client-supplied userId without ownership check
where: { id: formData.get("userId") }
```

## References

- OWASP ASVS for control selection
- NextAuth deployment guide for `AUTH_SECRET`, `AUTH_URL`, cookie settings
- Vercel env docs for production vs preview secrets
