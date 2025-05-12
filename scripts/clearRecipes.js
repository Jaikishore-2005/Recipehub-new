require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/RecipeModel');

// Set MongoDB URI explicitly to test database if not provided in environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
console.log(`Using MongoDB URI: ${MONGO_URI}`);

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function clearRecipes() {
  try {
    console.log('Deleting all recipes...');
    const result = await Recipe.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} recipes`);
    
    // Verify deletion
    const remainingCount = await Recipe.countDocuments();
    console.log(`Remaining recipes in database: ${remainingCount}`);
    
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error clearing recipes:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

clearRecipes(); 