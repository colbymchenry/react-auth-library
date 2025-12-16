import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import admin from 'firebase-admin';
import { NextResponse } from 'next/server';

// src/next/app-router/auth-guards.ts

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
  if (admin.apps.length) return admin.app();
  const serviceAccount = getFirebaseAdminServiceAccount();
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
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
async function getVerifiedFirebaseUserFromCookies(cookies3) {
  const sessionCookie = cookies3.get(FIREBASE_SESSION_COOKIE_NAME)?.value;
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

// src/next/app-router/auth-guards.ts
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  return await getVerifiedFirebaseUserFromCookies(cookieStore);
}
function isAdminUser(user) {
  const claims = user.claims ?? {};
  const adminClaim = claims["admin"];
  const roleClaim = claims["role"];
  return adminClaim === true || roleClaim === "admin";
}
async function requireAuthenticatedUserOrRedirect(loginPath = "/login") {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(loginPath);
  }
  return user;
}
async function requireAdminUserOrNotFound(loginPath = "/login") {
  const user = await requireAuthenticatedUserOrRedirect(loginPath);
  if (!isAdminUser(user)) {
    notFound();
  }
  return user;
}
async function redirectAuthenticatedUserToDashboard(dashboardPath = "/dashboard") {
  const user = await getAuthenticatedUser();
  if (user) {
    redirect(dashboardPath);
  }
}
async function requireAuthenticatedUserOr401() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }
  return { user, response: null };
}
function createSessionRouteHandler() {
  return async function POST(request) {
    let body = null;
    try {
      body = await request.json();
    } catch {
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
      const message = error instanceof Error ? error.message : "Failed to create session";
      return NextResponse.json({ error: message }, { status: 401 });
    }
  };
}
function createVerifyRouteHandler() {
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
        picture: user.picture ?? null
      }
    });
  };
}
function createLogoutRouteHandlers() {
  async function POST() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(FIREBASE_SESSION_COOKIE_NAME)?.value;
    if (sessionCookie) {
      try {
        const claims = await verifyFirebaseSessionCookie(sessionCookie);
        await revokeFirebaseUserSessions(claims.uid);
      } catch {
      }
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(FIREBASE_SESSION_COOKIE_NAME, "", {
      ...getSessionCookieOptions(),
      maxAge: 0
    });
    return response;
  }
  async function GET() {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }
  return { POST, GET };
}
function createAuthRouteHandlers() {
  return {
    session: { POST: createSessionRouteHandler() },
    verify: { GET: createVerifyRouteHandler() },
    logout: createLogoutRouteHandlers()
  };
}

export { createAuthRouteHandlers, createLogoutRouteHandlers, createSessionRouteHandler, createVerifyRouteHandler, getAuthenticatedUser, isAdminUser, redirectAuthenticatedUserToDashboard, requireAdminUserOrNotFound, requireAuthenticatedUserOr401, requireAuthenticatedUserOrRedirect };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map