// ============================================================
// TravelCRM — Express Application Setup
// ============================================================
// This file configures the Express app with all global
// middlewares. It does NOT start the server (that's server.js).
// This separation allows unit testing without port conflicts.
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { errorHandler } = require('./middlewares/errorHandler');
const { NotFoundError } = require('./utils/AppError');

const app = express();

// ========================
// GLOBAL MIDDLEWARES
// ========================

// Security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging (dev = colorful, production = combined)
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Body parsing — JSON (with rawBody for webhook signature verification)
app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      // Store raw body buffer for Razorpay webhook signature verification
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================
// API ROUTES
// ========================

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'TravelCRM API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

const authRoutes = require('./routes/auth.routes');
const queryRoutes = require('./routes/query.routes');
app.use('/v1/auth', authRoutes);
app.use('/v1/queries', queryRoutes);

// ========================
// 404 HANDLER
// ========================
app.use((req, _res, _next) => {
  throw new NotFoundError(`Route ${req.originalUrl}`);
});

// ========================
// GLOBAL ERROR HANDLER (must be last)
// ========================
app.use(errorHandler);

module.exports = app;
