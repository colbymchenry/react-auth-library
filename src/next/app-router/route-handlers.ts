/**
 * Route handler factories for Firebase Auth API endpoints.
 *
 * These factories create Next.js route handlers for session management.
 * Consumers can use them to quickly set up auth API routes.
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createFirebaseSessionCookie,
  verifyFirebaseSessionCookie,
  revokeFirebaseUserSessions,
  getVerifiedFirebaseUserFromCookies,
  getSessionCookieOptions,
  FIREBASE_SESSION_COOKIE_NAME,
} from '../../server/firebase-session';

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
export function createSessionRouteHandler() {
  return async function POST(request: Request) {
    let body: { idToken?: string } | null = null;

    try {
      body = (await request.json()) as { idToken?: string };
    } catch {
      // noop
    }

    const idToken = body?.idToken;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing "idToken".' }, { status: 400 });
    }

    try {
      const sessionCookie = await createFirebaseSessionCookie(idToken);

      const response = NextResponse.json({ ok: true });
      response.cookies.set(
        FIREBASE_SESSION_COOKIE_NAME,
        sessionCookie,
        getSessionCookieOptions()
      );

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create session';
      return NextResponse.json({ error: message }, { status: 401 });
    }
  };
}

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
export function createVerifyRouteHandler() {
  return async function GET() {
    const cookieStore = await cookies();
    const user = await getVerifiedFirebaseUserFromCookies(cookieStore);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        uid: user.uid,
        email: user.email ?? null,
        name: user.name ?? null,
        picture: user.picture ?? null,
      },
    });
  };
}

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
export function createLogoutRouteHandlers() {
  async function POST() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(FIREBASE_SESSION_COOKIE_NAME)?.value;

    // Best-effort revocation (doesn't block logout if cookie is already invalid).
    if (sessionCookie) {
      try {
        const claims = await verifyFirebaseSessionCookie(sessionCookie);
        await revokeFirebaseUserSessions(claims.uid);
      } catch {
        // noop
      }
    }

    const response = NextResponse.json({ ok: true });

    // Clear cookie by setting an immediate expiry with the same cookie attributes.
    response.cookies.set(FIREBASE_SESSION_COOKIE_NAME, '', {
      ...getSessionCookieOptions(),
      maxAge: 0,
    });

    return response;
  }

  // Prevent accidental logout via GET (e.g., from link prefetch or browser navigation)
  async function GET() {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  return { POST, GET };
}

/**
 * Creates a complete set of auth route handlers (session, verify, logout).
 *
 * This is a convenience export if you want to set up all three endpoints at once
 * (though typically they go in separate route files).
 */
export function createAuthRouteHandlers() {
  return {
    session: { POST: createSessionRouteHandler() },
    verify: { GET: createVerifyRouteHandler() },
    logout: createLogoutRouteHandlers(),
  };
}

