/**
 * Firebase session cookie helpers (server-only).
 *
 * We use Firebase Admin to create and verify session cookies. This enables server-side auth checks
 * (redirects, API protection) without relying on client state.
 */
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { firebaseAdminAuth } from './firebase-admin.server';

export const FIREBASE_SESSION_COOKIE_NAME = '__session';

// 5 days is a common default; adjust as needed.
const SESSION_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 5;

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  claims: DecodedIdToken;
}

export function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.floor(SESSION_EXPIRES_IN_MS / 1000),
  };
}

export async function createFirebaseSessionCookie(idToken: string): Promise<string> {
  return await firebaseAdminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });
}

export async function verifyFirebaseSessionCookie(sessionCookie: string): Promise<DecodedIdToken> {
  // checkRevoked=true ensures a revoked session is treated as invalid.
  return await firebaseAdminAuth.verifySessionCookie(sessionCookie, true);
}

export async function getVerifiedFirebaseUserFromCookies(
  cookies: ReadonlyRequestCookies,
): Promise<VerifiedFirebaseUser | null> {
  const sessionCookie = cookies.get(FIREBASE_SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const claims = await verifyFirebaseSessionCookie(sessionCookie);

    return {
      uid: claims.uid,
      email: claims.email,
      name: claims.name,
      picture: claims.picture,
      claims,
    };
  } catch {
    return null;
  }
}

export async function revokeFirebaseUserSessions(uid: string): Promise<void> {
  await firebaseAdminAuth.revokeRefreshTokens(uid);
}


