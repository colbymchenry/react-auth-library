/**
 * Firebase environment parsing utilities.
 *
 * We keep this logic centralized to avoid leaking env parsing concerns throughout the codebase
 * (SRP) and to provide a single place for validation / error messaging.
 */
interface FirebaseClientConfig {
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
interface FirebaseAdminServiceAccount {
    project_id: string;
    client_email: string;
    private_key: string;
    [key: string]: unknown;
}
declare function getFirebaseClientConfig(): FirebaseClientConfig;
declare function getFirebaseAdminServiceAccount(): FirebaseAdminServiceAccount;

export { type FirebaseClientConfig as F, type FirebaseAdminServiceAccount as a, getFirebaseClientConfig as b, getFirebaseAdminServiceAccount as g };
