'use client';

/**
 * Client-only exports for Firebase Auth Next.js library.
 *
 * Import from '@colbymchenry/react-auth-library/client' to get client SDK, auth store, and provider.
 *
 * ⚠️ These exports are CLIENT-ONLY and should never be imported in server components,
 * middleware, or API routes.
 *
 * @example
 * ```tsx
 * 'use client';
 * import { useAuthStore, AuthProvider } from '@colbymchenry/react-auth-library/client';
 * ```
 */
export {
  firebaseAuth,
  googleAuthProvider,
} from './firebase-client';

export {
  useAuthStore,
} from './auth-store';

export {
  AuthProvider,
} from './auth-provider';

export {
  getFirebaseClientConfig,
  type FirebaseClientConfig,
} from '../env/firebase-env';

