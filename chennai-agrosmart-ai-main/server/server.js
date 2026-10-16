require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log('====================================================');
  console.log('🌱 Starting Chennai AgroSmart AI Server...');
  console.log('====================================================');

  try {
    // 1. Connect to MongoDB and verify connection
    await connectDB();

    // 2. Start Express HTTP Server
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Chennai AgroSmart AI Backend running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Allowed Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`🤖 4 AI Agents: Crop, Weather, Soil, Market active`);
      console.log('====================================================');
    });

    // Handle process termination gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing HTTP server...');
      server.close(() => {
        console.log('HTTP server closed.');
      });
    });
  } catch (error) {
    console.error('====================================================');
    console.error('💥 SERVER STARTUP ABORTED: MongoDB Connection Failed');
    console.error(error.message);
    console.error('Please configure your existing MongoDB database connection in server/.env');
    console.error('====================================================');
    process.exit(1);
  }
};

startServer();
