const { Collaborator } = require('../models/CollaboratorModel');
const Recipe = require('../models/RecipeModel');
const User = require('../models/UserModel');

/**
 * Invite a new collaborator to a recipe
 */
exports.inviteCollaborator = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { email, name, role = 'editor' } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Collaborator email is required' 
      });
    }
    
    // Find the recipe
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Recipe not found' 
      });
    }
    
    // Get owner info from recipe
    const ownerId = recipe.owner.id;
    
    // Check if a user with this email exists
    let user = await User.findOne({ email });
    let userId = user ? user._id : null;
    
    // Create a new collaborator entry
    const newCollaborator = await Collaborator.create({
      recipeId,
      ownerId,
      userId: userId || ownerId, // Temp assignment to owner if no user found yet
      email,
      name: name || email.split('@')[0], // Use provided name or generate from email
      role,
      status: 'pending'
    });
    
    console.log(`Invitation sent to ${email} for recipe ${recipeId}`);
    
    // If user exists, also add to recipe.collaborators for backward compatibility
    if (user) {
      // Check if already a collaborator
      const existingCollaborator = recipe.collaborators.find(
        collab => collab.email === email
      );
      
      if (!existingCollaborator) {
        recipe.collaborators.push({
          user: userId,
          email,
          name: name || user.name || email.split('@')[0],
          role
        });
        
        await recipe.save();
      }
    }
    
    res.status(201).json({
      message: 'Collaboration invitation sent successfully',
      collaborator: newCollaborator
    });
  } catch (error) {
    console.error('Invite collaborator error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to invite collaborator' 
    });
  }
};

/**
 * Get all collaborators for a recipe
 */
exports.getCollaborators = async (req, res) => {
  try {
    const recipeId = req.params.id;
    
    // Find all collaborators for this recipe
    const collaborators = await Collaborator.find({ recipeId });
    
    res.json({
      collaborators
    });
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to get collaborators' 
    });
  }
};

/**
 * Accept a collaboration invitation
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const invitationId = req.params.id;
    const userId = req.user.id;
    
    // Find and update the invitation
    const invitation = await Collaborator.findById(invitationId);
    
    if (!invitation) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Invitation not found' 
      });
    }
    
    // Verify this invitation is for the current user
    if (invitation.email !== req.user.email) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'This invitation is not for you' 
      });
    }
    
    // Update invitation status
    invitation.status = 'accepted';
    invitation.userId = userId;
    await invitation.save();
    
    // Update the recipe's collaborators array
    const recipe = await Recipe.findById(invitation.recipeId);
    if (recipe) {
      // Check if already in array
      const existingIndex = recipe.collaborators.findIndex(
        collab => collab.email === req.user.email
      );
      
      if (existingIndex >= 0) {
        // Update existing entry
        recipe.collaborators[existingIndex].user = userId;
      } else {
        // Add new entry
        recipe.collaborators.push({
          user: userId,
          email: req.user.email,
          name: req.user.name,
          role: invitation.role
        });
      }
      
      await recipe.save();
    }
    
    res.json({
      message: 'Invitation accepted successfully',
      invitation
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to accept invitation' 
    });
  }
};

/**
 * Reject a collaboration invitation
 */
exports.rejectInvitation = async (req, res) => {
  try {
    const invitationId = req.params.id;
    
    // Find and update the invitation
    const invitation = await Collaborator.findById(invitationId);
    
    if (!invitation) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Invitation not found' 
      });
    }
    
    // Verify this invitation is for the current user
    if (invitation.email !== req.user.email) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'This invitation is not for you' 
      });
    }
    
    // Update invitation status
    invitation.status = 'rejected';
    await invitation.save();
    
    res.json({
      message: 'Invitation rejected successfully',
      invitation
    });
  } catch (error) {
    console.error('Reject invitation error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to reject invitation' 
    });
  }
};

/**
 * Remove a collaborator
 */
exports.removeCollaborator = async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const collaboratorId = req.params.collaboratorId;
    
    // Delete from Collaborator collection
    await Collaborator.findByIdAndDelete(collaboratorId);
    
    // Also remove from Recipe.collaborators array
    const recipe = await Recipe.findById(recipeId);
    if (recipe) {
      // Find by collaborator document ID if possible
      recipe.collaborators = recipe.collaborators.filter(
        collab => collab._id.toString() !== collaboratorId
      );
      
      await recipe.save();
    }
    
    res.json({
      message: 'Collaborator removed successfully'
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to remove collaborator' 
    });
  }
};

/**
 * Get all invitations for the current user
 */
exports.getMyInvitations = async (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;
    
    // Find all invitations for this user by email
    const invitations = await Collaborator.find({ 
      email,
      status: 'pending'
    }).populate('recipeId', 'title');
    
    res.json({
      invitations
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to get invitations' 
    });
  }
}; 