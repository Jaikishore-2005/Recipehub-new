const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use test database explicitly and specify the collection
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
    
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Using database: test`);
    
    // Ensure the recipes collection exists
    if (!conn.connection.db.collection('recipes')) {
      await conn.connection.db.createCollection('recipes');
      console.log('Created recipes collection');
    } else {
      console.log('Using existing recipes collection');
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
