import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  signInWithEmail, 
  registerWithEmail, 
  signInWithProvider, 
  signOut as firebaseSignOut,
  resetPassword,
  updateUserProfile 
} from '../firebaseConfig';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const clearError = () => {
    setError(null);
  };

  const handleAuthError = (err: unknown): never => {
    const errorMessage = err instanceof Error ? err.message : 'An authentication error occurred';
    setError(errorMessage);
    throw err;
  };

  const register = async (email: string, password: string): Promise<User> => {
    setError(null);
    
    // Input validation
    if (!email || !email.includes('@')) {
      const err = new Error('Please provide a valid email address');
      setError(err.message);
      throw err;
    }
    if (!password || password.length < 6) {
      const err = new Error('Password must be at least 6 characters');
      setError(err.message);
      throw err;
    }

    try {
      const user = await registerWithEmail(email, password);
      return user;
    } catch (err) {
      return handleAuthError(err);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    setError(null);
    
    // Input validation
    if (!email || !email.includes('@')) {
      const err = new Error('Please provide a valid email address');
      setError(err.message);
      throw err;
    }
    if (!password) {
      const err = new Error('Please provide a password');
      setError(err.message);
      throw err;
    }

    try {
      const user = await signInWithEmail(email, password);
      return user;
    } catch (err) {
      return handleAuthError(err);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    setError(null);
    try {
      const user = await signInWithProvider();
      return user;
    } catch (err) {
      return handleAuthError(err);
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    try {
      await firebaseSignOut();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    setError(null);
    
    // Input validation
    if (!email || !email.includes('@')) {
      const err = new Error('Please provide a valid email address');
      setError(err.message);
      throw err;
    }

    try {
      await resetPassword(email);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const updateProfile = async (data: { displayName?: string; photoURL?: string }): Promise<void> => {
    setError(null);
    
    if (!currentUser) {
      const err = new Error('No user is currently logged in');
      setError(err.message);
      throw err;
    }

    try {
      await updateUserProfile(currentUser, data);
      // Force refresh the user to get updated data
      // onAuthStateChanged will handle the state update automatically
      await currentUser.reload();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    sendPasswordReset,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
