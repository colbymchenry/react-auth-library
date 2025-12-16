import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/utils/auth/auth-guards.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function IndexPage() {
  // Server-side root routing: treat `/` as an auth-aware entrypoint.
  const user = await getAuthenticatedUser();

  redirect(user ? '/dashboard' : '/login');
}
