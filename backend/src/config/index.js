// ============================================================
// TravelCRM — Centralized Configuration
// ============================================================
// All environment variables are read HERE and exported as a
// single config object. No other file should use process.env
// directly. This prevents typos and makes env changes easy.
// ============================================================

require('dotenv').config();

const config = {
  // --- Server ---
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // --- Database ---
  databaseUrl: process.env.DATABASE_URL,

  // --- JWT ---
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  // --- Email ---
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
  },

  // --- Redis ---
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};

module.exports = config;
