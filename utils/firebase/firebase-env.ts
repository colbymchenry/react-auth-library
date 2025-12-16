/**
 * Firebase environment parsing utilities.
 *
 * We keep this logic centralized to avoid leaking env parsing concerns throughout the codebase
 * (SRP) and to provide a single place for validation / error messaging.
 */
export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

/**
 * NOTE: This is the shape we expect from a Firebase Admin service account JSON.
 * We intentionally keep it permissive because Google occasionally adds fields.
 */
export interface FirebaseAdminServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
  [key: string]: unknown;
}

class FirebaseEnvError extends Error {
  public readonly name = 'FirebaseEnvError';
}

function parseJsonEnv<T>(envKey: string): T {
  const raw = process.env[envKey];

  if (!raw) {
    throw new FirebaseEnvError(
      `Missing environment variable "${envKey}". See env.example for the expected shape.`,
    );
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FirebaseEnvError(
      `Invalid JSON in "${envKey}". Make sure it is a JSON string. Parse error: ${message}`,
    );
  }
}

export function getFirebaseClientConfig(): FirebaseClientConfig {
  /**
   * IMPORTANT (Next.js / Turbopack):
   * Client-side env vars are statically inlined only when accessed with dot-notation
   * (e.g. `process.env.NEXT_PUBLIC_FOO`). Bracket access (`process.env[key]`) is dynamic and
   * will evaluate to `undefined` in the browser bundle.
   *
   * Therefore we intentionally read `NEXT_PUBLIC_FIREBASE` with dot-notation here.
   */
  const raw = process.env.NEXT_PUBLIC_FIREBASE;

  if (!raw) {
    throw new FirebaseEnvError(
      'Missing environment variable "NEXT_PUBLIC_FIREBASE". See env.example for the expected shape.',
    );
  }

  let config: FirebaseClientConfig;

  try {
    config = JSON.parse(raw) as FirebaseClientConfig;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FirebaseEnvError(
      `Invalid JSON in "NEXT_PUBLIC_FIREBASE". Make sure it is a JSON string. Parse error: ${message}`,
    );
  }

  // Defensive validation: fail fast in development to avoid confusing runtime errors.
  if (!config.apiKey || !config.authDomain || !config.projectId) {
    throw new FirebaseEnvError(
      'NEXT_PUBLIC_FIREBASE is missing required keys. Required: apiKey, authDomain, projectId.',
    );
  }

  return config;
}

export function getFirebaseAdminServiceAccount(): FirebaseAdminServiceAccount {
  const serviceAccount = parseJsonEnv<FirebaseAdminServiceAccount>('ADMIN_FIREBASE');

  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new FirebaseEnvError(
      'ADMIN_FIREBASE is missing required keys. Required: project_id, client_email, private_key.',
    );
  }

  return serviceAccount;
}


