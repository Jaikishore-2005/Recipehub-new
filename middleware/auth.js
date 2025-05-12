const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

// Secret key for JWT (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'recipe_hub_dev_secret_key';

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token from the Authorization header
 */
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication required' 
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Authentication token missing' 
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'User not found' 
        });
      }
      
      // Add user to request
      req.user = user;
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Token expired' 
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Invalid token' 
        });
      }
      
      throw jwtError;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: 'Authentication failed' 
    });
  }
};

/**
 * Check if user is recipe owner or collaborator
 * Requires the protect middleware to run first
 */
exports.checkRecipePermission = (req, res, next) => {
  try {
    const { Recipe } = require('../models/RecipeModel');
    const recipe = Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Recipe not found' 
      });
    }
    
    const userId = req.user.id;
    
    // Check if user is owner
    const isOwner = recipe.owner.id === userId;
    
    // Check if user is collaborator
    const isCollaborator = recipe.collaborators.some(c => c.id === userId);
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You do not have permission to access this recipe' 
      });
    }
    
    // Add recipe and permission info to request
    req.recipe = recipe;
    req.isOwner = isOwner;
    req.isCollaborator = isCollaborator;
    
    next();
  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: 'Permission check failed' 
    });
  }
};

/**
 * Check if user is recipe owner
 * Requires the protect middleware to run first
 */
exports.checkRecipeOwner = (req, res, next) => {
  try {
    const { Recipe } = require('../models/RecipeModel');
    const recipe = Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Recipe not found' 
      });
    }
    
    const userId = req.user.id;
    
    // Check if user is owner
    if (recipe.owner.id !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Only the recipe owner can perform this action' 
      });
    }
    
    // Add recipe to request
    req.recipe = recipe;
    
    next();
  } catch (error) {
    console.error('Owner check error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      message: 'Owner check failed' 
    });
  }
}; 