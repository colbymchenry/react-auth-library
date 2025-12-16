/**
 * Firebase Client SDK initialization (browser/client components only).
 *
 * This module is intentionally client-safe (no admin SDK, no secrets).
 */
import { initializeApp, getApp, getApps } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { getFirebaseClientConfig } from '../env/firebase-env';

const firebaseApp = getApps().length ? getApp() : initializeApp(getFirebaseClientConfig());

export const firebaseAuth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();

