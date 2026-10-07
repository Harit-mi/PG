const fs = require('fs');

function injectCookieDomain(content, isServer) {
  // Find where createBrowserClient or createServerClient is called
  // We need to inject cookieOptions for SSR clients
  const getDomainLogic = `
function getCookieDomain() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('localhost')) return 'localhost';
    // Remove subdomains
    const parts = host.split('.');
    if (parts.length >= 2) return '.' + parts.slice(-2).join('.');
    return host;
  }
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';
}`;

  if (!isServer) {
    let newContent = getDomainLogic + '\n' + content;
    newContent = newContent.replace(
      /createBrowserClient\(([\s\S]*?)process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY \|\| 'placeholder-anon-key'/,
      `createBrowserClient($1process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key', {
      cookieOptions: {
        domain: getCookieDomain(),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }`
    );
    return newContent;
  } else {
    // For server.js, we don't have window
    let newContent = content.replace(
      /createClient\(\) \{/,
      `createClient() {
  const headersList = require('next/headers').headers;
  let domain = 'localhost';
  try {
    const host = headersList().get('host') || '';
    if (!host.includes('localhost')) {
      const hostWithoutPort = host.split(':')[0];
      const parts = hostWithoutPort.split('.');
      if (parts.length >= 2) {
        domain = '.' + parts.slice(-2).join('.');
      }
    }
  } catch (e) {}`
    );
    
    newContent = newContent.replace(
      /cookieStore\.set\(name, value, options\)/,
      `cookieStore.set(name, value, { ...options, domain })`
    );
    return newContent;
  }
}

let clientStr = fs.readFileSync('src/utils/supabase/client.js', 'utf8');
fs.writeFileSync('src/utils/supabase/client.js', injectCookieDomain(clientStr, false));

let serverStr = fs.readFileSync('src/utils/supabase/server.js', 'utf8');
fs.writeFileSync('src/utils/supabase/server.js', injectCookieDomain(serverStr, true));

