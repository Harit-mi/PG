import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const pathname = url.pathname;

  if (hostname.startsWith('admin.')) {
    if (!pathname.startsWith('/super-admin')) {
      url.pathname = `/super-admin${pathname === '/' ? '' : pathname}`;
    }
  } 
  else if (hostname.startsWith('owner.') || hostname.startsWith('app.')) {
    // If they go to app.domain.com/, send them to /auth or /dashboard.
    // Wait, the app needs an auth page. If they go to / on app.domain.com, 
    // we should render the login page if not authenticated, or dashboard if they are.
    // For now, rewrite to /app route so it handles its own UI.
    if (pathname === '/') {
      url.pathname = '/app';
    }
  }
  else if (hostname.startsWith('tenant.')) {
    if (pathname !== '/' && !pathname.startsWith('/pg/')) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const propertyId = parts[0];
        if (parts[1] === 'menu') {
           url.pathname = `/pg/${propertyId}/menu`;
        } else {
           url.pathname = `/pg/${propertyId}/tenant-portal`;
        }
      }
    }
  } 

  if (url.pathname !== req.nextUrl.pathname) {
     return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
