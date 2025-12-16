/**
 * API-route auth guard (server-only).
 *
 * Why not reuse the redirect guards?
 * - UI routes should redirect.
 * - API routes should return 401 JSON (no redirects), keeping clients predictable.
 */
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from './auth-guards';

export async function requireAuthenticatedUserOr401() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    } as const;
  }

  return { user, response: null } as const;
}

