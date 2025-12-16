'use strict';

var admin = require('firebase-admin');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var admin__default = /*#__PURE__*/_interopDefault(admin);

// src/server/firebase-admin.ts

// src/env/firebase-env.ts
var FirebaseEnvError = class extends Error {
  name = "FirebaseEnvError";
};
function parseJsonEnv(envKey) {
  const raw = process.env[envKey];
  if (!raw) {
    throw new FirebaseEnvError(
      `Missing environment variable "${envKey}". See env.example for the expected shape.`
    );
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FirebaseEnvError(
      `Invalid JSON in "${envKey}". Make sure it is a JSON string. Parse error: ${message}`
    );
  }
}
function getFirebaseAdminServiceAccount() {
  const serviceAccount = parseJsonEnv("ADMIN_FIREBASE");
  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new FirebaseEnvError(
      "ADMIN_FIREBASE is missing required keys. Required: project_id, client_email, private_key."
    );
  }
  return serviceAccount;
}

// src/server/firebase-admin.ts
function initializeAdminApp() {
  if (admin__default.default.apps.length) return admin__default.default.app();
  const serviceAccount = getFirebaseAdminServiceAccount();
  return admin__default.default.initializeApp({
    credential: admin__default.default.credential.cert(serviceAccount)
  });
}
var firebaseAdminApp = initializeAdminApp();
var firebaseAdminAuth = firebaseAdminApp.auth();

// src/server/firebase-session.ts
var FIREBASE_SESSION_COOKIE_NAME = "__session";
var SESSION_EXPIRES_IN_MS = 1e3 * 60 * 60 * 24 * 5;
function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_EXPIRES_IN_MS / 1e3)
  };
}
async function createFirebaseSessionCookie(idToken) {
  return await firebaseAdminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS
  });
}
async function verifyFirebaseSessionCookie(sessionCookie) {
  return await firebaseAdminAuth.verifySessionCookie(sessionCookie, true);
}
async function getVerifiedFirebaseUserFromCookies(cookies) {
  const sessionCookie = cookies.get(FIREBASE_SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;
  try {
    const claims = await verifyFirebaseSessionCookie(sessionCookie);
    return {
      uid: claims.uid,
      email: claims.email,
      name: claims.name,
      picture: claims.picture,
      claims
    };
  } catch {
    return null;
  }
}
async function revokeFirebaseUserSessions(uid) {
  await firebaseAdminAuth.revokeRefreshTokens(uid);
}

exports.FIREBASE_SESSION_COOKIE_NAME = FIREBASE_SESSION_COOKIE_NAME;
exports.createFirebaseSessionCookie = createFirebaseSessionCookie;
exports.firebaseAdminApp = firebaseAdminApp;
exports.firebaseAdminAuth = firebaseAdminAuth;
exports.getFirebaseAdminServiceAccount = getFirebaseAdminServiceAccount;
exports.getSessionCookieOptions = getSessionCookieOptions;
exports.getVerifiedFirebaseUserFromCookies = getVerifiedFirebaseUserFromCookies;
exports.revokeFirebaseUserSessions = revokeFirebaseUserSessions;
exports.verifyFirebaseSessionCookie = verifyFirebaseSessionCookie;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map