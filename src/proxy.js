import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. Route guard for Owner Dashboard
  if (pathname.startsWith('/dashboard')) {
    const cookies = request.cookies.getAll();
    const hasAuthCookie = cookies.some(c => 
      c.name.includes('-auth-token') || 
      c.name.startsWith('sb-') ||
      c.name === 'supabase-auth-token'
    );
    
    if (!hasAuthCookie) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Route guard for Super Admin
  if (pathname.startsWith('/super-admin') && !pathname.startsWith('/super-admin/login')) {
    const adminCookie = request.cookies.get('super_admin_token')?.value;
    if (!adminCookie) {
      const adminLoginUrl = new URL('/super-admin/login', request.url);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/super-admin/:path*'],
};
