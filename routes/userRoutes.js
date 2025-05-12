const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { User } = require('../models/UserModel');
const bcrypt = require('bcryptjs');

// Public auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.use(protect);

// User routes
router.get('/me', (req, res) => {
  try {
    res.json({ 
      message: 'User profile retrieved successfully',
      user: req.user 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error', message: 'Failed to retrieve user profile' });
  }
});

router.put('/me', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    
    // Get user
    const user = User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Not found', message: 'User not found' });
    }
    
    // Update user fields
    if (name) user.name = name;
    
    // Return updated user (without password)
    const { password, ...userWithoutPassword } = user;
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error', message: 'Failed to update profile' });
  }
});

router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Current password and new password are required' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'New password must be at least 6 characters long' 
      });
    }
    
    const userId = req.user.id;
    
    // Get full user with password
    const user = User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Not found', message: 'User not found' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error', message: 'Failed to change password' });
  }
});

module.exports = router; 