/**
 * Client provider that initializes Firebase auth listener.
 *
 * Wrap your app in this provider to enable client-side auth state.
 */
'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useAuthStore } from './auth-store';

/**
 * Initializes client-side auth state once for the app.
 *
 * The server enforces authorization via session cookies. This provider only exists to power
 * client UX (showing user state, triggering login/logout flows, etc).
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const startListener = useAuthStore((state) => state.startListener);

  useEffect(() => {
    const unsubscribe = startListener();
    return () => unsubscribe();
  }, [startListener]);

  return children;
}

