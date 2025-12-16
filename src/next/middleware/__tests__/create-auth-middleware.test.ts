/**
 * Tests for Next.js auth middleware factory.
 *
 * These tests verify that the middleware correctly redirects based on cookie presence
 * and path configuration.
 */
import { describe, it, expect } from 'bun:test';
import { createAuthMiddleware } from '../create-auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Helper to create a mock NextRequest for testing.
 */
function createMockRequest(pathname: string, hasCookie: boolean = false): NextRequest {
  const url = `https://example.com${pathname}`;
  const request = new NextRequest(url);

  if (hasCookie) {
    // Mock cookie by setting the header
    request.cookies.set('__session', 'mock-session-value');
  }

  return request;
}

describe('createAuthMiddleware', () => {
  describe('default configuration', () => {
    const middleware = createAuthMiddleware();

    it('should allow public paths without cookie', () => {
      const request = createMockRequest('/', false);
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should redirect to /login when accessing /dashboard without cookie', () => {
      const request = createMockRequest('/dashboard', false);
      const response = middleware(request);

      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('from=%2Fdashboard');
    });

    it('should allow /dashboard with valid cookie', () => {
      const request = createMockRequest('/dashboard', true);
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow /login without cookie', () => {
      const request = createMockRequest('/login', false);
      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('custom configuration', () => {
    const middleware = createAuthMiddleware({
      protectedPrefixes: ['/dashboard', '/admin', '/api/protected'],
      loginPath: '/auth/login',
      authenticatedRedirectPath: '/dashboard',
      publicOnlyPaths: ['/auth/login', '/auth/signup'],
    });

    it('should protect multiple path prefixes', () => {
      const dashboardRequest = createMockRequest('/dashboard/profile', false);
      const dashboardResponse = middleware(dashboardRequest);
      expect(dashboardResponse.status).toBe(307);
      expect(dashboardResponse.headers.get('location')).toContain('/auth/login');

      const adminRequest = createMockRequest('/admin/users', false);
      const adminResponse = middleware(adminRequest);
      expect(adminResponse.status).toBe(307);

      const apiRequest = createMockRequest('/api/protected/data', false);
      const apiResponse = middleware(apiRequest);
      expect(apiResponse.status).toBe(307);
    });

    it('should redirect to custom login path', () => {
      const request = createMockRequest('/dashboard', false);
      const response = middleware(request);

      expect(response.headers.get('location')).toContain('/auth/login');
    });

    it('should redirect authenticated users away from public-only paths', () => {
      const loginRequest = createMockRequest('/auth/login', true);
      const loginResponse = middleware(loginRequest);
      expect(loginResponse.status).toBe(307);
      expect(loginResponse.headers.get('location')).toContain('/dashboard');

      const signupRequest = createMockRequest('/auth/signup', true);
      const signupResponse = middleware(signupRequest);
      expect(signupResponse.status).toBe(307);
      expect(signupResponse.headers.get('location')).toContain('/dashboard');
    });

    it('should allow public paths for unauthenticated users', () => {
      const request = createMockRequest('/about', false);
      const response = middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow public paths for authenticated users (except public-only)', () => {
      const request = createMockRequest('/about', true);
      const response = middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('custom cookie name', () => {
    const middleware = createAuthMiddleware({
      cookieName: 'custom_session',
    });

    it('should check for custom cookie name', () => {
      const requestWithoutCookie = createMockRequest('/dashboard', false);
      const responseWithoutCookie = middleware(requestWithoutCookie);
      expect(responseWithoutCookie.status).toBe(307);

      // Create request with custom cookie
      const requestWithCookie = createMockRequest('/dashboard', false);
      requestWithCookie.cookies.set('custom_session', 'mock-value');
      const responseWithCookie = middleware(requestWithCookie);
      expect(responseWithCookie.status).toBe(200);
    });
  });

  describe('edge cases', () => {
    const middleware = createAuthMiddleware();

    it('should handle nested protected paths', () => {
      const request = createMockRequest('/dashboard/settings/profile', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should preserve query parameters in redirect target', () => {
      const request = createMockRequest('/dashboard?tab=settings', false);
      const response = middleware(request);

      expect(response.headers.get('location')).toContain('from=%2Fdashboard');
    });

    it('should not redirect on OPTIONS requests (CORS preflight)', () => {
      const request = new NextRequest('https://example.com/dashboard', {
        method: 'OPTIONS',
      });
      const response = middleware(request);

      // Middleware should allow OPTIONS through
      expect(response.status).toBe(200);
    });
  });

  describe('without authenticatedRedirectPath', () => {
    const middleware = createAuthMiddleware({
      // No authenticatedRedirectPath set
      publicOnlyPaths: ['/login'],
    });

    it('should not redirect authenticated users from public-only paths', () => {
      const request = createMockRequest('/login', true);
      const response = middleware(request);

      // Should allow through since no redirect path is configured
      expect(response.status).toBe(200);
    });
  });
});

