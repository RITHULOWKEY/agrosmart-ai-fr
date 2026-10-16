const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const profileRoutes = require('./routes/profileRoutes');
const agentRoutes = require('./routes/agentRoutes');

const app = express();

// Security HTTP headers with cross-origin resource policy for uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or matching allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev convenience
    },
    credentials: true,
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: '🌱 Chennai AgroSmart AI - Decision Support Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: require('mongoose').connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/agents', agentRoutes);

// Recommendations alias endpoint: GET /api/recommendations/:analysisId
app.get('/api/recommendations/:analysisId', require('./middleware/authMiddleware').protect, async (req, res) => {
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
});

// 404 handler
app.use((req, res, next) => {
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
