import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isAuth = !!token;
  const path = request.nextUrl.pathname;
  const hostname = request.headers.get('host') || '';

  // 1. SUBDOMAIN ROUTING (Monorepo Magic)
  // If the user visits a specific subdomain, we rewrite the URL behind the scenes
  // so Next.js serves the correct folder, without changing the URL in the browser.
  
  // Extract subdomain logic (handles local testing and production)
  const isGuestSubdomain = hostname.includes('guest.');
  const isDriverSubdomain = hostname.includes('driver.');
  const isPartnerSubdomain = hostname.includes('partner.') || hostname.includes('hotel.');

  let rewrittenPath = path;

  if (isGuestSubdomain && !path.startsWith('/guest')) {
    rewrittenPath = `/guest${path}`;
  } else if (isDriverSubdomain && !path.startsWith('/driver')) {
    rewrittenPath = `/driver${path}`;
  } else if (isPartnerSubdomain && !path.startsWith('/hotel')) {
    rewrittenPath = `/hotel${path}`;
  }

  // 2. AUTHENTICATION & SECURITY
  const isSharePage = rewrittenPath.startsWith('/share');

  // Portal paths — these are standalone apps with their own auth (localStorage/sessionStorage).
  // They must NEVER be affected by CRM cookie-based auth checks.
  const portalPaths = ['/guest', '/driver', '/hotel', '/crm', '/admin'];
  const isPortalPath = portalPaths.some(p => rewrittenPath.startsWith(p));

  // CRM-only public paths — pages that don't require CRM login
  const crmPublicPaths = ['/login', '/forgot-password', '/reset-password', '/share', '/rate-us'];
  const isCrmPublicPath = crmPublicPaths.some(p => rewrittenPath.startsWith(p));

  // Combined: a path is "public" if it's a portal path OR a CRM public path
  const isPublicPath = isPortalPath || isCrmPublicPath;

  if (isSharePage) {
    const response = NextResponse.next();
    response.headers.set('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept');
    return response;
  }

  // If CRM-authenticated user visits a CRM public page (like /login), redirect to dashboard.
  // But NEVER redirect portal paths — they have their own auth.
  if (isAuth && isCrmPublicPath && rewrittenPath !== '/') {
    if (!isSharePage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If NOT authenticated and NOT on a public path, redirect to CRM login.
  // Portal paths are always allowed through.
  if (!isAuth && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. APPLY REWRITE OR CONTINUE
  let response;
  if (rewrittenPath !== path) {
    // Transparently serve the folder matching the subdomain
    response = NextResponse.rewrite(new URL(rewrittenPath, request.url));
  } else {
    response = NextResponse.next();
  }

  // Add Vary header to every response to prevent CDN cache poisoning
  response.headers.set('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept');
  
  // Disable aggressive caching for RSC requests to the root page
  if (request.headers.get('RSC')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\..*).*)'], // Ignore static files and API routes
};
