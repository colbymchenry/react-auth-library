# Usage Guide

## Installation in Your Next.js Project

Add this package to your Next.js project via GitHub:

```bash
bun add github:volcanica/react-auth-library
```

## Setup Steps

### 1. Environment Variables

Create a `.env.local` file in your Next.js project:

```bash
# From your Firebase Console > Project Settings > Service Accounts
ADMIN_FIREBASE='{"type":"service_account","project_id":"...",...}'

# From your Firebase Console > Project Settings > General > Web app
NEXT_PUBLIC_FIREBASE='{"apiKey":"...","authDomain":"...",...}'
```

### 2. Create Middleware

Create `middleware.ts` in your project root:

```typescript
import { createAuthMiddleware } from '@volcanica/firebase-auth-nextjs/next/middleware';

export default createAuthMiddleware({
  protectedPrefixes: ['/dashboard'],
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

### 3. Create Auth API Routes

#### `app/api/auth/session/route.ts`
```typescript
import { createSessionRouteHandler } from '@volcanica/firebase-auth-nextjs/next/app-router';

export const runtime = 'nodejs';
export const POST = createSessionRouteHandler();
```

#### `app/api/auth/verify/route.ts`
```typescript
import { createVerifyRouteHandler } from '@volcanica/firebase-auth-nextjs/next/app-router';

export const runtime = 'nodejs';
export const GET = createVerifyRouteHandler();
```

#### `app/api/auth/logout/route.ts`
```typescript
import { createLogoutRouteHandlers } from '@volcanica/firebase-auth-nextjs/next/app-router';

export const runtime = 'nodejs';
export const { POST, GET } = createLogoutRouteHandlers();
```

### 4. Add Auth Provider to Root Layout

Update `app/layout.tsx`:

```typescript
import { AuthProvider } from '@volcanica/firebase-auth-nextjs/client';

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

### 5. Protect Routes with Server Guards

Create `app/dashboard/layout.tsx`:

```typescript
import { requireAuthenticatedUserOrRedirect } from '@volcanica/firebase-auth-nextjs/next/app-router';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuthenticatedUserOrRedirect();

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      {children}
    </div>
  );
}
```

### 6. Create Login Page

Create `app/login/page.tsx`:

```typescript
'use client';

import { useAuthStore } from '@volcanica/firebase-auth-nextjs/client';

export default function LoginPage() {
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const status = useAuthStore((state) => state.status);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      window.location.assign('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLogin} disabled={status === 'initializing'}>
        Sign in with Google
      </button>
    </div>
  );
}
```

## Development Workflow

### Building the Library

From the library repo:

```bash
# Install dependencies
bun install

# Build the library
bun run build

# Run tests
bun test

# Type check
bun run typecheck
```

### Testing in Your Project

After making changes to the library:

1. Build the library: `bun run build`
2. In your Next.js project, reinstall: `bun install --force`
3. Restart your Next.js dev server

## Common Patterns

### Protecting API Routes

```typescript
import { NextResponse } from 'next/server';
import { requireAuthenticatedUserOr401 } from '@volcanica/firebase-auth-nextjs/next/app-router';

export const runtime = 'nodejs';

export async function GET() {
  const { user, response } = await requireAuthenticatedUserOr401();

  if (!user) return response; // 401 Unauthorized

  return NextResponse.json({ message: 'Protected data', userId: user.uid });
}
```

### Admin-Only Routes

```typescript
import { requireAdminUserOrNotFound } from '@volcanica/firebase-auth-nextjs/next/app-router';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await requireAdminUserOrNotFound();

  return <div>Admin Dashboard for {user.email}</div>;
}
```

### Client-Side Auth State

```typescript
'use client';

import { useAuthStore } from '@volcanica/firebase-auth-nextjs/client';

export function UserProfile() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  if (!user) return <p>Not logged in</p>;

  return (
    <div>
      <p>Email: {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Troubleshooting

### "Missing environment variable" errors
- Make sure `ADMIN_FIREBASE` and `NEXT_PUBLIC_FIREBASE` are set
- Restart your Next.js dev server after adding env vars

### Session cookie not being set
- Check that `/api/auth/session` route exists and has `runtime = 'nodejs'`
- Verify Firebase client is calling the session endpoint after successful auth

### Middleware redirects not working
- Ensure `middleware.ts` is in the project root (not in `app/`)
- Check that the `matcher` config excludes static files

### Type errors
- Make sure you've installed peer dependencies: `next`, `react`, `firebase`, `firebase-admin`
- Run `bun run typecheck` in the library to verify types

## Publishing Updates

When you push changes to the library's GitHub repo:

1. Build: `bun run build`
2. Commit the built `dist/` folder
3. Push to GitHub
4. In consuming projects: `bun update @volcanica/firebase-auth-nextjs`

