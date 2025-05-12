import React, { createContext, useContext, useState, useEffect } from "react";
import { Recipe, Ingredient, Step, Collaborator } from "../types";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

// Initialize with empty array instead of mock data
const initialRecipes: Recipe[] = [];

interface RecipeContextType {
  recipes: Recipe[];
  userRecipes: Recipe[];
  sharedRecipes: Recipe[];
  publicRecipes: Recipe[];
  loadingRecipes: boolean;
  createRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => Promise<Recipe | void>;
  updateRecipe: (recipe: Recipe) => Promise<Recipe | void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  addCollaborator: (recipeId: string, collaborator: Omit<Collaborator, "id">) => Promise<void>;
  removeCollaborator: (recipeId: string, collaboratorId: string) => Promise<void>;
  fetchAllRecipes: () => Promise<void>;
}

const RecipeContext = createContext<RecipeContextType>({
  recipes: [],
  userRecipes: [],
  sharedRecipes: [],
  publicRecipes: [],
  loadingRecipes: false,
  createRecipe: async () => {},
  updateRecipe: async () => {},
  deleteRecipe: async () => {},
  getRecipeById: () => undefined,
  addCollaborator: async () => {},
  removeCollaborator: async () => {},
  fetchAllRecipes: async () => {},
});

export const useRecipes = () => useContext(RecipeContext);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  
  const { currentUser, isAuthenticated } = useAuth();
  
  // Fetch recipes when user authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllRecipes();
    } else {
      // Only load public recipes if not authenticated
      fetchPublicRecipes();
    }
  }, [isAuthenticated]);
  
  // Fetch all recipes from API
  const fetchAllRecipes = async () => {
    try {
      setLoadingRecipes(true);
      const response = await api.recipes.getAll();
      if (response.data) {
        setRecipes(Array.isArray(response.data) ? response.data as Recipe[] : []);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoadingRecipes(false);
    }
  };
  
  // Fetch only public recipes from API
  const fetchPublicRecipes = async () => {
    try {
      setLoadingRecipes(true);
      const response = await api.recipes.getPublic();
      if (response.data) {
        setRecipes(Array.isArray(response.data) ? response.data as Recipe[] : []);
      }
    } catch (error) {
      console.error("Error fetching public recipes:", error);
    } finally {
      setLoadingRecipes(false);
    }
  };
  
  // Get recipes created by the current user
  const userRecipes = Array.isArray(recipes) ? recipes.filter(
    recipe => currentUser && recipe.owner.id === currentUser.id
  ) : [];
  
  // Get recipes shared with the current user
  const sharedRecipes = Array.isArray(recipes) ? recipes.filter(
    recipe => 
      currentUser && 
      Array.isArray(recipe.collaborators) &&
      recipe.collaborators.some(collab => collab.id === currentUser.id)
  ) : [];
  
  // Get all public recipes
  const publicRecipes = Array.isArray(recipes) ? recipes.filter(recipe => recipe.isPublic) : [];
  
  const createRecipe = async (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => {
    if (!currentUser) return;
    
    try {
      const response = await api.recipes.create(recipe);
      
      if (response.data) {
        // If API call successful, update local state
        setRecipes(prev => Array.isArray(prev) ? [...prev, response.data as Recipe] : [response.data as Recipe]);
        return response.data as Recipe;
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  };
  
  const updateRecipe = async (updatedRecipe: Recipe) => {
    try {
      const response = await api.recipes.update(updatedRecipe.id, updatedRecipe);
      
      if (response.data) {
        // If API call successful, update local state
        setRecipes(prev => {
          if (!Array.isArray(prev)) return [response.data as Recipe];
          return prev.map(recipe => 
            recipe.id === updatedRecipe.id ? response.data as Recipe : recipe
          );
        });
        return response.data as Recipe;
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  };
  
  const deleteRecipe = async (id: string) => {
    try {
      const response = await api.recipes.delete(id);
      
      if (response.data || !response.error) {
        // If API call successful, update local state
        setRecipes(prev => {
          if (!Array.isArray(prev)) return [];
          return prev.filter(recipe => recipe.id !== id);
        });
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  };
  
  const getRecipeById = (id: string) => {
    if (!Array.isArray(recipes)) return undefined;
    return recipes.find(recipe => recipe.id === id);
  };
  
  const addCollaborator = async (recipeId: string, collaborator: Omit<Collaborator, "id">) => {
    try {
      // Assuming your API has an endpoint for adding collaborators
      const response = await api.recipes.update(recipeId, { 
        collaboratorToAdd: collaborator 
      });
      
      if (response.data) {
        // If API call successful, update local state
        setRecipes(prev => {
          if (!Array.isArray(prev)) return [response.data as Recipe];
          return prev.map(recipe => {
            if (recipe.id === recipeId) {
              return response.data as Recipe;
            }
            return recipe;
          });
        });
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
      throw error;
    }
  };
  
  const removeCollaborator = async (recipeId: string, collaboratorId: string) => {
    try {
      // Assuming your API has an endpoint for removing collaborators
      const response = await api.recipes.update(recipeId, { 
        collaboratorToRemove: collaboratorId 
      });
      
      if (response.data) {
        // If API call successful, update local state
        setRecipes(prev => {
          if (!Array.isArray(prev)) return [response.data as Recipe];
          return prev.map(recipe => {
            if (recipe.id === recipeId) {
              return response.data as Recipe;
            }
            return recipe;
          });
        });
      } else if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error removing collaborator:", error);
      throw error;
    }
  };
  
  const value = {
    recipes,
    userRecipes,
    sharedRecipes,
    publicRecipes,
    loadingRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipeById,
    addCollaborator,
    removeCollaborator,
    fetchAllRecipes,
  };
  
  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};
