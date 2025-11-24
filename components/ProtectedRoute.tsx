import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute component that wraps content requiring authentication
 * Shows loading state while checking auth, redirects to fallback if not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#141319] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2a00ff] animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show fallback (login page) or null
  if (!currentUser) {
    return fallback ? <>{fallback}</> : null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
