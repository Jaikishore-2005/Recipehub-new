import React, { createContext, useContext, useState } from "react";
import { Recipe, Ingredient, Step, Collaborator } from "../types";
import { useAuth } from "../contexts/AuthContext";

// Sample data for recipe demos
const mockRecipesData: Recipe[] = [
  {
    id: "1",
    title: "Garlic Butter Shrimp Pasta",
    description: "A delicious pasta dish with garlic butter shrimp",
    servings: 4,
    ingredients: [
      { id: "i1", name: "Spaghetti", quantity: 400, unit: "g" },
      { id: "i2", name: "Shrimp", quantity: 500, unit: "g" },
      { id: "i3", name: "Butter", quantity: 50, unit: "g" },
      { id: "i4", name: "Garlic", quantity: 4, unit: "cloves" },
      { id: "i5", name: "Parsley", quantity: 2, unit: "tbsp" }
    ],
    steps: [
      { id: "s1", description: "Boil pasta until al dente", timerMinutes: 8 },
      { id: "s2", description: "Melt butter in a pan and add minced garlic" },
      { id: "s3", description: "Add shrimp and cook until pink", timerMinutes: 5 },
      { id: "s4", description: "Combine pasta with shrimp and garlic butter" },
      { id: "s5", description: "Garnish with chopped parsley and serve" }
    ],
    tags: ["pasta", "seafood", "quick", "dinner"],
    isPublic: true,
    createdAt: "2023-05-10T12:00:00Z",
    updatedAt: "2023-05-10T14:30:00Z",
    owner: {
      id: "user-1",
      name: "Jamie Oliver"
    },
    collaborators: [
      {
        id: "user-2",
        name: "Gordon Ramsay",
        email: "gordon@example.com",
        role: "editor",
        avatar: "https://i.pravatar.cc/150?img=67"
      }
    ]
  },
  {
    id: "2",
    title: "Chocolate Chip Cookies",
    description: "Classic homemade chocolate chip cookies with a soft center and crispy edges",
    servings: 24,
    ingredients: [
      { id: "i1", name: "All-purpose flour", quantity: 280, unit: "g" },
      { id: "i2", name: "Butter", quantity: 225, unit: "g" },
      { id: "i3", name: "Brown sugar", quantity: 220, unit: "g" },
      { id: "i4", name: "White sugar", quantity: 100, unit: "g" },
      { id: "i5", name: "Eggs", quantity: 2, unit: "" },
      { id: "i6", name: "Vanilla extract", quantity: 1, unit: "tsp" },
      { id: "i7", name: "Baking soda", quantity: 1, unit: "tsp" },
      { id: "i8", name: "Salt", quantity: 0.5, unit: "tsp" },
      { id: "i9", name: "Chocolate chips", quantity: 350, unit: "g" },
    ],
    steps: [
      { id: "s1", description: "Preheat oven to 375°F (190°C)" },
      { id: "s2", description: "Cream together butter and sugars until light and fluffy" },
      { id: "s3", description: "Beat in eggs and vanilla" },
      { id: "s4", description: "Mix in dry ingredients, then fold in chocolate chips" },
      { id: "s5", description: "Drop tablespoon-sized balls onto ungreased baking sheets" },
      { id: "s6", description: "Bake until edges are golden", timerMinutes: 9 },
      { id: "s7", description: "Cool on baking sheet for 2 minutes", timerMinutes: 2 },
      { id: "s8", description: "Transfer to wire racks to cool completely" },
    ],
    tags: ["dessert", "cookies", "baking", "chocolate"],
    isPublic: true,
    createdAt: "2023-04-15T10:00:00Z",
    updatedAt: "2023-04-15T11:20:00Z",
    owner: {
      id: "user-3",
      name: "Nigella Lawson"
    },
    collaborators: []
  },
  {
    id: "3",
    title: "Avocado Toast",
    description: "Simple and nutritious breakfast option",
    servings: 2,
    ingredients: [
      { id: "i1", name: "Bread", quantity: 2, unit: "slices" },
      { id: "i2", name: "Avocado", quantity: 1, unit: "" },
      { id: "i3", name: "Salt", quantity: 0.25, unit: "tsp" },
      { id: "i4", name: "Pepper", quantity: 0.25, unit: "tsp" },
      { id: "i5", name: "Red pepper flakes", quantity: 0.25, unit: "tsp" },
    ],
    steps: [
      { id: "s1", description: "Toast bread until golden and crisp" },
      { id: "s2", description: "Cut avocado in half, remove pit, and scoop into a bowl" },
      { id: "s3", description: "Mash avocado with a fork and mix in salt and pepper" },
      { id: "s4", description: "Spread avocado mixture on toast" },
      { id: "s5", description: "Sprinkle with red pepper flakes" }
    ],
    tags: ["breakfast", "vegetarian", "quick", "healthy"],
    isPublic: true,
    createdAt: "2023-06-01T08:00:00Z",
    updatedAt: "2023-06-01T08:10:00Z",
    owner: {
      id: "user-1",
      name: "Jamie Oliver"
    },
    collaborators: []
  },
];

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
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipesData);
  
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
