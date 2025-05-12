
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRecipes } from "../contexts/RecipeContext";
import { useAuth } from "../contexts/AuthContext";
import { CollaborationPanel } from "../components/recipes/CollaborationPanel";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Recipe as RecipeType } from "../types";

const ShareRecipe = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { getRecipeById, addCollaborator, removeCollaborator } = useRecipes();
  const { hasPermission } = useAuth();
  
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Generate share URL
  useEffect(() => {
    if (recipeId) {
      setShareUrl(`${window.location.origin}/recipes/${recipeId}`);
    }
  }, [recipeId]);
  
  // Fetch recipe data
  useEffect(() => {
    if (recipeId) {
      const fetchedRecipe = getRecipeById(recipeId);
      
      if (fetchedRecipe) {
        setRecipe(fetchedRecipe);
        
        // Check if user has permission to invite collaborators
        if (!hasPermission(fetchedRecipe, "invite_collaborators")) {
          // Redirect to recipe view
          navigate(`/recipes/${recipeId}`);
        }
      } else {
        // Recipe not found, redirect to home
        navigate("/");
      }
    }
  }, [recipeId, getRecipeById, hasPermission, navigate]);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleAddCollaborator = (collaborator: any) => {
    if (recipe) {
      addCollaborator(recipe.id, collaborator);
    }
  };
  
  const handleRemoveCollaborator = (collaboratorId: string) => {
    if (recipe) {
      removeCollaborator(recipe.id, collaboratorId);
    }
  };
  
  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Loading recipe...</h1>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          to={`/recipes/${recipe.id}`}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to recipe
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Share Recipe</h1>
        <p className="text-muted-foreground">
          Share "{recipe.title}" with others
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Share Link</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Anyone with the link can view this recipe{recipe.isPublic ? " since it's public" : ""}.
            </p>
            
            <div className="flex">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 rounded-l-md border border-input p-2 bg-muted/30"
              />
              <button
                onClick={handleCopyLink}
                className="btn-recipe-primary rounded-l-none flex items-center gap-1 px-4"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          
          {!recipe.isPublic && (
            <div className="bg-recipe-mint/20 rounded-lg p-4">
              <h3 className="font-medium mb-2">Make this recipe public?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Public recipes can be viewed by anyone, even if they don't have an account.
              </p>
              <Link
                to={`/recipes/${recipe.id}/edit`}
                className="btn-recipe-secondary text-center block"
              >
                Edit Privacy Settings
              </Link>
            </div>
          )}
        </div>
        
        <div>
          <CollaborationPanel
            recipe={recipe}
            onAddCollaborator={handleAddCollaborator}
            onRemoveCollaborator={handleRemoveCollaborator}
          />
        </div>
      </div>
    </div>
  );
};

export default ShareRecipe;
