import { defineConfig } from 'tsup';

/**
 * Build configuration for the Firebase Auth Next.js library.
 *
 * We emit both ESM and CJS for maximum compatibility, and split entrypoints
 * to keep the consumer's bundle size small (server-only code won't bundle
 * into client builds).
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'server/index': 'src/server/index.ts',
    'client/index': 'src/client/index.ts',
    'next/app-router/index': 'src/next/app-router/index.ts',
    'next/middleware/index': 'src/next/middleware/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    'react',
    'react-dom',
    'next',
    'next/server',
    'next/headers',
    'next/navigation',
    'firebase',
    'firebase-admin',
    'firebase/app',
    'firebase/auth',
    'firebase-admin/auth',
    'zustand',
  ],
  noExternal: [],
  platform: 'neutral',
});

