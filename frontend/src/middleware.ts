import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js dev can mis-handle IP:port access and redirect to a *relative* path like
 * `/103.179.45.76:3000`, which stacks on each request → 404. Send those URLs home.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // e.g. /103.179.45.76:3000 or /103.179.45.76:3000/103.179.45.76:3000/...
  if (/^\/[\d.]+:\d+/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
