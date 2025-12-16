/**
 * Server-only exports for Firebase Auth Next.js library.
 *
 * Import from '@volcanica/firebase-auth-nextjs/server' to get admin SDK and session utilities.
 */
export {
  firebaseAdminApp,
  firebaseAdminAuth,
} from './firebase-admin';

export {
  FIREBASE_SESSION_COOKIE_NAME,
  createFirebaseSessionCookie,
  verifyFirebaseSessionCookie,
  getVerifiedFirebaseUserFromCookies,
  revokeFirebaseUserSessions,
  getSessionCookieOptions,
  type VerifiedFirebaseUser,
} from './firebase-session';

export {
  getFirebaseAdminServiceAccount,
  type FirebaseAdminServiceAccount,
} from '../env/firebase-env';

