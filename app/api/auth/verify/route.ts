import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getVerifiedFirebaseUserFromCookies } from '@/utils/firebase/firebase-session.server';

export const runtime = 'nodejs';

export async function GET() {
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
      picture: user.picture ?? null,
    },
  });
}


