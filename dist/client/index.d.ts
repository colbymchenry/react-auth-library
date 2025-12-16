import * as _firebase_auth from '@firebase/auth';
import { GoogleAuthProvider, User } from 'firebase/auth';
import * as zustand from 'zustand';
import * as react from 'react';
import { PropsWithChildren } from 'react';
export { F as FirebaseClientConfig, b as getFirebaseClientConfig } from '../firebase-env-HY_uLqsT.js';

declare const firebaseAuth: _firebase_auth.Auth;
declare const googleAuthProvider: GoogleAuthProvider;

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
declare const useAuthStore: zustand.UseBoundStore<zustand.StoreApi<AuthState>>;

/**
 * Initializes client-side auth state once for the app.
 *
 * The server enforces authorization via session cookies. This provider only exists to power
 * client UX (showing user state, triggering login/logout flows, etc).
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { AuthProvider } from '@colbymchenry/react-auth-library/client';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AuthProvider>{children}</AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
declare function AuthProvider({ children }: PropsWithChildren): react.ReactNode;

export { AuthProvider, firebaseAuth, googleAuthProvider, useAuthStore };
