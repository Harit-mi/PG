import { NextResponse } from 'next/server';

// Memory store for tracking request timestamps per client IP
const ipStore = new Map();

// Cleanup old entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipStore.entries()) {
      if (now > data.resetTime) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * In-Memory Sliding Window Rate Limiter for API Routes & Actions
 * @param {Request} req - Next.js Request object
 * @param {number} maxRequests - Max allowed requests per window (default: 15)
 * @param {number} windowMs - Time window in milliseconds (default: 60,000ms = 1 min)
 * @returns { { success: boolean, response?: NextResponse } }
 */
export function checkRateLimit(req, maxRequests = 15, windowMs = 60000) {
  // Extract client IP address from headers
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded 
    ? forwarded.split(',')[0].trim() 
    : req.headers.get('x-real-ip') || '127.0.0.1';

  const now = Date.now();
  const record = ipStore.get(ip) || { count: 0, resetTime: now + windowMs };

  // If window expired, reset window timer and counter
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  ipStore.set(ip, record);

  // Check if limit exceeded
  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return {
      success: false,
      response: NextResponse.json(
        {
          error: "Too Many Requests",
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000))
          }
        }
      )
    };
  }

  return { success: true };
}
