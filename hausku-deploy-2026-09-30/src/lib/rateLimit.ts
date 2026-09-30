import { NextRequest, NextResponse } from "next/server";

/**
 * Minimal in-memory sliding-window rate limiter (per IP + route).
 *
 * Good enough to blunt brute-force login attempts and contact-form spam.
 * NOTE: the counter lives in process memory — on serverless/multi-instance
 * deploys this is per-instance, not global. For stronger guarantees use a
 * shared store (Redis/Upstash) or a platform-level WAF rule.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically clear expired buckets so the map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref?.();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Returns an error response when the caller exceeded the limit for this
 * route+IP, or null when the request may proceed.
 */
export function rateLimit(
  request: NextRequest,
  options: { limit: number; windowMs: number }
): NextResponse | null {
  const key = `${request.nextUrl.pathname}:${clientIp(request)}`;
  const now = Date.now();

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > options.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      {
        error: "Zu viele Anfragen — bitte später erneut versuchen.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  return null;
}
