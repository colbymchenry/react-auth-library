'use strict';

var server = require('next/server');

// src/next/middleware/create-auth-middleware.ts
var FIREBASE_SESSION_COOKIE_NAME = "__session";
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
    const isPublicOnlyPath = publicOnlyPaths.some((path) => {
      if (path === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(path);
    });
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