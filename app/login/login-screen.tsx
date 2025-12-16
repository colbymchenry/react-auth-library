'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { SocialButton } from '@/components/base/buttons/social-button';
import { Input } from '@/components/base/input/input';
import { UntitledLogoMinimal } from '@/components/foundations/logo/untitledui-logo-minimal';
import { useAuthStore } from '@/stores/auth/auth-store';

type EmailLinkPhase = 'idle' | 'sending' | 'sent' | 'completing';

export function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<EmailLinkPhase>('idle');
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const sendPasswordlessEmailLink = useAuthStore((state) => state.sendPasswordlessEmailLink);
  const completePasswordlessEmailLink = useAuthStore((state) => state.completePasswordlessEmailLink);
  const authError = useAuthStore((state) => state.error);

  const message = useMemo(() => authError ?? localMessage, [authError, localMessage]);

  useEffect(() => {
    // If the user landed here via an email sign-in link, complete the flow automatically.
    // After establishing the server session cookie, we do a full navigation so the server
    // (middleware + route guard) can take over for redirects.
    const maybeComplete = async () => {
      if (typeof window === 'undefined') return;

      setPhase('completing');
      await completePasswordlessEmailLink(window.location.href, email || undefined);

      // If completion succeeds, middleware will redirect /login -> /dashboard on navigation.
      window.location.assign('/dashboard');
    };

    // Only attempt completion if the URL looks like a sign-in link; the store will no-op otherwise.
    // We don't want to eagerly set `phase` for normal visits.
    if (typeof window !== 'undefined' && window.location.search.includes('oobCode=')) {
      void maybeComplete().catch((error) => {
        const msg = error instanceof Error ? error.message : 'Failed to complete email sign-in.';
        setLocalMessage(msg);
        setPhase('idle');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogle = async () => {
    setLocalMessage(null);

    try {
      await signInWithGoogle();
      window.location.assign('/dashboard');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Google sign-in failed.';
      setLocalMessage(msg);
    }
  };

  const handleSendLink = async () => {
    setLocalMessage(null);
    setPhase('sending');

    try {
      await sendPasswordlessEmailLink(email.trim());
      setPhase('sent');
      setLocalMessage('Check your email for a sign-in link.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to send sign-in link.';
      setLocalMessage(msg);
      setPhase('idle');
    }
  };

  return (
    <section className="flex min-h-screen items-start bg-primary py-16 md:items-center md:py-24">
      <div className="mx-auto max-w-container grow px-4 md:px-8">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-secondary ring-1 ring-secondary ring-inset">
              <UntitledLogoMinimal className="size-7" />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-display-xs font-semibold text-primary">Sign in</h1>
              <p className="text-md text-tertiary">Use Google or a passwordless email link.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <SocialButton social="google" theme="gray" size="xl" onClick={handleGoogle}>
              Continue with Google
            </SocialButton>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-primary px-3 text-sm font-medium text-tertiary">or</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              icon={Mail01}
              value={email}
              onChange={setEmail}
              isDisabled={phase === 'sending' || phase === 'completing'}
            />

            <Button
              size="xl"
              color="primary"
              isLoading={phase === 'sending'}
              isDisabled={!email.trim() || phase === 'completing'}
              onClick={handleSendLink}
            >
              Send sign-in link
            </Button>

            {message && (
              <div className="rounded-lg bg-secondary px-4 py-3 ring-1 ring-secondary ring-inset">
                <p className="text-sm text-secondary">{message}</p>
              </div>
            )}

            <Button color="link-gray" size="sm" onClick={() => router.push('/')}>
              Back to home
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


