import { NextResponse } from 'next/server';
import { createFirebaseSessionCookie, FIREBASE_SESSION_COOKIE_NAME, getSessionCookieOptions } from '@/utils/firebase/firebase-session.server';

export const runtime = 'nodejs';

interface CreateSessionBody {
  idToken?: string;
}

export async function POST(request: Request) {
  let body: CreateSessionBody | null = null;

  try {
    body = (await request.json()) as CreateSessionBody;
  } catch {
    // noop
  }

  const idToken = body?.idToken;

  if (!idToken) {
    return NextResponse.json({ error: 'Missing "idToken".' }, { status: 400 });
  }

  const sessionCookie = await createFirebaseSessionCookie(idToken);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(FIREBASE_SESSION_COOKIE_NAME, sessionCookie, getSessionCookieOptions());

  return response;
}


