// Seed file to populate initial data
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel');
const Recipe = require('../models/RecipeModel');

// Create seed users
const createUsers = async () => {
  try {
    // Check if admin user already exists
    let admin = await User.findOne({ email: 'admin@example.com' });
    let user = await User.findOne({ email: 'user@example.com' });
    
    // If users don't exist, create them
    if (!admin || !user) {
      // Hash a password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Create admin user if doesn't exist
      if (!admin) {
        admin = await User.create({
          name: 'Admin User',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'logged-in'
        });
        console.log('Created admin user');
      }
      
      // Create regular user if doesn't exist
      if (!user) {
        user = await User.create({
          name: 'Regular User',
          email: 'user@example.com',
          password: hashedPassword,
          role: 'logged-in'
        });
        console.log('Created regular user');
      }
    } else {
      console.log('Using existing users from database');
    }
    
    return { admin, user };
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
};

// Create seed recipes
const createRecipes = async (users) => {
  try {
    // Check if recipes already exist
    let recipe1 = await Recipe.findOne({ title: 'Chocolate Chip Cookies', 'owner.id': users.admin._id });
    let recipe2 = await Recipe.findOne({ title: 'Avocado Toast', 'owner.id': users.user._id });
    
    // Create recipes if they don't exist
    if (!recipe1) {
      // Create a recipe owned by admin
      recipe1 = await Recipe.create({
        title: 'Chocolate Chip Cookies',
        description: 'Classic chocolate chip cookies with a soft center and crispy edges',
        servings: 24,
        ingredients: [
          { name: 'All-purpose flour', quantity: 280, unit: 'g' },
          { name: 'Butter', quantity: 225, unit: 'g' },
          { name: 'Brown sugar', quantity: 220, unit: 'g' },
          { name: 'White sugar', quantity: 100, unit: 'g' },
          { name: 'Eggs', quantity: 2, unit: '' },
          { name: 'Vanilla extract', quantity: 1, unit: 'tsp' },
          { name: 'Baking soda', quantity: 1, unit: 'tsp' },
          { name: 'Salt', quantity: 0.5, unit: 'tsp' },
          { name: 'Chocolate chips', quantity: 350, unit: 'g' },
        ],
        steps: [
          { description: 'Preheat oven to 375°F (190°C)' },
          { description: 'Cream together butter and sugars until light and fluffy' },
          { description: 'Beat in eggs and vanilla' },
          { description: 'Mix in dry ingredients, then fold in chocolate chips' },
          { description: 'Drop tablespoon-sized balls onto ungreased baking sheets' },
          { description: 'Bake until edges are golden', timerMinutes: 9 },
          { description: 'Cool on baking sheet for 2 minutes', timerMinutes: 2 },
          { description: 'Transfer to wire racks to cool completely' },
        ],
        tags: ['dessert', 'cookies', 'baking', 'chocolate'],
        isPublic: true,
        owner: {
          id: users.admin._id,
          name: users.admin.name
        },
      });
      console.log('Created Chocolate Chip Cookies recipe');
    }
    
    if (!recipe2) {
      // Create a recipe owned by regular user
      recipe2 = await Recipe.create({
        title: 'Avocado Toast',
        description: 'Simple and nutritious breakfast option',
        servings: 2,
        ingredients: [
          { name: 'Bread', quantity: 2, unit: 'slices' },
          { name: 'Avocado', quantity: 1, unit: '' },
          { name: 'Salt', quantity: 0.25, unit: 'tsp' },
          { name: 'Pepper', quantity: 0.25, unit: 'tsp' },
          { name: 'Red pepper flakes', quantity: 0.25, unit: 'tsp' },
        ],
        steps: [
          { description: 'Toast bread until golden and crisp' },
          { description: 'Cut avocado in half, remove pit, and scoop into a bowl' },
          { description: 'Mash avocado with a fork and mix in salt and pepper' },
          { description: 'Spread avocado mixture on toast' },
          { description: 'Sprinkle with red pepper flakes' }
        ],
        tags: ['breakfast', 'vegetarian', 'quick', 'healthy'],
        isPublic: false,
        owner: {
          id: users.user._id,
          name: users.user.name
        },
      });
      console.log('Created Avocado Toast recipe');
    }
    
    // Let's comment out the collaborator function for now as we need to implement it
    // Add user as collaborator to admin's recipe
    /*
    Recipe.addCollaborator(recipe1.id, {
      id: users.user.id,
      name: users.user.name,
      email: users.user.email,
      role: 'editor'
    });
    */
    
    return { recipe1, recipe2 };
  } catch (error) {
    console.error('Error creating recipes:', error);
    throw error;
  }
};

// Export function to seed data
const seedData = async () => {
  try {
    const users = await createUsers();
    const recipes = await createRecipes(users);
    
    console.log('✅ Seed data created successfully!');
    console.log('Admin User:', users.admin.email);
    console.log('Regular User:', users.user.email);
    console.log('Recipe 1:', recipes.recipe1.title);
    console.log('Recipe 2:', recipes.recipe2.title);
    
    return { users, recipes };
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

module.exports = { seedData }; 