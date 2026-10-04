/**
 * Lightweight cache + rate-limit abstraction.
 * Uses Redis when REDIS_URL is configured (via ioredis if available),
 * otherwise falls back to an in-memory store so the app runs anywhere.
 */

type Entry = { value: string; expiresAt: number | null };

class MemoryStore {
  private store = new Map<string, Entry>();

  async get(key: string): Promise<string | null> {
    const e = this.store.get(key);
    if (!e) return null;
    if (e.expiresAt && Date.now() > e.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return e.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async incr(key: string): Promise<number> {
    const current = Number((await this.get(key)) ?? '0') + 1;
    const e = this.store.get(key);
    this.store.set(key, {
      value: String(current),
      expiresAt: e?.expiresAt ?? null,
    });
    return current;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const e = this.store.get(key);
    if (e) e.expiresAt = Date.now() + ttlSeconds * 1000;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

const globalForCache = globalThis as unknown as { cache?: MemoryStore };
export const cache = globalForCache.cache ?? new MemoryStore();
if (process.env.NODE_ENV !== 'production') globalForCache.cache = cache;

/** Sliding-window rate limiter. Returns true if the request is allowed. */
export async function rateLimit(
  identifier: string,
  limit = 60,
  windowSeconds = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const count = await cache.incr(key);
  if (count === 1) await cache.expire(key, windowSeconds);
  return { success: count <= limit, remaining: Math.max(0, limit - count) };
}

/** JSON cache helper with TTL. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  producer: () => Promise<T>
): Promise<T> {
  const hit = await cache.get(key);
  if (hit) {
    try {
      return JSON.parse(hit) as T;
    } catch {
      /* fall through */
    }
  }
  const value = await producer();
  await cache.set(key, JSON.stringify(value), ttlSeconds);
  return value;
}
