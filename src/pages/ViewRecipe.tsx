import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRecipes } from "../contexts/RecipeContext";
import { useAuth } from "../contexts/AuthContext";
import { CookMode } from "../components/recipes/CookMode";
import { ArrowLeft, Edit, Share, Clock, Play, User, Users, Timer } from "lucide-react";
import { Recipe as RecipeType } from "../types";

const ViewRecipe = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { getRecipeById } = useRecipes();
  const { hasPermission, currentUser } = useAuth();
  
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [cookModeActive, setCookModeActive] = useState(false);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  
  useEffect(() => {
    if (recipeId) {
      const fetchedRecipe = getRecipeById(recipeId);
      
      if (fetchedRecipe) {
        setRecipe(fetchedRecipe);
      } else {
        // Recipe not found, redirect to home
        navigate("/");
      }
    }
  }, [recipeId, getRecipeById, navigate]);
  
  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Loading recipe...</h1>
      </div>
    );
  }
  
  // Permission logic
  const canEdit =
    recipe &&
    currentUser &&
    (hasPermission(recipe, "edit_own") || hasPermission(recipe, "edit_if_invited"));
  
  const canInvite = recipe && hasPermission(recipe, "invite_collaborators");
  const isOwner = recipe && currentUser && recipe.owner.id === currentUser.id;
  
  // Calculate scaled ingredients based on servings multiplier
  const scaledIngredients = recipe.ingredients.map((ing) => ({
    ...ing,
    quantity: ing.quantity * servingsMultiplier,
  }));
  
  return (
    <>
      {cookModeActive ? (
        <CookMode recipe={recipe} onClose={() => setCookModeActive(false)} />
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
              <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
              <p className="text-muted-foreground">{recipe.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              {canEdit && (
                <Link 
                  to={`/recipes/${recipe.id}/edit`}
                  className="btn-recipe-primary flex items-center gap-1"
                >
                  <Edit size={16} />
                  Edit
                </Link>
              )}
              
              {canInvite && (
                <Link 
                  to={`/recipes/${recipe.id}/share`}
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
                      <span className="px-3">{recipe.servings * servingsMultiplier}</span>
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
                      ? `Adjusted from ${recipe.servings} original servings`
                      : "Original serving size"}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <h3 className="font-medium">Updated</h3>
                  </div>
                  <p className="text-sm mt-1">
                    {new Date(recipe.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <h3 className="font-medium">Created by</h3>
                  </div>
                  <p className="text-sm mt-1">
                    {recipe.owner.name}
                  </p>
                </div>
              </div>
              
              {/* Tags */}
              <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
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
                  {recipe.steps.map((step, index) => (
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
                      to={`/recipes/${recipe.id}/share`}
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
                        {recipe.owner.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{recipe.owner.name}</p>
                        <p className="text-xs text-muted-foreground">Original Curator</p>
                      </div>
                    </div>
                    <span className="text-xs bg-recipe-mint px-2 py-1 rounded">
                      Owner
                    </span>
                  </div>
                  
                  {/* Collaborators */}
                  {recipe.collaborators.map((collaborator) => (
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
                  
                  {recipe.collaborators.length === 0 && isOwner && (
                    <p className="text-sm text-muted-foreground">
                      No collaborators yet. Invite others to collaborate on this recipe.
                    </p>
                  )}
                  
                  {recipe.collaborators.length === 0 && !isOwner && (
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
