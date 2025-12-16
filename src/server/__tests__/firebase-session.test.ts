/**
 * Tests for Firebase session cookie utilities.
 *
 * These tests verify cookie options generation and constants.
 */
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  FIREBASE_SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from '../firebase-session';

describe('Firebase Session Utilities', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('FIREBASE_SESSION_COOKIE_NAME', () => {
    it('should use __session as the cookie name', () => {
      expect(FIREBASE_SESSION_COOKIE_NAME).toBe('__session');
    });
  });

  describe('getSessionCookieOptions', () => {
    it('should return secure: false in development', () => {
      process.env.NODE_ENV = 'development';

      const options = getSessionCookieOptions();

      expect(options).toEqual({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: expect.any(Number),
      });
    });

    it('should return secure: true in production', () => {
      process.env.NODE_ENV = 'production';

      const options = getSessionCookieOptions();

      expect(options).toEqual({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: expect.any(Number),
      });
    });

    it('should always set httpOnly to true', () => {
      const options = getSessionCookieOptions();

      expect(options.httpOnly).toBe(true);
    });

    it('should always set sameSite to lax', () => {
      const options = getSessionCookieOptions();

      expect(options.sameSite).toBe('lax');
    });

    it('should set path to /', () => {
      const options = getSessionCookieOptions();

      expect(options.path).toBe('/');
    });

    it('should set maxAge to 5 days in seconds', () => {
      const options = getSessionCookieOptions();
      const fiveDaysInSeconds = 60 * 60 * 24 * 5;

      expect(options.maxAge).toBe(fiveDaysInSeconds);
    });

    it('should handle missing NODE_ENV (default to non-production)', () => {
      delete process.env.NODE_ENV;

      const options = getSessionCookieOptions();

      // Should default to secure: false when NODE_ENV is not set
      expect(options.secure).toBe(false);
    });

    it('should handle test environment', () => {
      process.env.NODE_ENV = 'test';

      const options = getSessionCookieOptions();

      expect(options.secure).toBe(false);
    });
  });

  describe('Cookie security best practices', () => {
    it('should meet security requirements for production cookies', () => {
      process.env.NODE_ENV = 'production';

      const options = getSessionCookieOptions();

      // All these should be true for production security
      expect(options.httpOnly).toBe(true); // Prevents XSS attacks
      expect(options.secure).toBe(true);   // HTTPS only
      expect(options.sameSite).toBe('lax'); // CSRF protection
      expect(options.path).toBe('/');      // Available to entire app
    });

    it('should have appropriate maxAge for session persistence', () => {
      const options = getSessionCookieOptions();

      // Should be long enough for user convenience but not too long for security
      // 5 days = 432000 seconds
      expect(options.maxAge).toBeGreaterThan(0);
      expect(options.maxAge).toBeLessThanOrEqual(60 * 60 * 24 * 7); // Max 1 week
    });
  });
});

