/**
 * Client-side auth state (Zustand).
 *
 * The server (session cookie) remains the source-of-truth for authorization checks.
 * This store exists to drive UI and initiate login/logout flows.
 */
import type { User } from 'firebase/auth';
import { create } from 'zustand';
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from './firebase-client';

const EMAIL_FOR_SIGN_IN_STORAGE_KEY = 'firebase.emailForSignIn';

type AuthStatus = 'idle' | 'initializing' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  error: string | null;

  /** Starts the Firebase client listener; should be called once from a top-level client provider. */
  startListener: () => () => void;

  /** Starts a Google popup sign-in, then establishes a server session cookie. */
  signInWithGoogle: () => Promise<void>;

  /** Sends a passwordless email link, then waits for the user to return via that link. */
  sendPasswordlessEmailLink: (email: string) => Promise<void>;

  /** Completes the passwordless flow if `url` is a valid sign-in link. */
  completePasswordlessEmailLink: (url: string, email?: string) => Promise<void>;

  /** Clears both the server session cookie and the Firebase client session. */
  signOut: () => Promise<void>;
}

async function establishServerSessionCookie(): Promise<void> {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) return;

  const idToken = await currentUser.getIdToken(true);

  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to establish server session cookie.');
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  user: null,
  error: null,

  startListener: () => {
    set({ status: 'initializing', error: null });

    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (user) => {
        set({
          user,
          status: user ? 'authenticated' : 'unauthenticated',
          error: null,
        });
      },
      (error) => {
        set({
          user: null,
          status: 'unauthenticated',
          error: error?.message ?? 'Failed to initialize auth.',
        });
      },
    );

    return unsubscribe;
  },

  signInWithGoogle: async () => {
    set({ error: null });
    await signInWithPopup(firebaseAuth, googleAuthProvider);
    await establishServerSessionCookie();
  },

  sendPasswordlessEmailLink: async (email: string) => {
    set({ error: null });

    if (!email) {
      set({ error: 'Please enter your email.' });
      return;
    }

    if (typeof window === 'undefined') return;

    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);
    window.localStorage.setItem(EMAIL_FOR_SIGN_IN_STORAGE_KEY, email);
  },

  completePasswordlessEmailLink: async (url: string, email?: string) => {
    set({ error: null });

    if (typeof window === 'undefined') return;
    if (!isSignInWithEmailLink(firebaseAuth, url)) return;

    const storedEmail = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_STORAGE_KEY) ?? undefined;
    const resolvedEmail = email ?? storedEmail;

    if (!resolvedEmail) {
      set({ error: 'Please enter your email to complete sign-in.' });
      return;
    }

    await signInWithEmailLink(firebaseAuth, resolvedEmail, url);
    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_STORAGE_KEY);
    await establishServerSessionCookie();
  },

  signOut: async () => {
    set({ error: null });

    // Best-effort server logout first to ensure server-side guards update immediately.
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // noop
    }

    await firebaseSignOut(firebaseAuth);

    // Ensure UI updates immediately; the auth listener will also confirm this state.
    set({ user: null, status: 'unauthenticated' });
  },
}));

