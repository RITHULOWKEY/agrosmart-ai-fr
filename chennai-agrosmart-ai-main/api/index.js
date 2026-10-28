const app = require('../server/app');
const connectDB = require('../server/config/db');

// Serverless function handler for Vercel
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection notice in Vercel API handler:', err.message);
  }
  return app(req, res);
};
