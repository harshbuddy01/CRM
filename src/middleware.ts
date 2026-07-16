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
  const publicAuthPaths = ['/login', '/forgot-password', '/reset-password', '/share', '/rate-us', '/guest', '/driver', '/crm', '/hotel'];
  const isPublicPath = publicAuthPaths.some(p => rewrittenPath.startsWith(p));

  if (isSharePage) {
    const response = NextResponse.next();
    response.headers.set('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept');
    return response;
  }

  if (isAuth && isPublicPath && rewrittenPath !== '/') {
    if (!isSharePage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

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
