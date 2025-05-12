const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/UserModel');

// Secret key for JWT (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'recipe_hub_dev_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Sign up a new user
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    if (User.findByEmail(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password (simple version)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = User.create({
      name,
      email,
      password: hashedPassword
    });
    
    // Generate token
    const token = generateToken(newUser);
    console.log('Token generated for signup:', token);
    
    // Return user and token (simplified format that works)
    return res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      token: token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Log in a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(user);
    console.log('Token generated for login:', token);
    
    // Return user and token (simplified format that works)
    return res.status(200).json({
      message: 'Login successful',
      user: user,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get the current user
exports.getCurrentUser = (req, res) => {
  res.json({ 
    message: 'Current user retrieved successfully',
    user: req.user 
  });
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Get user
    const user = User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}; 