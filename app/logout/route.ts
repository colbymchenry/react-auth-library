import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  FIREBASE_SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  revokeFirebaseUserSessions,
  verifyFirebaseSessionCookie,
} from '@/utils/firebase/firebase-session.server';

export const runtime = 'nodejs';

/**
 * Server logout endpoint (non-API route).
 *
 * We keep this separate from `/api/auth/logout` so we can return a server redirect suitable
 * for user navigation (HTML flow).
 */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(FIREBASE_SESSION_COOKIE_NAME)?.value;

  if (sessionCookie) {
    try {
      const claims = await verifyFirebaseSessionCookie(sessionCookie);
      await revokeFirebaseUserSessions(claims.uid);
    } catch {
      // noop
    }
  }

  // Redirect relative to the current request host; avoids needing a public site URL env var.
  const response = NextResponse.redirect(new URL('/login', request.url));

  response.cookies.set(FIREBASE_SESSION_COOKIE_NAME, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}


