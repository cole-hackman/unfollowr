/**
 * Rate limiting utilities for Next.js API routes
 * Uses in-memory storage (consider Redis for production)
 */

interface RateLimitInfo {
  limit: number;
  window: number;
  remaining: number;
  retryAfter?: number;
}

interface RequestRecord {
  timestamp: number;
  count: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord[]>;
  private cleanupInterval: number;
  private lastCleanup: number;

  constructor() {
    this.requests = new Map();
    this.cleanupInterval = 300000; // 5 minutes
    this.lastCleanup = Date.now();
  }

  private getIdentifier(request: Request): string {
    // Get IP address from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
    return ip;
  }

  private cleanupOldEntries(windowMs: number): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupInterval) {
      return;
    }

    const cutoffTime = now - windowMs;
    for (const [identifier, records] of this.requests.entries()) {
      const filtered = records.filter((r) => r.timestamp > cutoffTime);
      if (filtered.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, filtered);
      }
    }

    this.lastCleanup = now;
  }

  isAllowed(
    request: Request,
    maxRequests: number,
    windowSeconds: number
  ): { allowed: boolean; info: RateLimitInfo } {
    const identifier = this.getIdentifier(request);
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    // Cleanup old entries periodically
    this.cleanupOldEntries(windowMs);

    // Get requests in the current window
    const cutoffTime = now - windowMs;
    const records = this.requests.get(identifier) || [];
    const recentRecords = records.filter((r) => r.timestamp > cutoffTime);

    // Count total requests in window
    const totalRequests = recentRecords.reduce((sum, r) => sum + r.count, 0);

    if (totalRequests >= maxRequests) {
      // Calculate retry after
      const oldestRecord = recentRecords.length > 0
        ? Math.min(...recentRecords.map((r) => r.timestamp))
        : now;
      const retryAfter = Math.ceil((windowMs - (now - oldestRecord)) / 1000) + 1;

      return {
        allowed: false,
        info: {
          limit: maxRequests,
          window: windowSeconds,
          remaining: 0,
          retryAfter,
        },
      };
    }

    // Record this request
    const currentRecords = this.requests.get(identifier) || [];
    currentRecords.push({ timestamp: now, count: 1 });
    this.requests.set(identifier, currentRecords);

    return {
      allowed: true,
      info: {
        limit: maxRequests,
        window: windowSeconds,
        remaining: maxRequests - totalRequests - 1,
      },
    };
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

export interface RateLimitOptions {
  maxRequests?: number;
  windowSeconds?: number;
}

export function rateLimit(
  request: Request,
  options: RateLimitOptions = {}
): { allowed: boolean; info: RateLimitInfo; headers: HeadersInit } {
  const maxRequests = options.maxRequests || 10;
  const windowSeconds = options.windowSeconds || 60;

  const { allowed, info } = rateLimiter.isAllowed(
    request,
    maxRequests,
    windowSeconds
  );

  const headers: HeadersInit = {
    'X-RateLimit-Limit': String(info.limit),
    'X-RateLimit-Remaining': String(info.remaining),
  };

  if (info.retryAfter) {
    headers['Retry-After'] = String(info.retryAfter);
    headers['X-RateLimit-Reset'] = String(
      Date.now() + info.retryAfter * 1000
    );
  }

  return { allowed, info, headers };
}

