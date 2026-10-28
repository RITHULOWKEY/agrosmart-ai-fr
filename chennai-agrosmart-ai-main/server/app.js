const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const os = require('os');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const profileRoutes = require('./routes/profileRoutes');
const agentRoutes = require('./routes/agentRoutes');
const connectDB = require('./config/db');

const app = express();

// Security HTTP headers with cross-origin resource policy for uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration supporting production Vercel frontend, custom CLIENT_URL, and local dev
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  'https://agrosmart-ai-fr.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, serverless function invocation, curl)
      if (!origin) {
        return callback(null, true);
      }
      const isAllowed =
        allowedOrigins.includes(origin) ||
        (origin.endsWith('.vercel.app') && origin.includes('agrosmart'));
      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked request from unauthorized origin: ${origin}`));
    },
    credentials: true,
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving (uses os.tmpdir() on serverless like Vercel)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadDir = isServerless ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadDir));

// Database auto-connection guard
app.use(async (req, res, next) => {
  // Let health check and preflight pass without blocking on DB
  if (
    req.method === 'OPTIONS' ||
    req.path === '/api/health' ||
    req.path === '/health' ||
    req.path.startsWith('/uploads')
  ) {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is temporarily unavailable. Please verify MongoDB Atlas Network Access and credentials.',
      });
    }
  }
  next();
});

// Health check endpoint
const healthHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isDbConnected ? 'healthy' : 'degraded',
    system: '🌱 Chennai AgroSmart AI - Decision Support Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: isDbConnected ? 'Connected' : 'Disconnected',
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount API routes (support both /api/* and /* for transparent proxy / serverless rewrites)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/farms', farmRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/analysis', analysisRoutes);
app.use('/api/profile', profileRoutes);
app.use('/profile', profileRoutes);
app.use('/api/agents', agentRoutes);
app.use('/agents', agentRoutes);

// Recommendations alias endpoint: GET /api/recommendations/:analysisId
const recommendationHandler = async (req, res) => {
  try {
    const FinalRecommendation = require('./models/FinalRecommendation');
    const rec = await FinalRecommendation.findOne({ analysisId: req.params.analysisId });
    if (!rec) {
      return res.status(404).json({ success: false, message: 'Recommendation not found.' });
    }
    return res.json({ success: true, recommendation: rec });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

app.get('/api/recommendations/:analysisId', require('./middleware/authMiddleware').protect, recommendationHandler);
app.get('/recommendations/:analysisId', require('./middleware/authMiddleware').protect, recommendationHandler);

// Static client serving if client/dist exists (for unified single-service hosting)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/auth')
    ) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error. Please try again.',
  });
});

module.exports = app;
