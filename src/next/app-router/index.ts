/**
 * Next.js App Router utilities for Firebase Auth.
 *
 * Import from '@volcanica/firebase-auth-nextjs/next/app-router' to get server guards and API helpers.
 */
export {
  getAuthenticatedUser,
  isAdminUser,
  requireAuthenticatedUserOrRedirect,
  requireAdminUserOrNotFound,
  redirectAuthenticatedUserToDashboard,
} from './auth-guards';

export {
  requireAuthenticatedUserOr401,
} from './api-guard';

export {
  createSessionRouteHandler,
  createVerifyRouteHandler,
  createLogoutRouteHandlers,
  createAuthRouteHandlers,
} from './route-handlers';
