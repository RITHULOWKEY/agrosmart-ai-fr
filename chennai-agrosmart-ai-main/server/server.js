require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  console.log('====================================================');
  console.log('🌱 Starting Chennai AgroSmart AI Server...');
  console.log('====================================================');

  // 1. Start Express HTTP Server immediately so port and health check are responsive
  const server = http.createServer(app);

  server.listen(PORT, HOST, () => {
    console.log('====================================================');
    console.log(`🚀 Chennai AgroSmart AI Backend running on port ${PORT} (${HOST})`);
    console.log(`📡 Health Check: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api/health`);
    console.log(`🌐 Allowed Client URL: ${process.env.CLIENT_URL || 'https://agrosmart-ai-fr.vercel.app'}`);
    console.log(`🤖 4 AI Agents: Crop, Weather, Soil, Market active`);
    console.log('====================================================');
  });

  // 2. Connect to MongoDB database
  try {
    await connectDB();
  } catch (error) {
    console.error('====================================================');
    console.error('⚠️ Initial MongoDB Connection Notice:');
    console.error(error.message);
    console.error('👉 The server remains active to serve health checks and requests.');
    console.error('👉 In MongoDB Atlas, ensure your IP address is added to Network Access.');
    console.error('====================================================');
  }

  // Handle process termination gracefully
  const shutdown = () => {
    console.log('Shutdown signal received. Closing HTTP server...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
