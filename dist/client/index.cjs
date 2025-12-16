'use strict';

var app = require('firebase/app');
var auth = require('firebase/auth');
var zustand = require('zustand');
var react = require('react');

// src/env/firebase-env.ts
var FirebaseEnvError = class extends Error {
  name = "FirebaseEnvError";
};
function getFirebaseClientConfig() {
  const raw = process.env.NEXT_PUBLIC_FIREBASE;
  if (!raw) {
    throw new FirebaseEnvError(
      'Missing environment variable "NEXT_PUBLIC_FIREBASE". See env.example for the expected shape.'
    );
  }
  let config;
  try {
    config = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FirebaseEnvError(
      `Invalid JSON in "NEXT_PUBLIC_FIREBASE". Make sure it is a JSON string. Parse error: ${message}`
    );
  }
  if (!config.apiKey || !config.authDomain || !config.projectId) {
    throw new FirebaseEnvError(
      "NEXT_PUBLIC_FIREBASE is missing required keys. Required: apiKey, authDomain, projectId."
    );
  }
  return config;
}

// src/client/firebase-client.ts
var firebaseApp = app.getApps().length ? app.getApp() : app.initializeApp(getFirebaseClientConfig());
var firebaseAuth = auth.getAuth(firebaseApp);
var googleAuthProvider = new auth.GoogleAuthProvider();
var EMAIL_FOR_SIGN_IN_STORAGE_KEY = "firebase.emailForSignIn";
async function establishServerSessionCookie() {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) return;
  const idToken = await currentUser.getIdToken(true);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken })
  });
  if (!response.ok) {
    throw new Error("Failed to establish server session cookie.");
  }
}
var useAuthStore = zustand.create((set) => ({
  status: "idle",
  user: null,
  error: null,
  startListener: () => {
    set({ status: "initializing", error: null });
    const unsubscribe = auth.onAuthStateChanged(
      firebaseAuth,
      (user) => {
        set({
          user,
          status: user ? "authenticated" : "unauthenticated",
          error: null
        });
      },
      (error) => {
        set({
          user: null,
          status: "unauthenticated",
          error: error?.message ?? "Failed to initialize auth."
        });
      }
    );
    return unsubscribe;
  },
  signInWithGoogle: async () => {
    set({ error: null });
    await auth.signInWithPopup(firebaseAuth, googleAuthProvider);
    await establishServerSessionCookie();
  },
  sendPasswordlessEmailLink: async (email) => {
    set({ error: null });
    if (!email) {
      set({ error: "Please enter your email." });
      return;
    }
    if (typeof window === "undefined") return;
    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true
    };
    await auth.sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);
    window.localStorage.setItem(EMAIL_FOR_SIGN_IN_STORAGE_KEY, email);
  },
  completePasswordlessEmailLink: async (url, email) => {
    set({ error: null });
    if (typeof window === "undefined") return;
    if (!auth.isSignInWithEmailLink(firebaseAuth, url)) return;
    const storedEmail = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_STORAGE_KEY) ?? void 0;
    const resolvedEmail = email ?? storedEmail;
    if (!resolvedEmail) {
      set({ error: "Please enter your email to complete sign-in." });
      return;
    }
    await auth.signInWithEmailLink(firebaseAuth, resolvedEmail, url);
    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_STORAGE_KEY);
    await establishServerSessionCookie();
  },
  signOut: async () => {
    set({ error: null });
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
    }
    await auth.signOut(firebaseAuth);
    set({ user: null, status: "unauthenticated" });
  }
}));
function AuthProvider({ children }) {
  const startListener = useAuthStore((state) => state.startListener);
  react.useEffect(() => {
    const unsubscribe = startListener();
    return () => unsubscribe();
  }, [startListener]);
  return children;
}

exports.AuthProvider = AuthProvider;
exports.firebaseAuth = firebaseAuth;
exports.getFirebaseClientConfig = getFirebaseClientConfig;
exports.googleAuthProvider = googleAuthProvider;
exports.useAuthStore = useAuthStore;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map