/**
 * Server-only auth guards for Next.js App Router.
 *
 * These helpers ensure redirects happen on the server (SSR) using the session cookie verified
 * by Firebase Admin. Middleware also enforces this at the proxy/edge layer, but we still guard
 * at the route layer to keep a strong defense-in-depth posture (and to make routes self-contained).
 */
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getVerifiedFirebaseUserFromCookies } from '../../server/firebase-session';

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  return await getVerifiedFirebaseUserFromCookies(cookieStore);
}

/**
 * Admin detection via Firebase custom claims.
 *
 * Expected options:
 * - `admin: true`
 * - `role: 'admin'`
 *
 * Keep this logic centralized so you can evolve your authorization model without touching routes.
 */
export function isAdminUser(user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>) {
  const claims = user.claims ?? {};

  // Common patterns for custom claims.
  const adminClaim = (claims as Record<string, unknown>)['admin'];
  const roleClaim = (claims as Record<string, unknown>)['role'];

  return adminClaim === true || roleClaim === 'admin';
}

export async function requireAuthenticatedUserOrRedirect(loginPath: string = '/login') {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(loginPath);
  }

  return user;
}

export async function requireAdminUserOrNotFound(loginPath: string = '/login') {
  const user = await requireAuthenticatedUserOrRedirect(loginPath);

  if (!isAdminUser(user)) {
    notFound();
  }

  return user;
}

export async function redirectAuthenticatedUserToDashboard(dashboardPath: string = '/dashboard') {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(dashboardPath);
  }
}

