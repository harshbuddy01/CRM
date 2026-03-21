import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isAuth = !!token;
  const path = request.nextUrl.pathname;

  const publicPaths = ['/login', '/forgot-password', '/reset-password'];
  const isPublicPage = publicPaths.some(p => path.startsWith(p));

  let response = NextResponse.next();

  if (isAuth && isPublicPage) {
    response = NextResponse.redirect(new URL('/', request.url));
  } else if (!isAuth && !isPublicPage) {
    response = NextResponse.redirect(new URL('/login', request.url));
  }

  // Add Vary header to every response to prevent CDN cache poisoning
  // This tells the CDN to distinguish between RSC (data) and HTML (standard) requests
  response.headers.set('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept');
  
  // Disable aggressive caching for RSC requests to the root page
  if (request.headers.get('RSC')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
