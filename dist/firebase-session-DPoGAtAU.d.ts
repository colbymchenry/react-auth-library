import { DecodedIdToken } from 'firebase-admin/auth';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

/**
 * Firebase session cookie helpers (server-only).
 *
 * We use Firebase Admin to create and verify session cookies. This enables server-side auth checks
 * (redirects, API protection) without relying on client state.
 */

declare const FIREBASE_SESSION_COOKIE_NAME = "__session";
interface VerifiedFirebaseUser {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    claims: DecodedIdToken;
}
declare function getSessionCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge: number;
};
declare function createFirebaseSessionCookie(idToken: string): Promise<string>;
declare function verifyFirebaseSessionCookie(sessionCookie: string): Promise<DecodedIdToken>;
declare function getVerifiedFirebaseUserFromCookies(cookies: ReadonlyRequestCookies): Promise<VerifiedFirebaseUser | null>;
declare function revokeFirebaseUserSessions(uid: string): Promise<void>;

export { FIREBASE_SESSION_COOKIE_NAME as F, type VerifiedFirebaseUser as V, getSessionCookieOptions as a, createFirebaseSessionCookie as c, getVerifiedFirebaseUserFromCookies as g, revokeFirebaseUserSessions as r, verifyFirebaseSessionCookie as v };
