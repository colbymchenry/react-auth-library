import type { PropsWithChildren } from 'react';
import { isAdminUser, requireAuthenticatedUserOrRedirect } from '@/utils/auth/auth-guards.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: PropsWithChildren) {
  // Server-side enforcement: all dashboard routes require an authenticated session cookie.
  const user = await requireAuthenticatedUserOrRedirect();
  const showAdmin = isAdminUser(user);

  return (
    <div className="flex min-h-screen flex-col bg-primary">

      <main className="mx-auto w-full max-w-container flex-1 px-4 py-10 md:px-8">
        {children}
      </main>

    </div>
  );
}


