/**
 * Rate Limiter for Next.js API Routes
 *
 * Uses an in-memory sliding window approach.
 * Each client is identified by IP address.
 *
 * Usage in API route:
 *   import { rateLimit, RateLimitConfig } from '@/lib/rateLimit';
 *
 *   const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
 *
 *   export async function POST(req: NextRequest) {
 *     const limited = await limiter.check(req);
 *     if (limited) return limited; // returns a 429 NextResponse
 *     // ... handle request
 *   }
 */

import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  /** Time window in milliseconds (default: 15 minutes) */
  windowMs?: number;
  /** Maximum number of requests per window (default: 10) */
  max?: number;
  /** Custom message returned on rate limit (default: "Too many requests...") */
  message?: string;
  /** Custom key extractor (default: x-forwarded-for or x-real-ip) */
  keyGenerator?: (req: NextRequest) => string;
}

interface TokenBucket {
  /** Timestamps of requests within the current window */
  timestamps: number[];
}

// Global store — persists across requests in the same server process.
// Automatically cleaned up periodically to prevent memory leaks.
const store = new Map<string, TokenBucket>();

// Cleanup interval: every 5 minutes, remove expired entries
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupTimer(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store.entries()) {
      // Remove timestamps older than the window
      bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);
      // If no timestamps remain, delete the entry
      if (bucket.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Run cleanup every 5 minutes

  // Ensure the timer doesn't prevent the process from exiting
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Extract client IP from a NextRequest.
 * Checks x-forwarded-for, x-real-ip, then falls back to "unknown".
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs; take the first
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

/**
 * Creates a rate limiter instance.
 *
 * @param config Configuration for the rate limiter
 * @returns An object with a `check` method
 */
export function rateLimit(config: RateLimitConfig = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 10,
    message = "Too many requests, please try again later.",
    keyGenerator,
  } = config;

  // Start the periodic cleanup
  ensureCleanupTimer(windowMs);

  return {
    /**
     * Check if the request should be rate-limited.
     *
     * @param req The incoming NextRequest
     * @returns `null` if the request is allowed, or a `NextResponse` (429) if rate-limited
     */
    check(req: NextRequest): NextResponse | null {
      const key = keyGenerator ? keyGenerator(req) : getClientIp(req);
      const now = Date.now();

      // Get or create bucket for this key
      let bucket = store.get(key);
      if (!bucket) {
        bucket = { timestamps: [] };
        store.set(key, bucket);
      }

      // Remove timestamps outside the current window
      bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

      // Check if the limit has been exceeded
      if (bucket.timestamps.length >= max) {
        const oldestTimestamp = bucket.timestamps[0];
        const retryAfterMs = windowMs - (now - oldestTimestamp);
        const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

        return NextResponse.json(
          {
            success: false,
            error: message,
            retryAfter: retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfterSeconds),
              "X-RateLimit-Limit": String(max),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(Math.ceil((oldestTimestamp + windowMs) / 1000)),
            },
          }
        );
      }

      // Record this request
      bucket.timestamps.push(now);

      // Not rate-limited
      return null;
    },

    /**
     * Get current rate limit headers for informational purposes.
     * Can be added to successful responses.
     */
    getHeaders(req: NextRequest): Record<string, string> {
      const key = keyGenerator ? keyGenerator(req) : getClientIp(req);
      const now = Date.now();
      const bucket = store.get(key);

      let remaining = max;
      let resetTime = Math.ceil((now + windowMs) / 1000);

      if (bucket) {
        const validTimestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);
        remaining = Math.max(0, max - validTimestamps.length);
        if (validTimestamps.length > 0) {
          resetTime = Math.ceil((validTimestamps[0] + windowMs) / 1000);
        }
      }

      return {
        "X-RateLimit-Limit": String(max),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(resetTime),
      };
    },
  };
}

// ─── Pre-configured rate limiters for common endpoints ─────────────────────

/**
 * Login endpoint: 5 attempts per 15 minutes per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

/**
 * Registration endpoint: 3 attempts per 60 minutes per IP
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 3,
  message: "Too many registration attempts. Please try again after 1 hour.",
});

/**
 * Contact form: 5 submissions per 15 minutes per IP
 */
export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many contact form submissions. Please try again later.",
});

/**
 * General API rate limiter: 100 requests per 15 minutes per IP
 */
export const generalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests. Please slow down.",
});
