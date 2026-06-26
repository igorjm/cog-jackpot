/**
 * Rate limiter for auth endpoints.
 * Uses Upstash Redis REST when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set;
 * otherwise falls back to in-memory (per-instance).
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

function inMemoryRateLimited(
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > maxAttempts;
}

async function upstashRateLimited(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<boolean | null> {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) return null;

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));

  try {
    const res = await fetch(`${baseUrl}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSec, "NX"],
      ]),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { result?: number }[];
    const count = data[0]?.result ?? 1;
    return count > maxAttempts;
  } catch {
    return null;
  }
}

/** @returns true if the request should be blocked */
export async function checkRateLimited(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): Promise<boolean> {
  const upstash = await upstashRateLimited(key, maxAttempts, windowMs);
  if (upstash !== null) return upstash;
  return inMemoryRateLimited(key, maxAttempts, windowMs);
}

/** Sync in-memory check (legacy callers). */
export function isRateLimited(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  return inMemoryRateLimited(key, maxAttempts, windowMs);
}
