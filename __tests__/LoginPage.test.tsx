import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../components/LoginPage';
import { useAuth } from '../contexts/AuthContext';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginPage', () => {
  const mockLogin = jest.fn();
  const mockRegister = jest.fn();
  const mockLoginWithGoogle = jest.fn();
  const mockSendPasswordReset = jest.fn();
  const mockClearError = jest.fn();
  const mockOnLoginSuccess = jest.fn();

  const mockAuthContext = {
    currentUser: null,
    loading: false,
    error: null,
    register: mockRegister,
    login: mockLogin,
    loginWithGoogle: mockLoginWithGoogle,
    logout: jest.fn(),
    sendPasswordReset: mockSendPasswordReset,
    updateProfile: jest.fn(),
    clearError: mockClearError
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthContext);
  });

  it('should render login form by default', () => {
    render(<LoginPage />);

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('should switch to register mode when clicking sign up', async () => {
    render(<LoginPage />);

    const signUpButton = screen.getByText('Sign up');
    await userEvent.click(signUpButton);

    expect(screen.getByText('Create a new account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('should switch to reset mode when clicking forgot password', async () => {
    render(<LoginPage />);

    const forgotButton = screen.getByText('Forgot password?');
    await userEvent.click(forgotButton);

    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Email' })).toBeInTheDocument();
  });

  it('should call login with email and password on submit', async () => {
    mockLogin.mockResolvedValue({ email: 'test@example.com' });
    
    render(<LoginPage onLoginSuccess={mockOnLoginSuccess} />);

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123');
    
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should call loginWithGoogle when clicking Google button', async () => {
    mockLoginWithGoogle.mockResolvedValue({ email: 'test@gmail.com' });
    
    render(<LoginPage onLoginSuccess={mockOnLoginSuccess} />);

    await userEvent.click(screen.getByRole('button', { name: 'Google' }));

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
    });
  });

  it('should display error message when login fails', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      error: 'Invalid credentials'
    });

    render(<LoginPage />);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the toggle button (eye icon)
    const toggleButtons = screen.getAllByRole('button');
    const toggleButton = toggleButtons.find(btn => btn.querySelector('svg'));
    
    if (toggleButton) {
      await userEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
