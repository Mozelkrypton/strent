export type RateLimitResult = { allowed: boolean; retryAfterMs?: number };

/**
 * Interface so the limiting strategy can be swapped later (e.g. for a
 * Redis-backed limiter once this runs across multiple server instances)
 * without touching any code that calls it.
 */
export interface RateLimiter {
  consume(key: string): RateLimitResult;
}

/**
 * Simple sliding-window limiter kept in process memory. Good enough for a
 * single-instance deployment; if Strent moves to multiple server instances
 * or a serverless/edge deploy, swap this for a shared store (Redis) behind
 * the same RateLimiter interface — nothing else needs to change.
 */
export class InMemorySlidingWindowLimiter implements RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number
  ) {}

  consume(key: string): RateLimitResult {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);

    if (recent.length >= this.max) {
      const retryAfterMs = this.windowMs - (now - recent[0]);
      return { allowed: false, retryAfterMs };
    }

    recent.push(now);
    this.hits.set(key, recent);
    return { allowed: true };
  }
}

// Survive Next.js dev hot-reload the same way lib/prisma.ts does, so limits
// aren't silently reset on every file save.
const globalForLimiter = globalThis as unknown as {
  loginRateLimiter?: InMemorySlidingWindowLimiter;
};

// 10 attempts per 15 minutes per (ip, email) pair.
export const loginRateLimiter =
  globalForLimiter.loginRateLimiter ?? new InMemorySlidingWindowLimiter(10, 15 * 60 * 1000);

if (process.env.NODE_ENV !== "production") {
  globalForLimiter.loginRateLimiter = loginRateLimiter;
}
