/**
 * Main entrypoint for @volcanica/firebase-auth-nextjs.
 *
 * For most use cases, import from the specific subpaths:
 * - '@volcanica/firebase-auth-nextjs/server'
 * - '@volcanica/firebase-auth-nextjs/client'
 * - '@volcanica/firebase-auth-nextjs/next/app-router'
 * - '@volcanica/firebase-auth-nextjs/next/middleware'
 *
 * This entrypoint re-exports commonly used types and constants.
 */
export { FIREBASE_SESSION_COOKIE_NAME } from './server/firebase-session';
export type { VerifiedFirebaseUser } from './server/firebase-session';
export type { FirebaseClientConfig, FirebaseAdminServiceAccount } from './env/firebase-env';

