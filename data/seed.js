// Seed file to populate initial data
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel');
const Recipe = require('../models/RecipeModel');

// Create seed users - completely disabled
const createUsers = async () => {
  console.log('Seed user creation is disabled');
  return { admin: null, user: null };
};

// Create seed recipes - completely disabled
const createRecipes = async (users) => {
  console.log('Seed recipe creation is disabled');
  return { recipe1: null, recipe2: null };
};

// Export function to seed data - completely disabled
const seedData = async () => {
  try {
    console.log('⚠️ DATA SEEDING IS COMPLETELY DISABLED');
    console.log('⚠️ No mock data will be created');
    return { users: null, recipes: null };
  } catch (error) {
    console.error('Error in seed data function:', error);
    throw error;
  }
};

module.exports = { seedData }; 