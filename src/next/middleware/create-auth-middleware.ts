/**
 * Next.js middleware factory for Firebase session-based auth.
 *
 * This middleware performs a **cookie presence check only** (edge-safe).
 * Full cryptographic verification happens in Node runtime (route handlers, server components).
 *
 * Why presence-only?
 * - Edge middleware can't import firebase-admin (requires Node runtime).
 * - Presence check is fast and prevents most unauthorized access attempts.
 * - Server guards provide the actual security boundary with full JWT verification.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Default session cookie name.
 * Hardcoded here to avoid importing Node.js modules in edge runtime.
 */
const FIREBASE_SESSION_COOKIE_NAME = '__session';

export interface AuthMiddlewareConfig {
  /**
   * Path prefixes that require authentication.
   * Default: ['/dashboard']
   *
   * @example ['/dashboard', '/admin', '/api/protected']
   */
  protectedPrefixes?: string[];

  /**
   * Path to redirect to when session cookie is missing.
   * Default: '/login'
   */
  loginPath?: string;

  /**
   * Optional: Path to redirect to when session cookie is present on public pages.
   * Useful for redirecting away from /login if already authenticated.
   * Default: undefined (no redirect)
   *
   * @example '/dashboard'
   */
  authenticatedRedirectPath?: string;

  /**
   * Optional: Paths that should redirect authenticated users.
   * Only applies when authenticatedRedirectPath is set.
   * Default: ['/login']
   *
   * @example ['/login', '/signup']
   */
  publicOnlyPaths?: string[];

  /**
   * Optional: Custom cookie name if not using default '__session'.
   * Default: '__session'
   */
  cookieName?: string;
}

/**
 * Creates a Next.js middleware function that checks for Firebase session cookie presence.
 *
 * @example
 * ```typescript
 * // middleware.ts
 * import { createAuthMiddleware } from '@volcanica/firebase-auth-nextjs/next/middleware';
 *
 * export default createAuthMiddleware({
 *   protectedPrefixes: ['/dashboard', '/api/protected'],
 *   loginPath: '/login',
 *   authenticatedRedirectPath: '/dashboard',
 *   publicOnlyPaths: ['/login', '/signup'],
 * });
 *
 * export const config = {
 *   matcher: [
 *     // Match all paths except static files and API routes you want public
 *     '/((?!_next/static|_next/image|favicon.ico|api/public).*)',
 *   ],
 * };
 * ```
 */
export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  const {
    protectedPrefixes = ['/dashboard'],
    loginPath = '/login',
    authenticatedRedirectPath,
    publicOnlyPaths = ['/login'],
    cookieName = FIREBASE_SESSION_COOKIE_NAME,
  } = config;

  return function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get(cookieName);
    const hasSession = Boolean(sessionCookie?.value);

    // Check if current path requires authentication
    const isProtectedPath = protectedPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

    // Check if current path is public-only (e.g., login page)
    // Special handling for root path "/" to avoid matching all routes
    const isPublicOnlyPath = publicOnlyPaths.some((path) => {
      if (path === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(path);
    });

    // Case 1: Protected path without session → redirect to login
    if (isProtectedPath && !hasSession) {
      const loginUrl = new URL(loginPath, request.url);
      // Preserve the attempted URL for post-login redirect
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Case 2: Public-only path with session → redirect to authenticated area
    if (
      isPublicOnlyPath &&
      hasSession &&
      authenticatedRedirectPath
    ) {
      const dashboardUrl = new URL(authenticatedRedirectPath, request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Case 3: Allow request to proceed
    return NextResponse.next();
  };
}

/**
 * Helper to create a recommended matcher config for Next.js middleware.
 *
 * @example
 * ```typescript
 * import { createAuthMiddleware, getRecommendedMatcher } from '@volcanica/firebase-auth-nextjs/next/middleware';
 *
 * export default createAuthMiddleware({ ... });
 * export const config = { matcher: getRecommendedMatcher() };
 * ```
 */
export function getRecommendedMatcher(): string[] {
  return [
    /**
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder content (if you serve assets from /public)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ];
}

