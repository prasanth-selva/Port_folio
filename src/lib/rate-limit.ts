import { createHmac } from "node:crypto";

import { supabaseAdmin } from "@/lib/supabase";

/** In-memory fallback for local development or a temporary database outage. */

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

/**
 * Shared limiter for serverless deployments. The database stores only a
 * short-lived HMAC pseudonym, never the source IP. Migration 0002 installs
 * the atomic RPC; if it is unavailable, this falls back to the local limiter.
 */
export async function distributedRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (
    !secret ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return rateLimit(key, limit, windowMs);
  }

  const separator = key.indexOf(":");
  const namespace = separator < 0 ? "request" : key.slice(0, separator);
  const source = separator < 0 ? key : key.slice(separator + 1);
  const bucketKey = `${namespace}:${createHmac("sha256", secret).update(source).digest("hex")}`;

  try {
    const { data, error } = await supabaseAdmin()
      .rpc("consume_rate_limit", {
        p_bucket_key: bucketKey,
        p_limit: limit,
        p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
      })
      .maybeSingle();
    if (error || !data) return rateLimit(key, limit, windowMs);
    const result = data as {
      allowed: boolean;
      remaining: number;
      retry_after_seconds: number;
    };
    return {
      ok: Boolean(result.allowed),
      remaining: Number(result.remaining) || 0,
      retryAfterSec: Number(result.retry_after_seconds) || 0,
    };
  } catch {
    return rateLimit(key, limit, windowMs);
  }
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
