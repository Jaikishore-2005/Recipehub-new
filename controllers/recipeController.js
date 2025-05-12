const Recipe = require('../models/RecipeModel');

/**
 * Get all recipes
 */
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json({
      message: 'Recipes retrieved successfully',
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Get all recipes error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to retrieve recipes' 
    });
  }
};

/**
 * Get all public recipes
 */
exports.getPublicRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isPublic: true });
    res.json({
      message: 'Public recipes retrieved successfully',
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Get public recipes error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to retrieve public recipes' 
    });
  }
};

/**
 * Get recipes by user ID
 */
exports.getUserRecipes = (req, res) => {
  try {
    const userId = req.params.userId;
    const recipes = Recipe.getByUserId(userId);
    res.json({
      message: 'User recipes retrieved successfully',
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Get user recipes error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to retrieve user recipes' 
    });
  }
};

/**
 * Get recipes shared with user
 */
exports.getSharedRecipes = (req, res) => {
  try {
    const userId = req.params.userId;
    const recipes = Recipe.getSharedWithUser(userId);
    res.json({
      message: 'Shared recipes retrieved successfully',
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Get shared recipes error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to retrieve shared recipes' 
    });
  }
};

/**
 * Get a recipe by ID
 */
exports.getRecipeById = (req, res) => {
  try {
    const recipe = Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Recipe not found' 
      });
    }
    res.json({
      message: 'Recipe retrieved successfully',
      recipe
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to retrieve recipe' 
    });
  }
};

/**
 * Create a new recipe
 */
exports.createRecipe = (req, res) => {
  try {
    const recipeData = req.body;
    
    // Validate required fields
    if (!recipeData.title) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Recipe title is required' 
      });
    }
    
    // Set owner from authenticated user
    recipeData.owner = {
      id: req.user.id,
      name: req.user.name
    };
    
    const newRecipe = Recipe.create(recipeData);
    res.status(201).json({
      message: 'Recipe created successfully',
      recipe: newRecipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to create recipe' 
    });
  }
};

/**
 * Update a recipe
 */
exports.updateRecipe = (req, res) => {
  try {
    const recipeId = req.params.id;
    const updateData = req.body;
    
    // Verify the recipe exists (middleware should have already checked this)
    if (!req.recipe) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Recipe not found' 
      });
    }
    
    // Ensure owner info is not changed
    delete updateData.owner;
    
    // For collaborators, make sure we use the middleware check
    if (!req.isOwner) {
      delete updateData.collaborators;
    }
    
    const updatedRecipe = Recipe.update(recipeId, updateData);
    if (!updatedRecipe) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Recipe not found' 
      });
    }
    
    res.json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to update recipe' 
    });
  }
};

/**
 * Delete a recipe
 */
exports.deleteRecipe = (req, res) => {
  try {
    const recipeId = req.params.id;
    
    // Verify the recipe exists (middleware should have already checked this)
    if (!req.recipe) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Recipe not found' 
      });
    }
    
    const deleted = Recipe.delete(recipeId);
    if (!deleted) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Recipe not found' 
      });
    }
    
    res.status(200).json({
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to delete recipe' 
    });
  }
};

/**
 * Add a collaborator to a recipe
 */
exports.addCollaborator = (req, res) => {
  try {
    const recipeId = req.params.id;
    const collaborator = req.body;
    
    // Validate required fields
    if (!collaborator.email) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Collaborator email is required' 
      });
    }
    
    const recipe = Recipe.addCollaborator(recipeId, collaborator);
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Recipe not found' 
      });
    }
    
    res.json({
      message: 'Collaborator added successfully',
      recipe
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to add collaborator' 
    });
  }
};

/**
 * Remove a collaborator from a recipe
 */
exports.removeCollaborator = (req, res) => {
  try {
    const recipeId = req.params.id;
    const collaboratorId = req.params.collaboratorId;
    
    const recipe = Recipe.removeCollaborator(recipeId, collaboratorId);
    if (!recipe) {
      return res.status(404).json({ 
        error: 'Not found', 
        message: 'Recipe not found' 
      });
    }
    
    res.json({
      message: 'Collaborator removed successfully',
      recipe
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: 'Failed to remove collaborator' 
    });
  }
}; 