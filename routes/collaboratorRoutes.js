const express = require('express');
const router = express.Router();
const collaboratorController = require('../controllers/collaboratorController');
const { protect, checkRecipeOwner } = require('../middleware/auth');

// Routes with authentication
router.use(protect);

// Get all my pending invitations
router.get('/my-invitations', collaboratorController.getMyInvitations);

// Accept an invitation
router.put('/invitations/:id/accept', collaboratorController.acceptInvitation);

// Reject an invitation
router.put('/invitations/:id/reject', collaboratorController.rejectInvitation);

// Recipe owner routes - recipe ID is in the path
router.post('/recipes/:id/invite', checkRecipeOwner, collaboratorController.inviteCollaborator);
router.get('/recipes/:id', checkRecipeOwner, collaboratorController.getCollaborators);
router.delete('/recipes/:recipeId/collaborators/:collaboratorId', checkRecipeOwner, collaboratorController.removeCollaborator);

module.exports = router; 