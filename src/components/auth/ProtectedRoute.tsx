import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Temporarily bypass auth for debugging
  return <>{children}</>;

  // if (loading) {
  //   return (
  //     <div className="h-screen w-full bg-editor-background flex items-center justify-center">
  //       <div className="text-text-primary">Loading...</div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return <Navigate to="/auth" replace />;
  // }

  // return <>{children}</>;
};