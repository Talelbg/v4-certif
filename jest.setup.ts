import '@testing-library/jest-dom';

// Mock Firebase modules
jest.mock('./firebaseConfig', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn()
  },
  db: {},
  storage: {},
  analytics: null,
  signInWithEmail: jest.fn(),
  registerWithEmail: jest.fn(),
  signInWithProvider: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  updateUserProfile: jest.fn(),
  getCurrentUser: jest.fn()
}));

// Mock import.meta.env
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_FIREBASE_API_KEY: 'test-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        VITE_FIREBASE_PROJECT_ID: 'test-project',
        VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '123456',
        VITE_FIREBASE_APP_ID: 'test-app-id',
        VITE_FIREBASE_MEASUREMENT_ID: 'G-TEST'
      }
    }
  },
  writable: true
});
