/**
 * Client-only exports for Firebase Auth Next.js library.
 *
 * Import from '@volcanica/firebase-auth-nextjs/client' to get client SDK, auth store, and provider.
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

