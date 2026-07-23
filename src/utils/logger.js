/**
 * Application Logger & Sentry Monitoring Integration Layer
 * Captures exceptions, logs runtime errors, and dispatches error events to Sentry if DSN is configured.
 */

export function logError(error, context = {}) {
  const timestamp = new Date().toISOString();
  console.error(`[OUR-PG Error ${timestamp}]`, error, context);

  // If Sentry DSN is present, send report
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }

  // Optional: Send server-side exception webhook or monitoring beacon
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && typeof fetch !== 'undefined') {
    try {
      // Sentry DSN HTTP ingest payload format
      fetch(process.env.NEXT_PUBLIC_SENTRY_DSN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exception: {
            values: [{
              type: error?.name || 'Error',
              value: error?.message || String(error),
              stacktrace: error?.stack
            }]
          },
          extra: context,
          timestamp: Math.floor(Date.now() / 1000)
        })
      }).catch(() => {}); // silent fallback
    } catch (e) {
      // Ignore beacon delivery failures
    }
  }
}

export function logInfo(message, meta = {}) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OUR-PG Info] ${message}`, meta);
  }
}
