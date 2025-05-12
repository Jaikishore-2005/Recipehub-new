const mongoose = require('mongoose');

/**
 * Collaborator model - stores recipe collaboration relationships
 */
const collaboratorSchema = new mongoose.Schema(
  {
    // Reference to the recipe
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    },
    
    // Owner of the recipe
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // User invited as collaborator
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // User's email
    email: {
      type: String,
      required: true
    },
    
    // User's name
    name: {
      type: String,
      required: true
    },
    
    // Role of the collaborator (editor, viewer, etc.)
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'editor'
    },
    
    // Status of the invitation
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    
    // Optional avatar URL
    avatar: String,
    
    // When the invitation was sent
    invitedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'collaborators'
  }
);

// Add indexes for faster queries
collaboratorSchema.index({ recipeId: 1 });
collaboratorSchema.index({ ownerId: 1 });
collaboratorSchema.index({ userId: 1 });
collaboratorSchema.index({ email: 1 });
collaboratorSchema.index({ status: 1 });

const Collaborator = mongoose.model('Collaborator', collaboratorSchema, 'collaborators');

console.log('Collaborator model created with collaborators collection');

module.exports = { Collaborator }; 