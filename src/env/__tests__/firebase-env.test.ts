/**
 * Tests for Firebase environment variable parsing.
 *
 * These tests ensure that our env parsing logic correctly validates and parses
 * Firebase configuration from JSON-formatted environment variables.
 */
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { getFirebaseClientConfig, getFirebaseAdminServiceAccount } from '../firebase-env';

describe('Firebase Environment Parsing', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset env between tests
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getFirebaseClientConfig', () => {
    it('should parse valid NEXT_PUBLIC_FIREBASE JSON', () => {
      process.env.NEXT_PUBLIC_FIREBASE = JSON.stringify({
        apiKey: 'test-api-key',
        authDomain: 'test.firebaseapp.com',
        projectId: 'test-project',
        storageBucket: 'test.appspot.com',
        messagingSenderId: '123456',
        appId: 'test-app-id',
      });

      const config = getFirebaseClientConfig();

      expect(config).toEqual({
        apiKey: 'test-api-key',
        authDomain: 'test.firebaseapp.com',
        projectId: 'test-project',
        storageBucket: 'test.appspot.com',
        messagingSenderId: '123456',
        appId: 'test-app-id',
      });
    });

    it('should throw FirebaseEnvError if NEXT_PUBLIC_FIREBASE is missing', () => {
      delete process.env.NEXT_PUBLIC_FIREBASE;

      expect(() => getFirebaseClientConfig()).toThrow('Missing environment variable');
    });

    it('should throw FirebaseEnvError if NEXT_PUBLIC_FIREBASE is invalid JSON', () => {
      process.env.NEXT_PUBLIC_FIREBASE = 'not-valid-json';

      expect(() => getFirebaseClientConfig()).toThrow('Invalid JSON');
    });

    it('should throw FirebaseEnvError if required keys are missing', () => {
      process.env.NEXT_PUBLIC_FIREBASE = JSON.stringify({
        apiKey: 'test-api-key',
        // Missing authDomain and projectId
      });

      expect(() => getFirebaseClientConfig()).toThrow('missing required keys');
    });

    it('should accept minimal valid config (apiKey, authDomain, projectId)', () => {
      process.env.NEXT_PUBLIC_FIREBASE = JSON.stringify({
        apiKey: 'test-api-key',
        authDomain: 'test.firebaseapp.com',
        projectId: 'test-project',
      });

      const config = getFirebaseClientConfig();

      expect(config.apiKey).toBe('test-api-key');
      expect(config.authDomain).toBe('test.firebaseapp.com');
      expect(config.projectId).toBe('test-project');
    });
  });

  describe('getFirebaseAdminServiceAccount', () => {
    it('should parse valid ADMIN_FIREBASE JSON', () => {
      process.env.ADMIN_FIREBASE = JSON.stringify({
        type: 'service_account',
        project_id: 'test-project',
        private_key_id: 'key-id-123',
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
        client_email: 'firebase-adminsdk@test-project.iam.gserviceaccount.com',
        client_id: '123456789',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
      });

      const account = getFirebaseAdminServiceAccount();

      expect(account.project_id).toBe('test-project');
      expect(account.client_email).toBe('firebase-adminsdk@test-project.iam.gserviceaccount.com');
      expect(account.private_key).toContain('BEGIN PRIVATE KEY');
    });

    it('should throw FirebaseEnvError if ADMIN_FIREBASE is missing', () => {
      delete process.env.ADMIN_FIREBASE;

      expect(() => getFirebaseAdminServiceAccount()).toThrow('Missing environment variable');
    });

    it('should throw FirebaseEnvError if ADMIN_FIREBASE is invalid JSON', () => {
      process.env.ADMIN_FIREBASE = 'not-valid-json';

      expect(() => getFirebaseAdminServiceAccount()).toThrow('Invalid JSON');
    });

    it('should throw FirebaseEnvError if required keys are missing', () => {
      process.env.ADMIN_FIREBASE = JSON.stringify({
        project_id: 'test-project',
        // Missing client_email and private_key
      });

      expect(() => getFirebaseAdminServiceAccount()).toThrow('missing required keys');
    });

    it('should accept extra fields from Google (forward compatibility)', () => {
      process.env.ADMIN_FIREBASE = JSON.stringify({
        type: 'service_account',
        project_id: 'test-project',
        private_key_id: 'key-id-123',
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
        client_email: 'firebase-adminsdk@test-project.iam.gserviceaccount.com',
        client_id: '123456789',
        extra_field_from_google: 'future-value',
      });

      const account = getFirebaseAdminServiceAccount();

      expect(account.project_id).toBe('test-project');
      expect(account).toHaveProperty('extra_field_from_google', 'future-value');
    });
  });
});

