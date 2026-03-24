// ============================================================
// TravelCRM — Centralized Configuration
// ============================================================
// All environment variables are read HERE and exported as a
// single config object. No other file should use process.env
// directly. This prevents typos and makes env changes easy.
// ============================================================

require('dotenv').config();

const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
for (const env of requiredEnvs) {
  if (!process.env[env]) {
    throw new Error(`CRITICAL: Missing environment variable ${env}`);
  }
}

const config = {
  // --- Server ---
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || '', 


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
    adminFrom: process.env.ADMIN_EMAIL_FROM || 'administrative@imagicaholidays.com',
    adminFromName: process.env.ADMIN_EMAIL_FROM_NAME || 'Imagica Holidays (Admin)',
  },

  // --- Redis ---
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // --- External Integrations ---
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  
  whatsapp: {
    mode: process.env.WHATSAPP_MODE || 'manual', // was 'interakt'
    interaktApiKey: process.env.INTERAKT_API_KEY,
  },
  
  // --- Operational Settings ---
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 5 * 1024 * 1024, // 5MB default
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // Limit each IP to 100 requests per window
  },

  // --- Security ---
  immortalEmails: (process.env.IMMORTAL_EMAILS || 'harshbuddy01@gmail.com,administrative@imagicaholidays.com,amanasha481@gmail.com').split(',').map(e => e.trim().toLowerCase()),

  // --- Webhook ---
  webhookApiKey: process.env.WEBHOOK_API_KEY || '',
};

module.exports = config;
