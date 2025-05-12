
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../contexts/RecipeContext";
import { RecipeCard } from "../components/common/RecipeCard";
import { Book, BookOpen, Plus } from "lucide-react";

const Home = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { recipes, userRecipes, sharedRecipes } = useRecipes();
  
  // Get the most recently updated recipes
  const recentRecipes = [...recipes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);
  
  return (
    <div>
      {/* Hero section with logo */}
      <div className="mb-8 text-center">
        {!isAuthenticated && (
          <div className="flex flex-col items-center mb-6">
            <img 
              src="/lovable-uploads/3254d9db-868b-4134-9d0a-f642494baf9b.png" 
              alt="RecipeHub Logo" 
              className="h-24 w-auto mb-4" 
            />
            <h1 className="text-4xl font-bold text-primary mb-2">RecipeHub</h1>
            <p className="text-xl text-muted-foreground">Where Recipe Meets Collaboration</p>
          </div>
        )}
        
        <h2 className="text-3xl font-bold">
          {isAuthenticated 
            ? `Welcome back, ${currentUser?.name}!` 
            : "Welcome to RecipeHub!"}
        </h2>
        <p className="text-muted-foreground">
          {isAuthenticated
            ? "Continue collaborating on your recipes."
            : "Create, share, and collaborate on recipes with friends."}
        </p>
      </div>
      
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link 
          to={isAuthenticated ? "/create-recipe" : "/login"} 
          className="bg-recipe-mint rounded-lg p-6 flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Plus size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Create Recipe</h3>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated ? "Start a new culinary creation" : "Login to create recipes"}
            </p>
          </div>
        </Link>
        
        <Link 
          to="/public-recipes" 
          className="bg-recipe-orange rounded-lg p-6 flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-full bg-secondary-foreground text-secondary flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Browse Public Recipes</h3>
            <p className="text-sm text-muted-foreground">
              Discover recipes shared by others
            </p>
          </div>
        </Link>
        
        {isAuthenticated ? (
          <Link 
            to="/my-recipes" 
            className="bg-recipe-cream rounded-lg p-6 flex items-center gap-3 transition-transform hover:scale-[1.02]"
          >
            <div className="w-10 h-10 rounded-full bg-accent-foreground text-accent flex items-center justify-center">
              <Book size={20} />
            </div>
            <div>
              <h3 className="font-semibold">My Recipes</h3>
              <p className="text-sm text-muted-foreground">
                Manage your recipe collection
              </p>
            </div>
          </Link>
        ) : (
          <Link 
            to="/login" 
            className="bg-recipe-cream rounded-lg p-6 flex items-center gap-3 transition-transform hover:scale-[1.02]"
          >
            <div className="w-10 h-10 rounded-full bg-accent-foreground text-accent flex items-center justify-center">
              <Book size={20} />
            </div>
            <div>
              <h3 className="font-semibold">Sign In</h3>
              <p className="text-sm text-muted-foreground">
                Access your recipes and collaborate
              </p>
            </div>
          </Link>
        )}
      </div>
      
      {/* Recent recipes section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recently Updated Recipes</h2>
          <Link to="/public-recipes" className="text-primary hover:underline text-sm">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} showActions={false} />
          ))}
        </div>
        
        {recentRecipes.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No recipes available yet.</p>
          </div>
        )}
      </div>
      
      {/* User's content (if logged in) */}
      {isAuthenticated && (
        <>
          {/* User recipes section */}
          {userRecipes.length > 0 && (
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Recipes</h2>
                <Link to="/my-recipes" className="text-primary hover:underline text-sm">
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {userRecipes.slice(0, 4).map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </div>
          )}
          
          {/* Shared with me section */}
          {sharedRecipes.length > 0 && (
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Shared With You</h2>
                <Link to="/shared-with-me" className="text-primary hover:underline text-sm">
                  View All
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sharedRecipes.slice(0, 4).map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
