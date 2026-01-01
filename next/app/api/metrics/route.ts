import { NextResponse } from "next/server";
import { rateLimit } from '@/lib/rateLimiter';

export async function POST(request: Request) {
  // Rate limiting: 20 requests per minute
  const { allowed, headers } = rateLimit(request, {
    maxRequests: 20,
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

  // SECURITY: Validate request body
  try {
    const body = await request.json().catch(() => ({}));
    
    // Validate request body structure
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers }
      );
    }
    
    // Validate event field if present
    if ('event' in body) {
      if (typeof body.event !== 'string' || body.event.length > 100) {
        return NextResponse.json(
          { error: 'Invalid event field' },
          { status: 400, headers }
        );
      }
    }
    
    // Validate data field if present
    if ('data' in body) {
      if (typeof body.data !== 'object' || body.data === null) {
        return NextResponse.json(
          { error: 'Invalid data field' },
          { status: 400, headers }
        );
      }
      
      // Limit data size (prevent large payloads)
      const dataStr = JSON.stringify(body.data);
      if (dataStr.length > 10000) { // 10KB max
        return NextResponse.json(
          { error: 'Payload too large' },
          { status: 400, headers }
        );
      }
    }
    
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400, headers }
    );
  }
}
