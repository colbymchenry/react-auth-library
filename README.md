# @colbymchenry/react-auth-library

**Firebase session-based authentication utilities for Next.js App Router projects.**

This library provides drop-in building blocks for protecting Next.js routes with Firebase Authentication:

- ✅ **Session cookie management** (Firebase Admin SDK)
- ✅ **Automatic UI route protection** (server guards + redirects)
- ✅ **Automatic API protection** (401 helpers/wrappers)
- ✅ **Proxy/middleware redirects** (cookie presence checks)
- ✅ **Edge-safe middleware** (no Node dependencies)
- ✅ **TypeScript-first** with full type safety
- ✅ **Built with Bun** for fast installs and builds

---

## Installation

Install via GitHub with Bun:

```bash
bun add github:colbymchenry/react-auth-library
```

Or with npm/pnpm/yarn:

```bash
npm install github:colbymchenry/react-auth-library
# or
pnpm add github:colbymchenry/react-auth-library
# or
yarn add github:colbymchenry/react-auth-library
```

---

## Required Environment Variables

This library expects Firebase credentials as JSON strings in your environment variables:

```bash
# Server-only: Firebase Admin SDK service account
ADMIN_FIREBASE='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-...","universe_domain":"googleapis.com"}'

# Public: Firebase client config (must be prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE='{"apiKey":"...","authDomain":"your-project.firebaseapp.com","projectId":"your-project","storageBucket":"your-project.firebasestorage.app","messagingSenderId":"...","appId":"...","measurementId":"..."}'
```

**⚠️ Important:** The `NEXT_PUBLIC_FIREBASE` variable must use the `NEXT_PUBLIC_` prefix for Next.js to inline it into client bundles.

---

## Quick Start

### 1. Set up middleware (cookie presence checks)

Create `middleware.ts` at your project root:

```typescript
import { createAuthMiddleware } from '@colbymchenry/react-auth-library/next/middleware';

export default createAuthMiddleware({
  protectedPrefixes: ['/dashboard', '/api/protected'],
  loginPath: '/login',
  authenticatedRedirectPath: '/dashboard',
  publicOnlyPaths: ['/login'],
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 2. Create auth API routes

#### `app/api/auth/session/route.ts`

```typescript
import { createSessionRouteHandler } from '@colbymchenry/react-auth-library/next/app-router';

export const runtime = 'nodejs';
export const POST = createSessionRouteHandler();
```

#### `app/api/auth/verify/route.ts`

```typescript
import { createVerifyRouteHandler } from '@colbymchenry/react-auth-library/next/app-router';

export const runtime = 'nodejs';
export const GET = createVerifyRouteHandler();
```

#### `app/api/auth/logout/route.ts`

```typescript
import { createLogoutRouteHandlers } from '@colbymchenry/react-auth-library/next/app-router';

export const runtime = 'nodejs';
export const { POST, GET } = createLogoutRouteHandlers();
```

### 3. Protect your routes with server guards

#### Protected layout (e.g., `app/dashboard/layout.tsx`)

```typescript
import { requireAuthenticatedUserOrRedirect } from '@colbymchenry/react-auth-library/next/app-router';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuthenticatedUserOrRedirect();

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      {children}
    </div>
  );
}
```

#### Protected API route (e.g., `app/api/protected/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import { requireAuthenticatedUserOr401 } from '@colbymchenry/react-auth-library/next/app-router';

export const runtime = 'nodejs';

export async function GET() {
  const { user, response } = await requireAuthenticatedUserOr401();

  if (!user) {
    return response; // 401 Unauthorized
  }

  return NextResponse.json({ message: 'Protected data', userId: user.uid });
}
```

### 4. Set up client-side auth (optional)

Wrap your app with the auth provider in `app/layout.tsx`:

```typescript
import { AuthProvider } from '@colbymchenry/react-auth-library/client';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

Use the auth store in client components:

```typescript
'use client';

import { useAuthStore } from '@colbymchenry/react-auth-library/client';

export function LoginButton() {
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  if (status === 'authenticated' && user) {
    return <p>Logged in as {user.email}</p>;
  }

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}
```

