import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecipes } from "../contexts/RecipeContext";
import { useAuth } from "../contexts/AuthContext";
import { RecipeForm } from "../components/recipes/RecipeForm";
import { CollaborationPanel } from "../components/recipes/CollaborationPanel";
import { ArrowLeft, Edit, MoreVertical } from "lucide-react";
import { Recipe } from "../types";
import { useIsMobile } from "../hooks/use-mobile";

const CreateEditRecipe = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { getRecipeById, createRecipe, updateRecipe, addCollaborator, removeCollaborator } = useRecipes();
  const { isAuthenticated, hasPermission, currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [collabMenuOpen, setCollabMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  
  // Check if editing or creating
  const isEditing = !!recipeId;
  
  useEffect(() => {
    if (isEditing && recipeId) {
      const fetchedRecipe = getRecipeById(recipeId);
      if (fetchedRecipe) {
        setRecipe(fetchedRecipe);

        // Defensive: check by owner id (since owner.email may be missing)
        const isOwner =
          fetchedRecipe.owner &&
          currentUser &&
          fetchedRecipe.owner.id === currentUser.id;

        const isCollaborator = fetchedRecipe.collaborators.some(
          (collab) => collab.email === currentUser?.email
        );
        const canEdit = isOwner || isCollaborator;

        // Debug logs
        console.log("Recipe owner object:", fetchedRecipe.owner);
        console.log("Current user:", currentUser);
        console.log("Is owner?", isOwner);
        console.log("Is collaborator?", isCollaborator);
        console.log("Can edit?", canEdit);

        if (!canEdit) {
          navigate(`/recipes/${fetchedRecipe.id}`);
          return;
        }
      } else {
        navigate("/");
      }
    }
  }, [recipeId, getRecipeById, navigate, isEditing, currentUser]);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">You need to log in</h1>
        <p className="text-muted-foreground mb-8">
          Please log in to create or edit recipes
        </p>
        <button 
          onClick={() => navigate("/login")}
          className="btn-recipe-primary"
        >
          Log In
        </button>
      </div>
    );
  }
  
  // Handle form submission
  const handleSubmit = (recipeData: Partial<Recipe>) => {
    if (isEditing && recipe) {
      updateRecipe({
        ...recipe,
        ...recipeData
      });
      navigate(`/recipes/${recipe.id}`);
    } else {
      createRecipe(recipeData as Omit<Recipe, "id" | "createdAt" | "updatedAt">);
      navigate("/my-recipes");
    }
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
  
  // Sync handler
  const handleSync = async () => {
    if (isEditing && recipeId) {
      setSyncing(true);
      const latest = getRecipeById(recipeId);
      if (latest) setRecipe(latest);
      setSyncing(false);
    }
  };
  
  return (
    <div>
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back
      </button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Recipe" : "Create Recipe"}
        </h1>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={handleSync}
              className="btn-recipe-primary flex items-center gap-1"
              disabled={syncing}
            >
              {syncing ? "Syncing..." : "Sync Changes"}
            </button>
          )}
          {isMobile && recipe && (
            <div className="relative">
              <button
                onClick={() => setCollabMenuOpen((v) => !v)}
                className="btn-recipe-primary flex items-center justify-center p-2"
                aria-label="Open collaboration menu"
              >
                <MoreVertical size={20} />
              </button>
              {collabMenuOpen && (
                <div className="absolute right-0 mt-2 z-50 bg-white border rounded shadow-lg w-80 max-w-[90vw]">
                  <CollaborationPanel
                    recipe={recipe}
                    onAddCollaborator={handleAddCollaborator}
                    onRemoveCollaborator={handleRemoveCollaborator}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecipeForm 
            initialRecipe={recipe || undefined}
            onSubmit={handleSubmit}
            isReadOnly={false}
          />
        </div>
        {/* Desktop: show collab panel, Mobile: in menu only */}
        {!isMobile && recipe && (
          <div>
            <CollaborationPanel 
              recipe={recipe}
              onAddCollaborator={handleAddCollaborator}
              onRemoveCollaborator={handleRemoveCollaborator}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEditRecipe;
