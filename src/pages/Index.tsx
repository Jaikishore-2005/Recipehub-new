
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// This page redirects based on authentication status
const Index = () => {
  const { isAuthenticated } = useAuth();
  
  // If user is authenticated, go to home page
  // If not authenticated, go to login page
  return <Navigate to={isAuthenticated ? "/" : "/login"} replace />;
};

export default Index;
