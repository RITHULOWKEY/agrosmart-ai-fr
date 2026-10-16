require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('Testing MongoDB connection with URI:', process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 15)}...` : 'NONE');
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connection test SUCCESSFUL!');
    console.log(`Connected to host: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB connection test FAILED!');
    console.error(err.message);
    process.exit(1);
  }
}

testConnection();
