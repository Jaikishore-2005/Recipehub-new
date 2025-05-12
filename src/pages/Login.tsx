import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-recipe-mint/30 to-white p-4">
      <div className="w-full max-w-md">
        {/* Logo and Heading */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/logo.svg.svg" 
            alt="RecipeHub Logo" 
            className="h-16 w-16 mx-auto mb-4 rounded-full shadow-lg bg-primary p-2" 
          />
          <h1 className="text-3xl font-bold text-gray-800">Welcome to RecipeHub</h1>
          <p className="text-primary mt-2 font-medium">Where recipe meets collaboration</p>
          <p className="text-gray-600 mt-2">Log in to access your recipes and collaborate with others</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 transition-all">
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-center">
              <span className="flex-1">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:ring focus:ring-primary/20 focus:outline-none transition-all"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:ring focus:ring-primary/20 focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg flex items-center justify-center text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <LogIn className="mr-2 h-5 w-5" />
                    Log in
                  </span>
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
        
        {/* Demo credentials */}
        <div className="mt-6 text-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Demo credentials:
          </p>
          <div className="grid grid-cols-1 gap-1">
            <div className="bg-gray-50 rounded-md p-2">
              <p className="text-sm">
                <span className="text-gray-500">Email:</span> <span className="font-mono text-gray-800">demo@example.com</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-md p-2">
              <p className="text-sm">
                <span className="text-gray-500">Password:</span> <span className="font-mono text-gray-800">password123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
