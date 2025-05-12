// Script to clear all recipes from the database
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Recipe = require('../models/RecipeModel');

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Clear all recipes
const clearRecipes = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    console.log('Connected to MongoDB. Clearing recipes...');
    
    // Delete all recipes
    const result = await Recipe.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} recipes from the database.`);
    
    return result;
  } catch (error) {
    console.error('Error clearing recipes:', error);
    throw error;
  } finally {
    // Close the database connection
    console.log('Closing database connection...');
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the script
clearRecipes()
  .then(() => {
    console.log('Operation completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 