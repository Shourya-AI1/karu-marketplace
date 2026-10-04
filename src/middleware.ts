import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Lightweight edge middleware that gates protected route groups on the
 * presence of an Auth.js session cookie. Fine-grained role checks (seller,
 * staff, admin) are enforced server-side in the route-group layouts, which
 * have full database access. This keeps the edge layer fast and avoids
 * importing the Node-only auth stack into the middleware runtime.
 */

const PROTECTED_PREFIXES = ['/account', '/seller', '/admin', '/checkout', '/wishlist'];

// Auth.js v5 cookie names (secure prefix used in production over HTTPS).
const SESSION_COOKIES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (!isProtected) return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name));
  if (hasSession) return NextResponse.next();

  const signInUrl = new URL('/sign-in', req.url);
  signInUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ['/account/:path*', '/seller/:path*', '/admin/:path*', '/checkout', '/wishlist'],
};
