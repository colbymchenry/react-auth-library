import { NextRequest, NextResponse } from 'next/server';

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

interface AuthMiddlewareConfig {
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
declare function createAuthMiddleware(config?: AuthMiddlewareConfig): (request: NextRequest) => NextResponse<unknown>;
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
declare function getRecommendedMatcher(): string[];

export { type AuthMiddlewareConfig, createAuthMiddleware, getRecommendedMatcher };
