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
    collaborators: Array.isArray(recipe.collaborators) ? recipe.collaborators : [],
    tags: Array.isArray(recipe.tags) ? recipe.tags : []
  };

  const isOwner = currentUser?.id === safeRecipe.owner?.id;
  const canEdit =
    hasPermission(safeRecipe, "edit_own") ||
    hasPermission(safeRecipe, "edit_if_invited");
  const canInvite = hasPermission(safeRecipe, "invite_collaborators");

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      try {
        await deleteRecipe(safeRecipe.id);
        // No need to navigate since the recipe will be removed from the list automatically
      } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe. Please try again.");
      }
    }
    
    setShowDropdown(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <Link to={`/recipes/${safeRecipe.id}`} className="block group">
      <div className="recipe-card group cursor-pointer hover:shadow-lg transition-shadow p-4 rounded-md bg-white border border-gray-200">
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
          <span className="flex items-center gap-1">
            <Clock size={14} />
            Updated {new Date(safeRecipe.updatedAt).toLocaleDateString()}
          </span>
          <span>•</span>
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
            By {safeRecipe.owner?.name || "Unknown"}
          </span>

          {/* Action Buttons */}
          <div
            className="flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {showActions && canEdit && (
              <Link
                to={`/recipes/${safeRecipe.id}/edit`}
                className="p-2 rounded hover:bg-gray-100 transition"
                title="Edit recipe"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit size={16} />
              </Link>
            )}
            {showActions && canInvite && (
              <Link
                to={`/recipes/${safeRecipe.id}/share`}
                className="p-2 rounded hover:bg-gray-100 transition"
                title="Share recipe"
                onClick={(e) => e.stopPropagation()}
              >
                <Share size={16} />
              </Link>
            )}
            {showActions && isOwner && (
              <div className="relative">
                <button
                  className="p-2 rounded hover:bg-gray-100 transition"
                  title="More options"
                  onClick={toggleDropdown}
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
          </div>
        </div>
      </div>
    </Link>
  );
};
