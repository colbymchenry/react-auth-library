/**
 * Firebase Admin SDK initialization (server-only).
 *
 * This module must only be imported from server code (route handlers / server components).
 */
import admin from 'firebase-admin';
import { getFirebaseAdminServiceAccount } from './firebase-env';

function initializeAdminApp(): admin.app.App {
  if (admin.apps.length) return admin.app();

  const serviceAccount = getFirebaseAdminServiceAccount();

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const firebaseAdminApp = initializeAdminApp();
export const firebaseAdminAuth = firebaseAdminApp.auth();


