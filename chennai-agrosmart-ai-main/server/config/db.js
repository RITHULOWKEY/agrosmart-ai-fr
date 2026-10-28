const mongoose = require('mongoose');

// Global cache for connection reuse across serverless function invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('================================================================');
    console.error('❌ MONGODB_URI is not set in environment variables!');
    console.error('Please configure your MongoDB Atlas connection string in the environment.');
    console.error('================================================================');
    throw new Error('MONGODB_URI environment variable missing');
  }

  // If already connected, reuse existing connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Connecting to MongoDB database...');
    cached.promise = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    }).then((conn) => {
      console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} / Database: ${conn.connection.name}`);
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('================================================================');
    console.error('❌ MONGODB CONNECTION FAILED!');
    console.error(`Error details: ${error.message}`);
    console.error('Ensure your IP is in Atlas Network Access and credentials are valid in MONGODB_URI.');
    console.error('================================================================');
    throw error;
  }
};

module.exports = connectDB;
