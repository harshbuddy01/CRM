import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isAuth = !!token;
  const path = request.nextUrl.pathname;

  const isSharePage = path.startsWith('/share');
  const publicAuthPaths = ['/login', '/forgot-password', '/reset-password', '/share', '/rate-us'];
  const isPublicPath = publicAuthPaths.some(p => path.startsWith(p));

  if (isSharePage) {
    const response = NextResponse.next();
    response.headers.set('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept');
    return response;
  }

  if (isAuth && isPublicPath && path !== '/') {
    if (!isSharePage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (!isAuth && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.next();

  // Add Vary header to every response to prevent CDN cache poisoning
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
