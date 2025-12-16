import { redirectAuthenticatedUserToDashboard } from '@/utils/auth/auth-guards.server';
import { LoginScreen } from './login-screen';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // Server-side redirect: authenticated users should never see /login.
  await redirectAuthenticatedUserToDashboard();

  return <LoginScreen />;
}


