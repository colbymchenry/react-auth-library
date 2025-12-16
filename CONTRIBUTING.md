# Contributing Guide

## Development Setup

1. Clone the repository
2. Install dependencies: `bun install`
3. Build the library: `bun run build`

## Project Structure

```
src/
├── env/                    # Environment variable parsing
│   ├── firebase-env.ts
│   └── __tests__/
├── server/                 # Server-only exports (Firebase Admin)
│   ├── firebase-admin.ts
│   ├── firebase-session.ts
│   ├── __tests__/
│   └── index.ts
├── client/                 # Client-only exports (Firebase Client)
│   ├── firebase-client.ts
│   ├── auth-store.ts
│   ├── auth-provider.tsx
│   └── index.ts
├── next/
│   ├── app-router/        # Next.js App Router utilities
│   │   ├── auth-guards.ts
│   │   ├── api-guard.ts
│   │   ├── route-handlers.ts
│   │   └── index.ts
│   └── middleware/        # Next.js middleware utilities
│       ├── create-auth-middleware.ts
│       ├── __tests__/
│       └── index.ts
└── index.ts               # Main entrypoint
```

## Scripts

- `bun run build` - Build the library (tsup)
- `bun test` - Run all tests
- `bun run typecheck` - Check TypeScript types
- `bun run prepare` - Auto-runs on `bun install` (for GitHub installs)

## Testing

We use Bun's built-in test runner. Tests are colocated with source files in `__tests__/` directories.

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/env/__tests__/firebase-env.test.ts

# Watch mode
bun test --watch
```

### Writing Tests

```typescript
import { describe, it, expect } from 'bun:test';

describe('MyFeature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

## Code Style

- Use **TypeScript** for all source files
- Follow **SOLID principles** and **OOP best practices**
- Add **senior-level comments** explaining intent and architecture
- Keep files under **600 lines**
- Use **colocation** for organization

### Comments

Write comments that explain **why**, not **what**:

```typescript
// ✅ Good: Explains the reasoning
// We use dot-notation here because Next.js only inlines NEXT_PUBLIC_* vars
// when accessed with process.env.VARIABLE_NAME (not process.env[key])
const raw = process.env.NEXT_PUBLIC_FIREBASE;

// ❌ Bad: States the obvious
// Get the raw value
const raw = process.env.NEXT_PUBLIC_FIREBASE;
```

## Architecture Decisions

### Why Separate Server/Client Entrypoints?

- **Tree-shaking**: Client bundles don't include Firebase Admin code
- **Type safety**: Prevents accidental import of server code in client
- **Clear boundaries**: Makes it obvious which code runs where

### Why Cookie Presence-Only Middleware?

- **Edge compatibility**: Can't import `firebase-admin` in edge runtime
- **Performance**: Fast cookie check without cryptographic verification
- **Defense in depth**: Server guards still perform full verification

### Why Session Cookies vs. Client-Only Auth?

- **Server-side rendering**: SSR requires auth state on the server
- **Security**: Prevents client-side token theft
- **SEO**: Protected content can be properly rendered server-side

## Making Changes

1. Create a feature branch
2. Make your changes with tests
3. Run `bun test` and `bun run typecheck`
4. Update documentation if needed
5. Build: `bun run build`
6. Commit changes including `dist/` folder
7. Open a pull request

## Publishing Checklist

Before pushing a new version:

- [ ] All tests pass: `bun test`
- [ ] Types check: `bun run typecheck`
- [ ] Build succeeds: `bun run build`
- [ ] Documentation is updated
- [ ] CHANGELOG is updated (if applicable)
- [ ] Version bumped in `package.json`

## Common Issues

### "Module not found" errors in consuming projects

Make sure the file is listed in the `exports` field of `package.json` and that you've run `bun run build`.

### Tests failing locally

Clear cache and reinstall:
```bash
rm -rf node_modules bun.lockb
bun install
```

### TypeScript errors in IDE

Restart your TypeScript server or reload your IDE window.

## Questions?

Open an issue on GitHub or contact the maintainers.

