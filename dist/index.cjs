'use strict';

var admin = require('firebase-admin');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var admin__default = /*#__PURE__*/_interopDefault(admin);

// src/server/firebase-admin.ts

// src/env/firebase-env.ts
var FirebaseEnvError = class extends Error {
  name = "FirebaseEnvError";
};
function parseJsonEnv(envKey) {
  const raw = process.env[envKey];
  if (!raw) {
    throw new FirebaseEnvError(
      `Missing environment variable "${envKey}". See env.example for the expected shape.`
    );
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FirebaseEnvError(
      `Invalid JSON in "${envKey}". Make sure it is a JSON string. Parse error: ${message}`
    );
  }
}
function getFirebaseAdminServiceAccount() {
  const serviceAccount = parseJsonEnv("ADMIN_FIREBASE");
  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    throw new FirebaseEnvError(
      "ADMIN_FIREBASE is missing required keys. Required: project_id, client_email, private_key."
    );
  }
  return serviceAccount;
}

// src/server/firebase-admin.ts
function initializeAdminApp() {
  if (admin__default.default.apps.length) return admin__default.default.app();
  const serviceAccount = getFirebaseAdminServiceAccount();
  return admin__default.default.initializeApp({
    credential: admin__default.default.credential.cert(serviceAccount)
  });
}
var firebaseAdminApp = initializeAdminApp();
firebaseAdminApp.auth();

// src/server/firebase-session.ts
var FIREBASE_SESSION_COOKIE_NAME = "__session";

exports.FIREBASE_SESSION_COOKIE_NAME = FIREBASE_SESSION_COOKIE_NAME;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map