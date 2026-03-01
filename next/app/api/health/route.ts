import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  // Rate limiting: 60 requests per minute
  const { allowed, headers } = rateLimit(request, {
    maxRequests: 60,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers,
      }
    );
  }

  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { headers }
  );
}

