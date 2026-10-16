const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('================================================================');
      console.error('❌ MONGODB_URI is not set in environment variables (server/.env)!');
      console.error('Please configure your existing MongoDB connection string.');
      console.error('Example: MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chennai_agrosmart');
      console.error('================================================================');
      throw new Error('MONGODB_URI environment variable missing');
    }

    console.log('🔄 Connecting to existing MongoDB database...');
    
    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });

    // Verify connection state
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`MongoDB connection readyState is not connected (state: ${mongoose.connection.readyState})`);
    }

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('================================================================');
    console.error('❌ MONGODB CONNECTION FAILED!');
    console.error(`Error details: ${error.message}`);
    console.error('Ensure your MongoDB database is running or your Atlas connection string is correct in server/.env');
    console.error('================================================================');
    throw error;
  }
};

module.exports = connectDB;
