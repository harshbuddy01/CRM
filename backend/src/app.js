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
const rateLimit = require('express-rate-limit');
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
const allowedOrigins = [config.frontendUrl, 'https://lightpink-termite-550903.hostingersite.com'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || config.nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
const userRoutes = require('./routes/user.routes');
const notificationRoutes = require('./routes/notification.routes');
const reportRoutes = require('./routes/report.routes');
const masterRoutes = require('./routes/master.routes');
const proposalRoutes = require('./routes/proposal.routes');
const paymentRoutes = require('./routes/payment.routes');
const tourRoutes = require('./routes/tour.routes');

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 attempts
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/v1', (req, res, next) => {
  // Skip general limiter for auth routes to prevent double-charging
  if (req.path.startsWith('/auth')) return next();
  return generalLimiter(req, res, next);
});

// Apply login limiter strictly to the login route, not all auth APIs like logout/refresh
app.use('/v1/auth/login', loginLimiter);
app.use('/api/v1/auth/login', loginLimiter);

// Base API Router to share between /v1 and /api/v1 prefixes
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/queries', queryRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/masters', masterRoutes);
apiRouter.use('/proposals', proposalRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/tours', tourRoutes);

// Mount the router under both prefixes
app.use('/v1', apiRouter);
app.use('/api/v1', apiRouter);

// ========================
// 404 HANDLER
// ========================
app.use((req, _res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// ========================
// GLOBAL ERROR HANDLER (must be last)
// ========================
app.use(errorHandler);

module.exports = app;
