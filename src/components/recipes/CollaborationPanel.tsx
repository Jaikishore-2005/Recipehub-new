import React, { useState } from "react";
import { Recipe, Collaborator } from "../../types";
import { X, Plus, Check, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface CollaborationPanelProps {
  recipe: Recipe;
  onAddCollaborator: (collaborator: Omit<Collaborator, "id">) => Promise<any>;
  onRemoveCollaborator: (collaboratorId: string) => Promise<any>;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  recipe,
  onAddCollaborator,
  onRemoveCollaborator
}) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { currentUser } = useAuth();
  const isOwner = currentUser?.id === recipe.owner.id;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "") return;
    
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    
    try {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }
      
      // Check if user is trying to invite themselves
      if (currentUser && email.toLowerCase() === currentUser.email.toLowerCase()) {
        throw new Error("You can't invite yourself as a collaborator");
      }
      
      // Check if already a collaborator
      const isAlreadyCollaborator = recipe.collaborators.some(
        collab => collab.email && collab.email.toLowerCase() === email.toLowerCase()
      );
      
      if (isAlreadyCollaborator) {
        throw new Error("This person is already a collaborator");
      }
      
      await onAddCollaborator({
        name: email.split("@")[0], // Simple name generation from email
        email,
        role: "editor",
        avatar: undefined
      });
      
      // Show success message
      setSuccess(`Invitation sent to ${email}`);
      
      // Clear form
      setEmail("");
    } catch (err) {
      console.error("Error inviting collaborator:", err);
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      setSubmitting(true);
      await onRemoveCollaborator(collaboratorId);
      setSuccess("Collaborator removed successfully");
    } catch (err) {
      console.error("Error removing collaborator:", err);
      setError("Failed to remove collaborator");
    } finally {
      setSubmitting(false);
    }
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
                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                    className="p-1 hover:bg-muted-foreground/10 rounded"
                    disabled={submitting}
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
        
        {error && (
          <div className="p-2 text-sm bg-red-50 text-red-600 rounded border border-red-200">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-2 text-sm bg-green-50 text-green-600 rounded border border-green-200 flex items-center gap-1">
            <Check size={16} />
            {success}
          </div>
        )}
        
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
            disabled={submitting}
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full btn-recipe-primary flex items-center justify-center gap-1"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Plus size={16} />
              Add Collaborator
            </>
          )}
        </button>
      </form>
    </div>
  );
};
