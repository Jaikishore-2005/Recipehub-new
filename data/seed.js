// Seed file to populate initial data
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel');
const Recipe = require('../models/RecipeModel');

// Create seed users - disabled for production
const createUsers = async () => {
  console.log('Seed user creation is disabled');
  return { admin: null, user: null };
};

// Create seed recipes - disabled for production
const createRecipes = async (users) => {
  console.log('Seed recipe creation is disabled');
  return { recipe1: null, recipe2: null };
};

// Export function to seed data
const seedData = async () => {
  try {
    console.log('⚠️ Seed data function is disabled for production use');
    return { users: null, recipes: null };
  } catch (error) {
    console.error('Error in seed data function:', error);
    throw error;
  }
};

module.exports = { seedData }; 