import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeFirebaseUserSessions, verifyFirebaseSessionCookie, FIREBASE_SESSION_COOKIE_NAME, getSessionCookieOptions } from '@/utils/firebase/firebase-session.server';

export const runtime = 'nodejs';

export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(FIREBASE_SESSION_COOKIE_NAME)?.value;

  // Best-effort revocation (doesn't block logout if cookie is already invalid).
  if (sessionCookie) {
    try {
      const claims = await verifyFirebaseSessionCookie(sessionCookie);
      await revokeFirebaseUserSessions(claims.uid);
    } catch {
      // noop
    }
  }

  const response = NextResponse.json({ ok: true });

  // Clear cookie by setting an immediate expiry with the same cookie attributes.
  response.cookies.set(FIREBASE_SESSION_COOKIE_NAME, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}

// Allow logout via <form method="post" action="/api/auth/logout"> in server components.
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}


