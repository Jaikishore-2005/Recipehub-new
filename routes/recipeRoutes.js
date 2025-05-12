const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { protect, checkRecipePermission, checkRecipeOwner } = require('../middleware/auth');

// Public routes
router.get('/public', recipeController.getPublicRecipes);
router.get('/:id', recipeController.getRecipeById);

// Protected routes
router.use(protect);

// User recipe routes
router.get('/', recipeController.getAllRecipes);
router.get('/user/:userId', recipeController.getUserRecipes);
router.get('/shared/:userId', recipeController.getSharedRecipes);

// Create recipe
router.post('/', recipeController.createRecipe);

// Edit/delete recipe (must be owner or collaborator)
router.put('/:id', checkRecipePermission, recipeController.updateRecipe);
router.delete('/:id', checkRecipeOwner, recipeController.deleteRecipe);

// Collaborator routes (must be owner)
router.post('/:id/collaborators', checkRecipeOwner, recipeController.addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', checkRecipeOwner, recipeController.removeCollaborator);

module.exports = router; 