const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/UserModel');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Set MongoDB URI explicitly to test database if not provided in environment variables
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
console.log(`MongoDB URI: ${process.env.MONGO_URI}`);

// Connect to MongoDB
connectDB();

// Import models
const { Recipe } = require('./models/RecipeModel');

// Import routes
const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');

// Import seed data for development
const { seedData } = require('./data/seed');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'recipe_hub_dev_secret_key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  credentials: false
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user
    const newUser = await User.create({
      name,
      email,
      password
    });
    
    // Generate token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token: token
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Recipe Hub API is running',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        signup: '/api/auth/signup',
        login: '/api/auth/login'
      },
      users: '/api/users',
      recipes: '/api/recipes',
      publicRecipes: '/api/recipes/public'
    }
  });
});

// API routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error', details: NODE_ENV === 'development' ? err.message : 'Internal server error' });
});

// Initialize data in development
const initDevData = async () => {
  if (NODE_ENV === 'development') {
    try {
      await seedData();
      console.log('✅ Development data seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding development data:', error);
    }
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  
  // Seed data in development
  await initDevData();
  
  // Only show development info in development mode
  if (NODE_ENV === 'development') {
    console.log(`
    ===============================================
    🍽️  Recipe Hub API is Ready! 🍽️
    
    Auth Endpoints:
    - POST http://localhost:${PORT}/api/auth/signup
    - POST http://localhost:${PORT}/api/auth/login
    ===============================================
    `);
  }
}); 