/**
 * Simple in-memory rate limiter for auth endpoints.
 * Limits attempts per key (IP or email) within a time window.
 * Resets automatically after the window expires.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Check if a key has exceeded the rate limit.
 * @param key - Identifier (e.g., IP address or email)
 * @param maxAttempts - Maximum allowed attempts in the window (default: 5)
 * @param windowMs - Time window in ms (default: 15 minutes)
 * @returns true if the request should be blocked
 */
export function isRateLimited(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;

  if (entry.count > maxAttempts) {
    return true;
  }

  return false;
}
