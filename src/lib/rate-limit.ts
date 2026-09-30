/**
 * Minimal in-memory sliding-window rate limiter.
 * Good enough for a single-instance deployment; on serverless each warm
 * instance keeps its own map, which still blunts credential stuffing.
 */

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    buckets.set(key, bucket);
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((windowMs - (now - oldest)) / 1000),
    };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  if (buckets.size > 5000) {
    // Opportunistic cleanup of stale buckets.
    for (const [k, v] of buckets) {
      if (v.hits.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return { ok: true, remaining: limit - bucket.hits.length, retryAfterSec: 0 };
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
