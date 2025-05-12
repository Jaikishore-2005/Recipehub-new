import React, { createContext, useContext, useState } from "react";
import { Recipe, Ingredient, Step, Collaborator } from "../types";
import { useAuth } from "../contexts/AuthContext";

// Initialize with empty array instead of mock data
const initialRecipes: Recipe[] = [];

interface RecipeContextType {
  recipes: Recipe[];
  userRecipes: Recipe[];
  sharedRecipes: Recipe[];
  publicRecipes: Recipe[];
  createRecipe: (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  getRecipeById: (id: string) => Recipe | undefined;
  addCollaborator: (recipeId: string, collaborator: Omit<Collaborator, "id">) => void;
  removeCollaborator: (recipeId: string, collaboratorId: string) => void;
}

const RecipeContext = createContext<RecipeContextType>({
  recipes: [],
  userRecipes: [],
  sharedRecipes: [],
  publicRecipes: [],
  createRecipe: () => {},
  updateRecipe: () => {},
  deleteRecipe: () => {},
  getRecipeById: () => undefined,
  addCollaborator: () => {},
  removeCollaborator: () => {},
});

export const useRecipes = () => useContext(RecipeContext);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  
  const { currentUser } = useAuth();
  
  // Get recipes created by the current user
  const userRecipes = recipes.filter(
    recipe => currentUser && recipe.owner.id === currentUser.id
  );
  
  // Get recipes shared with the current user
  const sharedRecipes = recipes.filter(
    recipe => 
      currentUser && 
      recipe.collaborators.some(collab => collab.id === currentUser.id)
  );
  
  // Get all public recipes
  const publicRecipes = recipes.filter(recipe => recipe.isPublic);
  
  const createRecipe = (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) => {
    if (!currentUser) return;
    
    const newRecipe: Recipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: currentUser.id,
        name: currentUser.name
      },
      collaborators: []
    };
    
    setRecipes(prev => [...prev, newRecipe]);
  };
  
  const updateRecipe = (updatedRecipe: Recipe) => {
    setRecipes(prev => 
      prev.map(recipe => 
        recipe.id === updatedRecipe.id 
          ? { 
              ...updatedRecipe, 
              updatedAt: new Date().toISOString() 
            } 
          : recipe
      )
    );
  };
  
  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  };
  
  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };
  
  const addCollaborator = (recipeId: string, collaborator: Omit<Collaborator, "id">) => {
    setRecipes(prev => 
      prev.map(recipe => {
        if (recipe.id === recipeId) {
          return {
            ...recipe,
            collaborators: [
              ...recipe.collaborators,
              { ...collaborator, id: `user-${Date.now()}` }
            ]
          };
        }
        return recipe;
      })
    );
  };
  
  const removeCollaborator = (recipeId: string, collaboratorId: string) => {
    setRecipes(prev => 
      prev.map(recipe => {
        if (recipe.id === recipeId) {
          return {
            ...recipe,
            collaborators: recipe.collaborators.filter(c => c.id !== collaboratorId)
          };
        }
        return recipe;
      })
    );
  };
  
  const value = {
    recipes,
    userRecipes,
    sharedRecipes,
    publicRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipeById,
    addCollaborator,
    removeCollaborator,
  };
  
  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};
