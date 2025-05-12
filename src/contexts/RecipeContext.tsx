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
  addCollaborator: (recipeId: string, collaborator: Omit<Collaborator, "id">) => Promise<any>;
  removeCollaborator: (recipeId: string, collaboratorId: string) => Promise<any>;
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
      console.log("API Response for all recipes:", response);
      
      let recipesData: Recipe[] = [];
      
      if (response.data && typeof response.data === 'object' && 'recipes' in response.data && Array.isArray(response.data.recipes)) {
        // If response follows the pattern { recipes: Recipe[] }
        console.log("Setting recipes from recipes array:", response.data.recipes);
        recipesData = response.data.recipes as Recipe[];
      } else if (response.data && Array.isArray(response.data)) {
        // If response is directly an array of recipes
        console.log("Setting recipes from direct array:", response.data);
        recipesData = response.data as Recipe[];
      } else if (response.data) {
        // Handle other response structures
        console.log("Unknown response structure:", response.data);
        recipesData = [];
      }
      
      // Filter out invalid recipes (missing critical properties or marked as "Untitled Recipe")
      const validRecipes = recipesData.filter(recipe => {
        if (!recipe) return false;
        if (!recipe.id && !(recipe as any)._id) return false;
        if (recipe.title === "Untitled Recipe" && !recipe.description) return false;
        return true;
      });
      
      setRecipes(validRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };
  
  // Fetch only public recipes from API
  const fetchPublicRecipes = async () => {
    try {
      setLoadingRecipes(true);
      const response = await api.recipes.getPublic();
      console.log("API Response for public recipes:", response);
      
      let recipesData: Recipe[] = [];
      
      if (response.data && typeof response.data === 'object' && 'recipes' in response.data && Array.isArray(response.data.recipes)) {
        // If response follows the pattern { recipes: Recipe[] }
        console.log("Setting public recipes from recipes array:", response.data.recipes);
        recipesData = response.data.recipes as Recipe[];
      } else if (response.data && Array.isArray(response.data)) {
        // If response is directly an array of recipes
        console.log("Setting public recipes from direct array:", response.data);
        recipesData = response.data as Recipe[];
      } else if (response.data) {
        // Handle other response structures
        console.log("Unknown response structure:", response.data);
        recipesData = [];
      }
      
      // Filter out invalid recipes (missing critical properties or marked as "Untitled Recipe")
      const validRecipes = recipesData.filter(recipe => {
        if (!recipe) return false;
        if (!recipe.id && !(recipe as any)._id) return false;
        if (recipe.title === "Untitled Recipe" && !recipe.description) return false;
        return true;
      });
      
      setRecipes(validRecipes);
    } catch (error) {
      console.error("Error fetching public recipes:", error);
      setRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };
  
  // Get recipes created by the current user
  const userRecipes = Array.isArray(recipes) ? recipes.filter(
    recipe => currentUser && recipe.owner && recipe.owner.id === currentUser.id
  ) : [];
  
  // Get recipes shared with the current user
  const sharedRecipes = Array.isArray(recipes) ? recipes.filter(
    recipe => 
      currentUser && 
      (
        // Check collaborators array in recipe
        (Array.isArray(recipe.collaborators) &&
        recipe.collaborators.some(collab => 
          // Match by id or email
          (collab.id === currentUser.id) || 
          (collab.email && collab.email.toLowerCase() === currentUser.email.toLowerCase())
        ))
      )
  ) : [];
  
  // Get all public recipes
  const publicRecipes = Array.isArray(recipes) ? recipes.filter(recipe => recipe.isPublic) : [];
  
  const createRecipe = async (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => {
    if (!currentUser) return;
    
    try {
      const response = await api.recipes.create(recipe);
      
      if (response.data) {
        console.log("API response for create recipe:", response.data);
        const newRecipe = response.data as Recipe;
        
        // Ensure owner field is properly set if missing
        if (!newRecipe.owner && currentUser) {
          newRecipe.owner = {
            id: currentUser.id,
            name: currentUser.name || currentUser.id
          };
        }
        
        // If API call successful, update local state
        setRecipes(prev => Array.isArray(prev) ? [...prev, newRecipe] : [newRecipe]);
        return newRecipe;
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
      // Use MongoDB _id if available, otherwise use standard id
      const recipeId = (updatedRecipe as any)._id || updatedRecipe.id;
      console.log("Updating recipe with ID:", recipeId);
      console.log("Update recipe data:", updatedRecipe);
      
      // Ensure we have both id forms in the data we send
      const recipeDataToSend = {
        ...updatedRecipe,
        _id: (updatedRecipe as any)._id || updatedRecipe.id,
        id: updatedRecipe.id || (updatedRecipe as any)._id
      };
      
      const response = await api.recipes.update(recipeId, recipeDataToSend);
      
      if (response.data) {
        console.log("API response for update:", response.data);
        // If API call successful, update local state
        setRecipes(prev => {
          if (!Array.isArray(prev)) return [response.data as Recipe];
          return prev.map(recipe => {
            // Match by either id or _id
            if (recipe.id === updatedRecipe.id || 
               (recipe as any)._id === (updatedRecipe as any)._id ||
               recipe.id === recipeId || 
               (recipe as any)._id === recipeId) {
              return response.data as Recipe;
            }
            return recipe;
          });
        });
        return response.data as Recipe;
      } else if (response.error) {
        console.error("API error for update:", response.error);
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  };
  
  const deleteRecipe = async (id: string) => {
    try {
      console.log(`Attempting to delete recipe with ID: ${id}`);
      
      // Get the current recipe to check ownership
      let recipeToDelete = getRecipeById(id);
      
      // If not found by the provided id, try looking for it in the recipes list
      // This helps when we have mismatches between MongoDB _id and regular id
      if (!recipeToDelete && Array.isArray(recipes)) {
        // Look for a recipe that has this ID as either id or _id
        recipeToDelete = recipes.find(r => 
          r.id === id || (r as any)._id === id
        );
      }
      
      if (!recipeToDelete) {
        console.error("Cannot delete: Recipe not found in local state");
        throw new Error("Recipe not found");
      }
      
      console.log("Recipe to delete:", {
        id: recipeToDelete.id,
        _id: (recipeToDelete as any)._id,
        title: recipeToDelete.title
      });
      console.log("Current user:", currentUser ? {
        id: currentUser.id,
        name: currentUser.name
      } : null);
      
      // Check if owner information is properly set
      if (!recipeToDelete.owner || !recipeToDelete.owner.id) {
        console.error("Cannot delete: Recipe has no owner information");
        throw new Error("Recipe ownership information is missing");
      }
      
      // Check if current user is the owner
      if (currentUser && recipeToDelete.owner.id !== currentUser.id) {
        console.error("Error: Only the recipe owner can delete this recipe");
        throw new Error("Only the recipe owner can delete this recipe");
      }
      
      // Always use MongoDB _id for API operations when available
      const recipeId = (recipeToDelete as any)._id || recipeToDelete.id;
      console.log(`Using ID for deletion: ${recipeId}`);
      
      // Make the API call to delete
      const response = await api.recipes.delete(recipeId);
      console.log("Delete API response:", response);
      
      if (response.error) {
        console.error("API error when deleting recipe:", response.error, response.message);
        if (response.error === "Forbidden") {
          throw new Error("You do not have permission to delete this recipe. Only the owner can delete recipes.");
        } else {
          throw new Error(response.error);
        }
      }
      
      // If API call successful, update local state by filtering by all possible ID forms
      setRecipes(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.filter(recipe => {
          // Keep the recipe if neither of these match the deleted recipe's ID
          return recipe.id !== id && 
                 recipe.id !== recipeId && 
                 (recipe as any)._id !== id && 
                 (recipe as any)._id !== recipeId;
        });
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  };
  
  const getRecipeById = (id: string) => {
    if (!Array.isArray(recipes)) return undefined;
    
    // First try to find by standard id
    let recipe = recipes.find(recipe => recipe.id === id);
    
    // If not found, try to find by MongoDB _id
    if (!recipe) {
      recipe = recipes.find(recipe => (recipe as any)._id === id);
      if (recipe) {
        console.log("Found recipe by _id:", recipe);
      }
    }
    
    return recipe;
  };
  
  const addCollaborator = async (recipeId: string, collaborator: Omit<Collaborator, "id">) => {
    try {
      // Ensure email is properly set
      if (!collaborator.email) {
        console.error("Error inviting collaborator: Email is required");
        throw new Error("Email is required for collaboration invitation");
      }
      
      // Use the new collaborator API endpoint
      const response = await api.collaborators.invite(recipeId, collaborator);
      
      if (response.data) {
        console.log("Collaboration invitation sent:", response.data);
        
        // After successful invitation, refresh the recipe list to get the updated recipe
        await fetchAllRecipes();
        
        return response.data;
      } else if (response.error) {
        console.error("Error inviting collaborator:", response.error);
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
      throw error;
    }
  };
  
  const removeCollaborator = async (recipeId: string, collaboratorId: string) => {
    try {
      console.log(`Attempting to remove collaborator: Recipe ID ${recipeId}, Collaborator ID ${collaboratorId}`);
      
      // Find the recipe to make sure we're using the correct IDs
      const recipe = getRecipeById(recipeId);
      if (!recipe) {
        console.error(`Recipe with ID ${recipeId} not found`);
        throw new Error("Recipe not found");
      }
      
      // Log the collaborator we're trying to remove
      const collaborator = recipe.collaborators.find(c => c.id === collaboratorId);
      console.log("Collaborator to remove:", collaborator);
      
      // Use MongoDB _id for the recipe if available
      const mongoRecipeId = (recipe as any)._id || recipe.id;
      
      // Use the collaborator API endpoint
      const response = await api.collaborators.remove(mongoRecipeId, collaboratorId);
      console.log("Collaborator removal API response:", response);
      
      if (response.data) {
        console.log("Collaborator removed:", response.data);
        
        // After successful removal, refresh the recipe list
        await fetchAllRecipes();
        
        return response.data;
      } else if (response.error) {
        console.error("Error removing collaborator:", response.error);
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
