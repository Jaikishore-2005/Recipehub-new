
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login page if user is not authenticated
    return <Navigate to="/login" replace />;
  }

  // If authenticated, show the protected content
  return <>{children}</>;
};
