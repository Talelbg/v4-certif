import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn()
}));

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { currentUser, loading, error, login, logout, register, clearError } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{currentUser ? currentUser.email : 'no user'}</div>
      <div data-testid="error">{error || 'no error'}</div>
      <button onClick={() => login('test@test.com', 'password123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => register('new@test.com', 'password123')}>Register</button>
      <button onClick={() => clearError()}>Clear Error</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial loading state', async () => {
    // Mock onAuthStateChanged to simulate loading
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      // Don't call callback yet to keep loading state
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('should update state when auth state changes to logged in', async () => {
    const mockUser = { email: 'test@example.com', uid: '123' };
    
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      // Simulate auth state change
      setTimeout(() => callback(mockUser), 0);
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('should update state when auth state changes to logged out', async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      // Simulate logged out state
      setTimeout(() => callback(null), 0);
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no user');
    });
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should unsubscribe from auth state changes on unmount', () => {
    const unsubscribeMock = jest.fn();
    (onAuthStateChanged as jest.Mock).mockReturnValue(unsubscribeMock);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
