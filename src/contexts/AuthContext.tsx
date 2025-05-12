
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, UserRole } from "../types";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (recipe: any, permission: string) => boolean;
}

const defaultUser: User = {
  id: "user-1",
  name: "Jamie Oliver",
  email: "jamie@example.com",
  role: "logged-in"
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Simulate checking if user is already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const savedUser = localStorage.getItem("recipehub_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const login = async (email: string, password: string) => {
    // In a real app, this would call an API
    // For demo, we'll simulate a successful login with the default user
    setCurrentUser(defaultUser);
    setIsAuthenticated(true);
    localStorage.setItem("recipehub_user", JSON.stringify(defaultUser));
  };
  
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("recipehub_user");
  };
  
  // Check permissions based on user role and recipe ownership
  const hasPermission = (recipe: any, permission: string) => {
    if (!currentUser) return false;
    
    // Not logged in users can only view public recipes
    if (!isAuthenticated && permission === "view_public") return true;
    
    // Permissions for logged-in users
    if (isAuthenticated) {
      // Anyone logged in can view public recipes
      if (permission === "view_public") return true;
      
      // Anyone logged in can create recipes
      if (permission === "create_recipe") return true;
      
      // Check if user is the recipe owner
      const isOwner = recipe && recipe.owner && recipe.owner.id === currentUser.id;
      
      // Check if user is a collaborator on this recipe
      const isCollaborator = recipe && 
        recipe.collaborators && 
        recipe.collaborators.some((collab: any) => collab.id === currentUser.id);
      
      // Owners can edit their own recipes and invite collaborators
      if (isOwner) {
        if (permission === "edit_own" || permission === "invite_collaborators") return true;
      }
      
      // Collaborators can edit recipes they're invited to
      if (isCollaborator && permission === "edit_if_invited") return true;
    }
    
    return false;
  };
  
  const value = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    hasPermission,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
