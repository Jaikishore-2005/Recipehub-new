import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRecipes } from "../contexts/RecipeContext";
import { useAuth } from "../contexts/AuthContext";
import { CookMode } from "../components/recipes/CookMode";
import { ArrowLeft, Edit, Share, Clock, Play, User, Users, Timer, MoreVertical, Trash2 } from "lucide-react";
import { Recipe as RecipeType } from "../types";

const ViewRecipe = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { getRecipeById, deleteRecipe } = useRecipes();
  const { hasPermission, currentUser } = useAuth();
  
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [cookModeActive, setCookModeActive] = useState(false);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (recipeId) {
      try {
        setLoading(true);
        const fetchedRecipe = getRecipeById(recipeId);
        console.log("Fetched recipe:", fetchedRecipe);
        
        if (fetchedRecipe) {
          setRecipe(fetchedRecipe);
          setError(null);
        } else {
          console.error("Recipe not found:", recipeId);
          setError("Recipe not found");
          // Don't navigate away immediately, show error first
        }
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    }
  }, [recipeId, getRecipeById]);
  
  // Handle navigation back if recipe not found
  useEffect(() => {
    if (!loading && error) {
      const timer = setTimeout(() => {
        navigate("/my-recipes");
      }, 3000); // Navigate after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [loading, error, navigate]);
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Loading recipe...</h1>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Error: {error}</h1>
        <p className="mb-4">Redirecting to your recipes...</p>
        <button 
          onClick={() => navigate("/my-recipes")}
          className="btn-recipe-primary"
        >
          Go to My Recipes
        </button>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Recipe not found</h1>
        <button 
          onClick={() => navigate("/my-recipes")}
          className="btn-recipe-primary"
        >
          Go to My Recipes
        </button>
      </div>
    );
  }
  
  // Ensure recipe has valid arrays
  const safeRecipe = {
    ...recipe,
    title: recipe.title || 'Untitled Recipe',
    description: recipe.description || 'No description available',
    servings: recipe.servings || 0,
    updatedAt: recipe.updatedAt || new Date().toISOString(),
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    collaborators: Array.isArray(recipe.collaborators) ? recipe.collaborators : [],
    owner: recipe.owner || { id: 'unknown', name: 'Unknown' }
  };
  
  // Permission logic
  const canEdit =
    safeRecipe &&
    currentUser &&
    (hasPermission(safeRecipe, "edit_own") || hasPermission(safeRecipe, "edit_if_invited"));
  
  const canInvite = safeRecipe && hasPermission(safeRecipe, "invite_collaborators");
  const isOwner = safeRecipe && currentUser && safeRecipe.owner && safeRecipe.owner.id === currentUser.id;

  // Helper function to safely format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }
  };

  // Handle delete recipe
  const handleDeleteRecipe = async () => {
    if (window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      try {
        console.log("Deleting recipe:", safeRecipe.id);
        console.log("Owner check - Current user:", currentUser);
        console.log("Owner check - Recipe owner:", safeRecipe.owner);
        
        // Verify ownership before attempting to delete
        if (!isOwner) {
          alert("You do not have permission to delete this recipe. Only the owner can delete recipes.");
          return;
        }
        
        await deleteRecipe(safeRecipe.id);
        // Success message
        alert("Recipe deleted successfully!");
        navigate("/my-recipes");
      } catch (error) {
        console.error("Error deleting recipe:", error);
        if (error instanceof Error && error.message.includes("ownership")) {
          alert("Failed to delete recipe: Ownership verification failed. You may not be the owner of this recipe.");
        } else {
          alert(`Failed to delete recipe: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    }
    
    setShowDropdown(false);
  };
  
  // Calculate scaled ingredients based on servings multiplier
  const scaledIngredients = safeRecipe.ingredients.map((ing) => ({
    ...ing,
    quantity: ing.quantity * servingsMultiplier,
  }));
  
  return (
    <>
      {cookModeActive ? (
        <CookMode recipe={safeRecipe} onClose={() => setCookModeActive(false)} />
      ) : (
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
          
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{safeRecipe.title}</h1>
              <p className="text-muted-foreground">{safeRecipe.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              {canEdit && (
                <Link 
                  to={`/recipes/${safeRecipe.id}/edit`}
                  className="btn-recipe-primary flex items-center gap-1"
                >
                  <Edit size={16} />
                  Edit
                </Link>
              )}
              
              {canInvite && (
                <Link 
                  to={`/recipes/${safeRecipe.id}/share`}
                  className="btn-recipe-secondary flex items-center gap-1"
                >
                  <Share size={16} />
                  Share
                </Link>
              )}
              
              <button 
                onClick={() => setCookModeActive(true)}
                className="btn-recipe-primary flex items-center gap-1"
              >
                <Play size={16} />
                Cook Mode
              </button>

              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="btn-recipe-secondary flex items-center gap-1 p-2"
                    title="More options"
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-1 z-50 bg-white rounded-md shadow-lg border border-border w-40">
                      <button
                        onClick={handleDeleteRecipe}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-muted/50 text-left text-sm"
                      >
                        <Trash2 size={16} />
                        Delete Recipe
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Details section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Recipe info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">Servings</h3>
                    <div className="flex items-center border rounded-md">
                      <button 
                        onClick={() => setServingsMultiplier(prev => Math.max(0.25, prev - 0.25))}
                        className="px-2 py-1 hover:bg-muted/50"
                      >
                        -
                      </button>
                      <span className="px-3">{safeRecipe.servings * servingsMultiplier}</span>
                      <button 
                        onClick={() => setServingsMultiplier(prev => prev + 0.25)}
                        className="px-2 py-1 hover:bg-muted/50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {servingsMultiplier !== 1 
                      ? `Adjusted from ${safeRecipe.servings} original servings`
                      : "Original serving size"}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <h3 className="font-medium">Updated</h3>
                  </div>
                  <p className="text-sm mt-1">
                    {formatDate(safeRecipe.updatedAt)}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <h3 className="font-medium">Created by</h3>
                  </div>
                  <p className="text-sm mt-1">
                    {safeRecipe.owner.name}
                  </p>
                </div>
              </div>
              
              {/* Tags */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                  {safeRecipe.tags.map((tag) => (
                    <span key={tag} className="recipe-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Ingredients */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
                <div className="bg-white rounded-lg shadow-sm border border-border p-4">
                  <ul className="space-y-3">
                    {scaledIngredients.map((ingredient) => (
                      <li key={ingredient.id} className="flex items-center">
                        <span className="w-16 text-right mr-4 font-medium">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                        <span>{ingredient.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Steps */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Steps</h2>
                <div className="space-y-5">
                  {safeRecipe.steps.map((step, index) => (
                    <div key={step.id} className="bg-white rounded-lg shadow-sm border border-border p-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p>{step.description}</p>
                          {step.timerMinutes && (
                            <div className="flex items-center gap-1 text-sm text-primary mt-2">
                              <Timer size={14} />
                              <span>{step.timerMinutes} min timer</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              {/* Collaborators section */}
              <div className="bg-white rounded-lg shadow-sm border border-border p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <h3 className="font-medium">Collaborators</h3>
                  </div>
                  {canInvite && (
                    <Link 
                      to={`/recipes/${safeRecipe.id}/share`}
                      className="text-sm text-primary hover:underline"
                    >
                      Invite
                    </Link>
                  )}
                </div>
                
                <div className="space-y-3">
                  {/* Owner */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        {safeRecipe.owner.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{safeRecipe.owner.name}</p>
                        <p className="text-xs text-muted-foreground">Original Curator</p>
                      </div>
                    </div>
                    <span className="text-xs bg-recipe-mint px-2 py-1 rounded">
                      Owner
                    </span>
                  </div>
                  
                  {/* Collaborators */}
                  {safeRecipe.collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {collaborator.avatar ? (
                            <img 
                              src={collaborator.avatar} 
                              alt={collaborator.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            collaborator.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{collaborator.name}</p>
                          <p className="text-xs text-muted-foreground">{collaborator.email}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-recipe-mint px-2 py-1 rounded">
                        {collaborator.role === "owner" ? "Co-owner" : "Editor"}
                      </span>
                    </div>
                  ))}
                  
                  {safeRecipe.collaborators.length === 0 && isOwner && (
                    <p className="text-sm text-muted-foreground">
                      No collaborators yet. Invite others to collaborate on this recipe.
                    </p>
                  )}
                  
                  {safeRecipe.collaborators.length === 0 && !isOwner && (
                    <p className="text-sm text-muted-foreground">
                      No additional collaborators.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewRecipe;
