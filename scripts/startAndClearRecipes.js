require('dotenv').config();
const mongoose = require('mongoose');
const { exec } = require('child_process');

// Get the MongoDB URI from environment or use default
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
console.log(`Using MongoDB URI: ${MONGO_URI}`);

async function clearAndStartServer() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Import model after connection established
    const Recipe = require('../models/RecipeModel');
    
    console.log('Clearing all recipes from database...');
    const deleteResult = await Recipe.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} recipes`);
    
    // Verify deletion
    const remainingCount = await Recipe.countDocuments();
    console.log(`Remaining recipes in database: ${remainingCount}`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    // Start the server
    console.log('Starting the server...');
    const server = exec('node index.js', (err, stdout, stderr) => {
      if (err) {
        console.error('Error starting server:', err);
        return;
      }
    });
    
    // Pipe server output to console
    server.stdout.pipe(process.stdout);
    server.stderr.pipe(process.stderr);
    
    console.log('Server started successfully!');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearAndStartServer(); 