---
name: Bun-ready Next Firebase auth package
overview: Turn this repo into a Bun-built GitHub-installable package that drops into Next.js (App Router) to protect UI routes + API routes using Firebase session cookies, with optional middleware-based redirects.
todos:
  - id: add-bun-package-metadata
    content: Create `package.json` + Bun scripts + exports map; add `tsconfig.json` and build tooling to emit `dist/` + types
    status: completed
  - id: move-and-stabilize-library-api
    content: Re-home current Firebase env/admin/session + Next guards into `src/` with stable named exports and server/client entrypoints
    status: completed
    dependencies:
      - add-bun-package-metadata
  - id: next-middleware-factory
    content: Add `createAuthMiddleware` (cookie presence redirects) with clear config + matcher guidance; ensure it stays edge-safe
    status: completed
    dependencies:
      - move-and-stabilize-library-api
  - id: route-handler-factories
    content: Provide factories for `session`, `verify`, `logout` route handlers so consumers can drop them into `app/api/.../route.ts`
    status: completed
    dependencies:
      - move-and-stabilize-library-api
  - id: docs-and-tests
    content: Write README quickstart + add `bun test` coverage for env parsing + middleware decisions + cookie options
    status: completed
    dependencies:
      - next-middleware-factory
      - route-handler-factories
---

# Bun + Next.js Firebase Auth Layer Package

## Goals

- Make this repo a **reusable library** installable via GitHub with **Bun**.
- Provide **drop-in building blocks** for Next.js projects:
- **Session cookie creation/verification** using Firebase Admin (`ADMIN_FIREBASE` JSON env)
- **Automatic UI-route protection** (server guards + redirects)
- **Automatic API protection** (401 helpers/wrappers)
- **Proxy/middleware redirects** (presence-check in `middleware.ts`)
- **Cookie utilities + validation** (Node verification in server guards/handlers)

## Key decisions locked in

- **Repo shape**: library-first (optionally add `example/` later)
- **Middleware strictness**: **cookie presence only** at the edge; full validation occurs in Node runtime route handlers/guards

## Proposed library structure (colocation + Next-friendly exports)

- Create `src/` as the public package surface:
- `src/env/firebase-env.ts` (JSON env parsing; keep `NEXT_PUBLIC_FIREBASE` dot-notation behavior)
- `src/server/firebase-admin.ts` (Admin SDK init; server-only)
- `src/server/firebase-session.ts` (create/verify session cookie; cookie options)
- `src/next/app-router/auth-guards.ts` (SSR guards: redirect/notFound)
- `src/next/app-router/api-guard.ts` (401 helper)
- `src/next/middleware/create-auth-middleware.ts` (presence-based redirect middleware factory)
- `src/client/firebase-client.ts` (client SDK init)
- `src/client/auth-store.ts` (optional Zustand store; keep separate so consumers can opt-in)
- `src/index.ts` exporting **small, explicit entrypoints**

## Bun + packaging setup

- Add root `package.json` configured for:
- **Bun scripts**: `dev` (optional), `build`, `typecheck`, `test`
- **prepare** script so GitHub installs build `dist/` automatically
- `exports` map for clean consumption:
- `.` (core)
- `./server`, `./client`, `./next/*`
- `files` whitelist to publish only `dist/**`, `README.md`, `LICENSE`
- `peerDependencies` for Next/React (avoid duplicate React copies)
- Add `tsconfig.json` suitable for library builds (emit declarations, strict, no Next-specific path aliases)
- Add a tiny build pipeline:
- Use **`tsup`** (or Bun’s bundler) to emit ESM/CJS as needed
- Emit `.d.ts` for all public entrypoints
- Keep files <600 LOC by splitting modules
- Add Bun test setup using `bun test` with a few high-value unit tests:
- env JSON parsing + error messaging
- middleware redirect decisions
- cookie option defaults

## Next.js integration helpers (what consumers will copy/paste)

- **App Router Route Handlers**: Provide factories so users can do:
- `app/api/auth/session/route.ts` → `createSessionRouteHandler()`
- `app/api/auth/verify/route.ts` → `createVerifyRouteHandler()`
- `app/api/auth/logout/route.ts` → `createLogoutRouteHandler()`
- **Route guards**:
- `requireAuthenticatedUserOrRedirect()` for protected layouts/pages
- `requireAuthenticatedUserOr401()` for API handlers
- **Middleware**:
- `middleware.ts` uses `createAuthMiddleware({ protectedPrefixes: ['/dashboard'], loginPath: '/login' })`
- Presence-check only; Node routes still verify the cookie cryptographically

## Documentation

- Expand [`README.md`](/Users/colby/GitKraken/Freelance%20Clients/Volcanica/react-auth-library/README.md) with:
- Install (GitHub + Bun)
- Required env vars (`ADMIN_FIREBASE`, `NEXT_PUBLIC_FIREBASE`)
- Minimal Next.js wiring: middleware + API routes + layout guard
- Security notes: cookie is `httpOnly`, `secure` in prod, `sameSite=lax`

## Existing code to leverage

- Session cookie logic: [`utils/firebase/firebase-session.server.ts`](/Users/colby/GitKraken/Freelance%20Clients/Volcanica/react-auth-library/utils/firebase/firebase-session.server.ts)
- Env parsing (already matches your env format): [`utils/firebase/firebase-env.ts`](/Users/colby/GitKraken/Freelance%20Clients/Volcanica/react-auth-library/utils/firebase/firebase-env.ts)
- Server guards + API 401 helper:
- [`utils/auth/auth-guards.server.ts`](/Users/colby/GitKraken/Freelance%20Clients/Volcanica/react-auth-library/utils/auth/auth-guards.server.ts)
- [`utils/auth/auth-api-guard.server.ts`](/Users/colby/GitKraken/Freelance%20Clients/Volcanica/react-auth-library/utils/auth/auth-api-guard.server.ts)

## Notes / constraints

- Middleware will be **edge-safe** and won’t import Firebase Admin.
- Full session verification remains **Node runtime** (`export const runtime = 'nodejs'`) for API routes and SSR guards.
- We’ll remove `@/` path alias usage from published library code to avoid requiring consumers to mirror tsconfig paths.