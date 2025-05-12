import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useRecipes } from "../../contexts/RecipeContext";
import { Recipe } from "../../types";
import { Edit, Share, Clock, MoreVertical, Trash2 } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  showActions?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  showActions = true,
}) => {
  const { hasPermission, currentUser } = useAuth();
  const { deleteRecipe } = useRecipes();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // Ensure recipe has expected properties or provide defaults
  const safeRecipe = {
    ...recipe,
    // Use _id from API response or fall back to id, or provide default
    id: (recipe as any)._id || recipe.id || 'unknown-id',
    // Store MongoDB _id separately to ensure we're using the correct ID for operations
    _id: (recipe as any)._id,
    title: recipe.title || 'Untitled Recipe',
    description: recipe.description || 'No description available',
    servings: recipe.servings || 0,
    updatedAt: recipe.updatedAt || new Date().toISOString(),
    collaborators: Array.isArray(recipe.collaborators) ? recipe.collaborators : [],
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    owner: recipe.owner || { id: 'unknown', name: 'Unknown' } // Provide default owner if missing
  };

  // Add debug log to see what recipe data is being received
  console.log('Recipe data in card:', {
    _id: (recipe as any)._id,
    id: recipe.id,
    title: recipe.title
  });

  const isOwner = currentUser?.id && safeRecipe.owner?.id && currentUser.id === safeRecipe.owner.id;
  
  // Check if the current user is a collaborator
  const isCollaborator = currentUser?.id && Array.isArray(safeRecipe.collaborators) && 
    safeRecipe.collaborators.some(collab => 
      (collab.id === currentUser.id) || 
      ((collab as any).user && (collab as any).user === currentUser.id) ||
      (collab.email && collab.email.toLowerCase() === currentUser.email?.toLowerCase())
    );
  
  // Permission checks for actions
  const canEdit = isOwner || isCollaborator;
  const canShare = isOwner || isCollaborator; // Allow collaborators to share too
  const canDelete = isOwner; // Only owner can delete

  // Helper to safely access owner name
  const ownerName = safeRecipe.owner?.name || "Unknown";

  // Helper function to safely format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      try {
        // Use MongoDB _id preferentially when available
        const recipeIdToDelete = safeRecipe._id || safeRecipe.id;
        console.log("Deleting recipe with ID:", recipeIdToDelete);
        console.log("Recipe details:", {
          title: safeRecipe.title,
          _id: safeRecipe._id,
          id: safeRecipe.id
        });
        console.log("Owner check - Current user:", currentUser);
        console.log("Owner check - Recipe owner:", safeRecipe.owner);
        
        // Verify ownership before attempting to delete
        if (!isOwner) {
          alert("You do not have permission to delete this recipe. Only the owner can delete recipes.");
          return;
        }
        
        await deleteRecipe(recipeIdToDelete);
        // Success message
        alert("Recipe deleted successfully!");
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

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  // Handle card click to navigate to recipe detail
  const handleCardClick = () => {
    // Use _id (MongoDB) preferentially over id if available
    const recipeId = (recipe as any)._id || safeRecipe.id;
    console.log("Navigating to recipe with ID:", recipeId);
    navigate(`/recipes/${recipeId}`);
  };

  return (
    <div 
      className="block group cursor-pointer"
      data-testid={`recipe-card-${safeRecipe.id}`}
      onClick={handleCardClick}
    >
      <div className="recipe-card group hover:shadow-lg transition-shadow p-4 rounded-md bg-white border border-gray-200">
        {/* Header: Title and Collaborators */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{safeRecipe.title}</h3>

          {safeRecipe.collaborators.length > 0 && (
            <div className="flex -space-x-2">
              {safeRecipe.collaborators.slice(0, 3).map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center overflow-hidden text-xs"
                  title={collaborator.name}
                >
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
              ))}
              {safeRecipe.collaborators.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs">
                  +{safeRecipe.collaborators.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3">{safeRecipe.description}</p>

        {/* Meta info */}
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
          {safeRecipe.updatedAt && (
            <>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Updated {formatDate(safeRecipe.updatedAt)}
              </span>
              <span>•</span>
            </>
          )}
          <span>{safeRecipe.servings} servings</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {safeRecipe.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {safeRecipe.tags.length > 3 && (
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">
              +{safeRecipe.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer: Owner and Actions */}
        <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-200">
          <span className="text-xs font-medium text-gray-700">
            By {ownerName}
          </span>

          {/* Action Buttons */}
          <div
            className="flex gap-2 action-buttons"
            onClick={(e) => e.stopPropagation()}
          >
            {showActions && canEdit && (
              <button
                className="p-2 rounded hover:bg-gray-100 transition"
                title={isOwner ? "Edit recipe" : "Edit as collaborator"}
                onClick={(e) => {
                  e.stopPropagation();
                  const recipeId = (recipe as any)._id || safeRecipe.id;
                  navigate(`/recipes/${recipeId}/edit`);
                }}
              >
                <Edit size={16} className={isCollaborator && !isOwner ? "text-blue-500" : ""} />
              </button>
            )}
            {showActions && canShare && (
              <button
                className="p-2 rounded hover:bg-gray-100 transition"
                title={isOwner ? "Share recipe" : "Share as collaborator"}
                onClick={(e) => {
                  e.stopPropagation();
                  const recipeId = (recipe as any)._id || safeRecipe.id;
                  navigate(`/recipes/${recipeId}/share`);
                }}
              >
                <Share size={16} className={isCollaborator && !isOwner ? "text-blue-500" : ""} />
              </button>
            )}
            {showActions && canDelete && (
              <div className="relative">
                <button
                  className="p-2 rounded hover:bg-gray-100 transition"
                  title="More options"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                >
                  <MoreVertical size={16} />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 bottom-full mb-1 bg-white shadow-lg rounded-md border border-gray-200 py-1 z-10 w-32">
                    <button
                      className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
            {isCollaborator && !isOwner && (
              <span 
                className="text-xs text-blue-500 italic my-auto" 
                title="You are a collaborator on this recipe"
              >
                Collaborator
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
