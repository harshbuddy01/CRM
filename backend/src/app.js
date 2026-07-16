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

app.set('trust proxy', 1);

// ========================
// GLOBAL MIDDLEWARES
// ========================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'frame-ancestors': ["'self'", 'https://crm.imagicaholidays.com', 'https://www.imagicaholidays.com'],
      'img-src': ["'self'", 'data:', 'https://res.cloudinary.com', 'https://images.unsplash.com', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  frameguard: false,
}));

// CORS — allow only whitelisted frontend origins
const allowedOrigins = [
  config.frontendUrl, 
  'https://lightpink-termite-550903.hostingersite.com', 
  'https://imagicaholidays.com', 
  'https://www.imagicaholidays.com', 
  'https://crm.imagicaholidays.com',
  'https://api.imagicaholidays.com'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, mobile apps, curl)
      // and requests from whitelisted origins or Hostinger preview sites
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.hostingersite.com')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
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

// Root redirect/welcome
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to TravelCRM API 🌐',
    status: 'Operational',
    api_versions: ['/v1', '/api/v1'],
    health_check: '/health'
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'TravelCRM API is healthy 🚀',
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
const emailTemplateRoutes = require('./routes/email-template.routes');

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

const applyRateLimit = (req, res, next) => {
  if (req.path.startsWith('/auth') || req.path.startsWith('/payments/webhook')) return next();
  return generalLimiter(req, res, next);
};

app.use('/v1', applyRateLimit);
app.use('/api/v1', applyRateLimit);

// Apply login limiter strictly to the login and 2FA routes, not all auth APIs like logout/refresh
app.use('/v1/auth/login', loginLimiter);
app.use('/api/v1/auth/login', loginLimiter);
app.use('/v1/auth/verify-2fa', loginLimiter);
app.use('/api/v1/auth/verify-2fa', loginLimiter);

// Base API Router to share between /v1 and /api/v1 prefixes
const apiRouter = express.Router();

// Base API info
apiRouter.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TravelCRM API — Business Hub 🏢',
    version: '1.0.0',
    documentation: 'Contact admin for API access',
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/queries', queryRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/masters', masterRoutes);
apiRouter.use('/proposals', proposalRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/tours', tourRoutes);
apiRouter.use('/email-templates', emailTemplateRoutes);
apiRouter.use('/drivers', require('./routes/driver.routes'));
apiRouter.use('/', require('./routes/tour-dispatch.routes'));
apiRouter.use('/settings', require('./routes/org-setting.routes'));
apiRouter.use('/status-settings', require('./routes/status-setting.routes'));
apiRouter.use('/clients', require('./routes/client.routes'));
apiRouter.use('/agents', require('./routes/agent.routes'));
apiRouter.use('/masters-v2', require('./routes/master-v2.routes'));
apiRouter.use('/cms', require('./routes/cms.routes'));
apiRouter.use('/finance', require('./routes/finance.routes'));
apiRouter.use('/branches', require('./routes/branch.routes'));
apiRouter.use('/integrations', require('./routes/sheet-sync.routes'));
// Itinerary Builder System
apiRouter.use('/itineraries', require('./routes/itinerary.routes'));
// System Admin (Backups, Logs)
apiRouter.use('/admin', require('./routes/admin.routes'));
// Website Content Management (Journeys, Trending)
apiRouter.use('/website-content', require('./routes/website-content.routes'));
apiRouter.use('/website-configs', require('./routes/website-config.routes'));

apiRouter.use('/', require('./routes/meta-capi.routes'));

// Sprint 10 — Post Sales, Vouchers, Documents
apiRouter.use('/', require('./routes/booking-service.routes'));
apiRouter.use('/', require('./routes/voucher.routes'));
apiRouter.use('/', require('./routes/query-document.routes'));

// ── Public endpoints (no auth required) for website consumption ──
const publicRouter = express.Router();
const wcCtrl = require('./controllers/website-content.controller');
const websiteConfigCtrl = require('./controllers/website-config.controller');
publicRouter.get('/journeys', wcCtrl.getPublicJourneys);
publicRouter.get('/trending', wcCtrl.getPublicTrending);
publicRouter.get('/website-config', websiteConfigCtrl.getWebsiteConfig);
publicRouter.get('/vouchers/:id/download-pdf', require('./routes/voucher.routes').downloadPdfPublic);

// ── Portal APIs (Guest, Driver, Hotel) ──
const portalRoutes = require('./routes/public-portal.routes');
app.use('/v1/public', portalRoutes);
app.use('/api/v1/public', portalRoutes);

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