---

## API Reference

### Server (`@colbymchenry/react-auth-library/server`)

- `firebaseAdminApp` - Firebase Admin app instance
- `firebaseAdminAuth` - Firebase Admin Auth instance
- `createFirebaseSessionCookie(idToken)` - Create session cookie from ID token
- `verifyFirebaseSessionCookie(cookie)` - Verify and decode session cookie
- `getVerifiedFirebaseUserFromCookies(cookies)` - Extract user from request cookies
- `revokeFirebaseUserSessions(uid)` - Revoke all refresh tokens for a user
- `getSessionCookieOptions()` - Get cookie options (httpOnly, secure, sameSite, etc.)
- `FIREBASE_SESSION_COOKIE_NAME` - Default cookie name (`__session`)

### Client (`@colbymchenry/react-auth-library/client`)

- `firebaseAuth` - Firebase Auth instance
- `googleAuthProvider` - Google Auth provider
- `useAuthStore` - Zustand store for client auth state
- `AuthProvider` - React provider component

### Next.js App Router (`@colbymchenry/react-auth-library/next/app-router`)

**Server Guards:**
- `getAuthenticatedUser()` - Get current user or null
- `isAdminUser(user)` - Check if user has admin claims
- `requireAuthenticatedUserOrRedirect(loginPath?)` - Redirect if not authenticated
- `requireAdminUserOrNotFound(loginPath?)` - 404 if not admin
- `redirectAuthenticatedUserToDashboard(dashboardPath?)` - Redirect if already authenticated

**API Guards:**
- `requireAuthenticatedUserOr401()` - Return 401 JSON if not authenticated

**Route Handlers:**
- `createSessionRouteHandler()` - POST handler for session creation
- `createVerifyRouteHandler()` - GET handler for session verification
- `createLogoutRouteHandlers()` - POST/GET handlers for logout

### Middleware (`@colbymchenry/react-auth-library/next/middleware`)

- `createAuthMiddleware(config)` - Create middleware function
- `getRecommendedMatcher()` - Get recommended matcher config

**Middleware Config:**
```typescript
interface AuthMiddlewareConfig {
  protectedPrefixes?: string[];         // Default: ['/dashboard']
  loginPath?: string;                   // Default: '/login'
  authenticatedRedirectPath?: string;   // Default: undefined
  publicOnlyPaths?: string[];           // Default: ['/login']
  cookieName?: string;                  // Default: '__session'
}
```

---

## Security Notes

- **Session cookies** are `httpOnly`, `secure` in production, and `sameSite=lax`
- **Middleware** performs fast cookie presence checks (edge-safe, no Firebase Admin)
- **Server guards** perform full cryptographic verification (Node runtime, Firebase Admin)
- **Defense in depth**: middleware + server guards provide layered security
- **Cookie duration**: 5 days (configurable in `firebase-session.ts`)

---

## Architecture

```
┌─────────────────┐
│  Browser/Client │
└────────┬────────┘
         │ 1. Sign in with Firebase (popup/email link)
         ↓
┌────────────────────────┐
│ Firebase Auth (client) │
└────────┬───────────────┘
         │ 2. Get ID token
         ↓
┌─────────────────────────────┐
│ POST /api/auth/session      │
│ (Node: verify + set cookie) │
└────────┬────────────────────┘
         │ 3. Set __session cookie
         ↓
┌──────────────────────────┐
│ middleware.ts (Edge)     │
│ - Cookie presence check  │
│ - Redirect if missing    │
└────────┬─────────────────┘
         │ 4. Allow request
         ↓
┌──────────────────────────────┐
│ Server Component/API Route   │
│ (Node: full verification)    │
│ - Verify session cookie JWT  │
│ - Check revocation           │
│ - Extract user/claims        │
└──────────────────────────────┘
```

---

## Contributing

Contributions are welcome! Please open an issue or PR on GitHub.

---

## License

MIT © @colbymchenry
