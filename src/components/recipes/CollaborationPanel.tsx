import React, { useState } from "react";
import { Recipe, Collaborator } from "../../types";
import { X, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface CollaborationPanelProps {
  recipe: Recipe;
  onAddCollaborator: (collaborator: Omit<Collaborator, "id">) => void;
  onRemoveCollaborator: (collaboratorId: string) => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  recipe,
  onAddCollaborator,
  onRemoveCollaborator
}) => {
  const [email, setEmail] = useState("");
  
  const { currentUser } = useAuth();
  const isOwner = currentUser?.id === recipe.owner.id;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "") return;
    
    onAddCollaborator({
      name: email.split("@")[0], // Simple name generation from email
      email,
      avatar: undefined
    });
    
    // Clear form
    setEmail("");
  };
  
  if (!isOwner) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg border border-border p-4">
      <h2 className="text-lg font-semibold mb-4">Collaboration</h2>
      
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Recipe Owner</h3>
        <div className="flex items-center gap-2 p-2 bg-recipe-mint/20 rounded">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            {recipe.owner.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{recipe.owner.name}</p>
            <p className="text-xs text-muted-foreground">Original Curator</p>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Collaborators ({recipe.collaborators.length})</h3>
        {recipe.collaborators.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collaborators yet</p>
        ) : (
          <div className="space-y-2">
            {recipe.collaborators.map((collaborator) => (
              <div 
                key={collaborator.id}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
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
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onRemoveCollaborator(collaborator.id)}
                    className="p-1 hover:bg-muted-foreground/10 rounded"
                  >
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <h3 className="text-sm font-medium">Invite Collaborator</h3>
        
        <div>
          <label htmlFor="email" className="block text-xs text-muted-foreground mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-input p-2 text-sm"
            placeholder="collaborator@example.com"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full btn-recipe-primary flex items-center justify-center gap-1"
        >
          <Plus size={16} />
          Add Collaborator
        </button>
      </form>
    </div>
  );
};
