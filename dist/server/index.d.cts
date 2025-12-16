import * as firebase_admin_auth from 'firebase-admin/auth';
import admin from 'firebase-admin';
export { F as FIREBASE_SESSION_COOKIE_NAME, V as VerifiedFirebaseUser, c as createFirebaseSessionCookie, a as getSessionCookieOptions, g as getVerifiedFirebaseUserFromCookies, r as revokeFirebaseUserSessions, v as verifyFirebaseSessionCookie } from '../firebase-session-DPoGAtAU.cjs';
export { a as FirebaseAdminServiceAccount, g as getFirebaseAdminServiceAccount } from '../firebase-env-HY_uLqsT.cjs';
import 'next/dist/server/web/spec-extension/adapters/request-cookies';

declare const firebaseAdminApp: admin.app.App;
declare const firebaseAdminAuth: firebase_admin_auth.Auth;

export { firebaseAdminApp, firebaseAdminAuth };
