import React from "react";
import { Link } from "react-router-dom";
import { useRecipes } from "../contexts/RecipeContext";
import { RecipeCard } from "../components/common/RecipeCard";
import { useAuth } from "../contexts/AuthContext";

const SharedWithMe = () => {
  const { sharedRecipes } = useRecipes();
  const { isAuthenticated, currentUser } = useAuth();
  
  // Only show recipes where the user is a collaborator
  const editableRecipes = sharedRecipes.filter(recipe =>
    recipe.collaborators.some(collab => collab.email === currentUser?.email)
  );

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">You need to log in</h1>
        <p className="text-muted-foreground mb-8">
          Please log in to view recipes shared with you
        </p>
        <Link to="/login" className="btn-recipe-primary">
          Log In
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Shared With Me</h1>
        <p className="text-muted-foreground">
          Recipes that others have invited you to collaborate on
        </p>
      </div>
      
      {editableRecipes.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No shared recipes yet</h2>
          <p className="text-muted-foreground">
            Recipes shared with you will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {editableRecipes.map((recipe) => (
            <div key={recipe.id} className="h-full flex">
              <RecipeCard key={recipe.id} recipe={recipe} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedWithMe;
