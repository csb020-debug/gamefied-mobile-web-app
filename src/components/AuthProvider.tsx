import React from 'react';
import { AuthContext, useAuthState } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuthState();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/schools/register" replace />;
  }

  // If user is authenticated but no profile exists, don't redirect - let them complete registration
  if (!userProfile) {
    // Allow access to registration/signup pages
    if (location.pathname.includes('/register') || location.pathname.includes('/signup')) {
      return <>{children}</>;
    }
    // Otherwise redirect to landing page
    return <Navigate to="/" replace />;
  }

  // If we're on the home page and user has a profile, redirect based on role
  if (location.pathname === '/' && userProfile) {
    if (userProfile.role === 'school_admin') {
      return <Navigate to="/schools/admin-dashboard" replace />;
    } else if (userProfile.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    } else if (userProfile.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <>{children}</>;
};