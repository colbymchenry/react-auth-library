'use strict';

var server = require('next/server');
var admin = require('firebase-admin');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var admin__default = /*#__PURE__*/_interopDefault(admin);

// src/next/middleware/create-auth-middleware.ts

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
firebaseAdminApp.auth();

// src/server/firebase-session.ts
var FIREBASE_SESSION_COOKIE_NAME = "__session";

// src/next/middleware/create-auth-middleware.ts
function createAuthMiddleware(config = {}) {
  const {
    protectedPrefixes = ["/dashboard"],
    loginPath = "/login",
    authenticatedRedirectPath,
    publicOnlyPaths = ["/login"],
    cookieName = FIREBASE_SESSION_COOKIE_NAME
  } = config;
  return function authMiddleware(request) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get(cookieName);
    const hasSession = Boolean(sessionCookie?.value);
    const isProtectedPath = protectedPrefixes.some(
      (prefix) => pathname.startsWith(prefix)
    );
    const isPublicOnlyPath = publicOnlyPaths.some(
      (path) => pathname.startsWith(path)
    );
    if (isProtectedPath && !hasSession) {
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("from", pathname);
      return server.NextResponse.redirect(loginUrl);
    }
    if (isPublicOnlyPath && hasSession && authenticatedRedirectPath) {
      const dashboardUrl = new URL(authenticatedRedirectPath, request.url);
      return server.NextResponse.redirect(dashboardUrl);
    }
    return server.NextResponse.next();
  };
}
function getRecommendedMatcher() {
  return [
    /**
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder content (if you serve assets from /public)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ];
}

exports.createAuthMiddleware = createAuthMiddleware;
exports.getRecommendedMatcher = getRecommendedMatcher;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map