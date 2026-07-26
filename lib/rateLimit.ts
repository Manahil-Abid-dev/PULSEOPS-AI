/**
 * Minimal sliding-window rate limiter for AI endpoints.
 *
 * WHY: Gemini calls cost money and can be abused (e.g. a scripted loop
 * hammering /api/copilot). The route previously had zero throttling.
 *
 * LIMITATION (be honest about this — do not oversell it):
 * This store is process-local memory. It works correctly on a single
 * long-running Node server. On serverless platforms that spin up many
 * concurrent instances (Vercel, Cloud Run with multiple instances,
 * etc.), each instance has its own counter, so the *effective* limit is
 * (perInstanceLimit x instanceCount), not a hard global cap. For a real
 * production guarantee, replace this with a shared store such as
 * Upstash Redis, Firestore transactions, or a managed rate-limiting
 * service. This implementation is a solid baseline for an MVP demo and
 * for slowing down casual abuse, not a substitute for infra-level
 * protection at scale.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Periodically clear stale buckets so this Map doesn't grow unbounded
// for the lifetime of the server process.
const SWEEP_INTERVAL_MS = 5 * 60_000;
let lastSweep = Date.now();

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > windowMs * 2) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function checkRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: max - 1, retryAfterMs: 0 };
  }

  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: windowMs - (now - existing.windowStart),
    };
  }

  existing.count += 1;
  return { allowed: true, remaining: max - existing.count, retryAfterMs: 0 };
}
