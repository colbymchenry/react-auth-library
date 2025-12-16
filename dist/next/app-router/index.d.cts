import { V as VerifiedFirebaseUser } from '../../firebase-session-DPoGAtAU.cjs';
import { NextResponse } from 'next/server';
import 'firebase-admin/auth';
import 'next/dist/server/web/spec-extension/adapters/request-cookies';

declare function getAuthenticatedUser(): Promise<VerifiedFirebaseUser | null>;
/**
 * Admin detection via Firebase custom claims.
 *
 * Expected options:
 * - `admin: true`
 * - `role: 'admin'`
 *
 * Keep this logic centralized so you can evolve your authorization model without touching routes.
 */
declare function isAdminUser(user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>): boolean;
declare function requireAuthenticatedUserOrRedirect(loginPath?: string): Promise<VerifiedFirebaseUser>;
declare function requireAdminUserOrNotFound(loginPath?: string): Promise<VerifiedFirebaseUser>;
declare function redirectAuthenticatedUserToDashboard(dashboardPath?: string): Promise<void>;

declare function requireAuthenticatedUserOr401(): Promise<{
    readonly user: null;
    readonly response: NextResponse<{
        error: string;
    }>;
} | {
    readonly user: VerifiedFirebaseUser;
    readonly response: null;
}>;

/**
 * Route handler factories for Firebase Auth API endpoints.
 *
 * These factories create Next.js route handlers for session management.
 * Consumers can use them to quickly set up auth API routes.
 */

/**
 * Creates a POST handler for establishing a session cookie from a Firebase ID token.
 *
 * @example
 * ```typescript
 * // app/api/auth/session/route.ts
 * import { createSessionRouteHandler } from '@volcanica/firebase-auth-nextjs/next/app-router';
 *
 * export const runtime = 'nodejs';
 * export const POST = createSessionRouteHandler();
 * ```
 */
declare function createSessionRouteHandler(): (request: Request) => Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    ok: boolean;
}>>;
/**
 * Creates a GET handler for verifying the current session and returning user info.
 *
 * @example
 * ```typescript
 * // app/api/auth/verify/route.ts
 * import { createVerifyRouteHandler } from '@volcanica/firebase-auth-nextjs/next/app-router';
 *
 * export const runtime = 'nodejs';
 * export const GET = createVerifyRouteHandler();
 * ```
 */
declare function createVerifyRouteHandler(): () => Promise<NextResponse<{
    authenticated: boolean;
}>>;
/**
 * Creates POST and GET handlers for logout.
 *
 * POST: Revokes Firebase session and clears cookie.
 * GET: Returns 405 Method Not Allowed (prevents accidental logout via link clicks).
 *
 * @example
 * ```typescript
 * // app/api/auth/logout/route.ts
 * import { createLogoutRouteHandlers } from '@volcanica/firebase-auth-nextjs/next/app-router';
 *
 * export const runtime = 'nodejs';
 * export const { POST, GET } = createLogoutRouteHandlers();
 * ```
 */
declare function createLogoutRouteHandlers(): {
    POST: () => Promise<NextResponse<{
        ok: boolean;
    }>>;
    GET: () => Promise<NextResponse<{
        error: string;
    }>>;
};
/**
 * Creates a complete set of auth route handlers (session, verify, logout).
 *
 * This is a convenience export if you want to set up all three endpoints at once
 * (though typically they go in separate route files).
 */
declare function createAuthRouteHandlers(): {
    session: {
        POST: (request: Request) => Promise<NextResponse<{
            error: string;
        }> | NextResponse<{
            ok: boolean;
        }>>;
    };
    verify: {
        GET: () => Promise<NextResponse<{
            authenticated: boolean;
        }>>;
    };
    logout: {
        POST: () => Promise<NextResponse<{
            ok: boolean;
        }>>;
        GET: () => Promise<NextResponse<{
            error: string;
        }>>;
    };
};

export { createAuthRouteHandlers, createLogoutRouteHandlers, createSessionRouteHandler, createVerifyRouteHandler, getAuthenticatedUser, isAdminUser, redirectAuthenticatedUserToDashboard, requireAdminUserOrNotFound, requireAuthenticatedUserOr401, requireAuthenticatedUserOrRedirect };
