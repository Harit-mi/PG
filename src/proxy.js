import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function proxy(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const pathname = url.pathname;

  let isSuperAdmin = false;
  let isDashboard = false;

  // 1. SUPERADMIN APP
  if (hostname.startsWith('admin.')) {
    if (!pathname.startsWith('/super-admin')) {
      url.pathname = `/super-admin${pathname === '/' ? '' : pathname}`;
      isSuperAdmin = true;
    } else {
      isSuperAdmin = true;
    }
  } 
  
  // 2. PG OWNER APP
  else if (hostname.startsWith('owner.') || hostname.startsWith('app.')) {
    if (pathname === '/') {
      url.pathname = '/dashboard';
      isDashboard = true;
    } else if (pathname.startsWith('/dashboard')) {
      isDashboard = true;
    }
  }
  
  // 3. TENANT APP
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
  } else {
    if (pathname.startsWith('/dashboard')) isDashboard = true;
    if (pathname.startsWith('/super-admin')) isSuperAdmin = true;
  }

  const rewrittenPathname = url.pathname;

  if (isDashboard || rewrittenPathname.startsWith('/dashboard')) {
    const cookies = req.cookies.getAll();
    const hasAuthCookie = cookies.some(c => 
      c.name.includes('-auth-token') || 
      c.name.startsWith('sb-') ||
      c.name === 'supabase-auth-token'
    );
    
    if (!hasAuthCookie) {
      const rootDomain = hostname.replace(/^(app|owner|admin|tenant)\./, '');
      const proto = hostname.includes('localhost') ? 'http' : 'https';
      return NextResponse.redirect(`${proto}://${rootDomain}/`);
    }
  }

  if (isSuperAdmin || rewrittenPathname.startsWith('/super-admin')) {
    if (!rewrittenPathname.startsWith('/super-admin/login')) {
      const adminCookie = req.cookies.get('super_admin_token')?.value;
      if (!adminCookie) {
        url.pathname = '/super-admin/login';
      }
    }
  }

  if (url.pathname !== req.nextUrl.pathname) {
     return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
