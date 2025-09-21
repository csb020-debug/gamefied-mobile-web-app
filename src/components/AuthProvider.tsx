import React from 'react';
import { AuthContext, useAuthState } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

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

  // Redirect based on user role
  if (userProfile) {
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