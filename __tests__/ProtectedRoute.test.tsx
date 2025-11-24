import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProtectedRoute', () => {
  const mockAuthContext = {
    currentUser: null,
    loading: false,
    error: null,
    register: jest.fn(),
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    sendPasswordReset: jest.fn(),
    updateProfile: jest.fn(),
    clearError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthContext);
  });

  it('should show loading state while checking auth', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      loading: true
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show fallback when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      currentUser: null,
      loading: false
    });

    render(
      <ProtectedRoute fallback={<div>Please login</div>}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Please login')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show protected content when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      currentUser: { email: 'test@example.com', uid: '123' } as any,
      loading: false
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should return null when no fallback and user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      currentUser: null,
      loading: false
    });

    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(container.firstChild).toBeNull();
  });
});
