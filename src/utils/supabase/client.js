function getCookieDomain() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('localhost')) return 'localhost';
    const parts = host.split('.');
    if (parts.length >= 2) return '.' + parts.slice(-2).join('.');
    return host;
  }
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';
}

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://creeorxpcmzpcgtzcxaw.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookieOptions: {
        domain: getCookieDomain(),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  );
}
