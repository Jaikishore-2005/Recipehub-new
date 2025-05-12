
import React from "react";
import { Link } from "react-router-dom";
import { useRecipes } from "../contexts/RecipeContext";
import { RecipeCard } from "../components/common/RecipeCard";
import { Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const MyRecipes = () => {
  const { userRecipes } = useRecipes();
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">You need to log in</h1>
        <p className="text-muted-foreground mb-8">
          Please log in to view your recipes
        </p>
        <Link to="/login" className="btn-recipe-primary">
          Log In
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Recipes</h1>
        <Link 
          to="/create-recipe"
          className="btn-recipe-primary flex items-center gap-1"
        >
          <Plus size={18} />
          Create Recipe
        </Link>
      </div>
      
      {userRecipes.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No recipes yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first recipe to get started
          </p>
          <Link 
            to="/create-recipe"
            className="btn-recipe-primary inline-flex items-center gap-1"
          >
            <Plus size={18} />
            Create Recipe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {userRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecipes;
