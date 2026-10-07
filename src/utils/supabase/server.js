import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const headersList = require('next/headers').headers;
  let domain = 'localhost';
  try {
    const host = (await headersList()).get('host') || '';
    if (!host.includes('localhost')) {
      const hostWithoutPort = host.split(':')[0];
      const parts = hostWithoutPort.split('.');
      if (parts.length >= 2) {
        domain = '.' + parts.slice(-2).join('.');
      }
    }
  } catch (e) {}
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://creeorxpcmzpcgtzcxaw.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, domain })
            );
          } catch {
            // Called from Server Component; ignore error
          }
        },
      },
    }
  );
}
