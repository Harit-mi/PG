import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // 1. SUPERADMIN APP (admin.domain.com)
  if (hostname.startsWith('admin.')) {
    if (!url.pathname.startsWith('/super-admin')) {
      url.pathname = \`/super-admin\${url.pathname === '/' ? '' : url.pathname}\`;
      return NextResponse.rewrite(url);
    }
  } 
  
  // 2. PG OWNER APP (owner.domain.com or app.domain.com)
  else if (hostname.startsWith('owner.') || hostname.startsWith('app.')) {
    // We rewrite the root to /dashboard so they don't see the marketing page on the app subdomain
    if (url.pathname === '/') {
      url.pathname = '/dashboard';
      return NextResponse.rewrite(url);
    }
  }
  
  // 3. TENANT APP (tenant.domain.com)
  else if (hostname.startsWith('tenant.')) {
    // E.g., tenant.domain.com/my-property-id -> rewrites to /pg/my-property-id/tenant-portal
    if (url.pathname !== '/' && !url.pathname.startsWith('/pg/')) {
      // Extract the first path segment as propertyId
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const propertyId = parts[0];
        // If there are subpaths (e.g. menu), we should preserve them, but the main portal is at tenant-portal
        if (parts[1] === 'menu') {
           url.pathname = \`/pg/\${propertyId}/menu\`;
        } else {
           url.pathname = \`/pg/\${propertyId}/tenant-portal\`;
        }
        return NextResponse.rewrite(url);
      }
    }
  }

  // 4. MAIN MARKETING SITE (domain.com)
  // Let it pass through normally to src/app/page.js
  return NextResponse.next();
}
