import React, { createContext, useState, useContext, useEffect } from "react";
import { User, UserRole } from "../types";
import api from "../services/api";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (recipe: any, permission: string) => boolean;
}

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
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const savedUser = localStorage.getItem("recipehub_user");
      const token = localStorage.getItem("recipehub_token");
      
      if (savedUser && token) {
        setCurrentUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data && response.data.user && response.data.token) {
        const { user, token } = response.data;
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("recipehub_user", JSON.stringify(user));
        localStorage.setItem("recipehub_token", token);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };
  
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("recipehub_user");
    localStorage.removeItem("recipehub_token");
  };
  
  // Check permissions based on user role and recipe ownership
  const hasPermission = (recipe: any, permission: string) => {
    if (!currentUser) return false;
    if (!recipe) return false;
    
    // Not logged in users can only view public recipes
    if (!isAuthenticated && permission === "view_public") return true;
    
    // Permissions for logged-in users
    if (isAuthenticated) {
      // Anyone logged in can view public recipes
      if (permission === "view_public") return true;
      
      // Anyone logged in can create recipes
      if (permission === "create_recipe") return true;
      
      // Ensure recipe and owner properties exist before checking
      if (!recipe || !recipe.owner) return false;
      
      // Check if user is the recipe owner
      const isOwner = recipe.owner && currentUser.id && recipe.owner.id && recipe.owner.id === currentUser.id;
      
      // Check if user is a collaborator on this recipe
      const isCollaborator = 
        Array.isArray(recipe.collaborators) && 
        recipe.collaborators.some((collab: any) => collab && collab.id && collab.id === currentUser.id);
      
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
