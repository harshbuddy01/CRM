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
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3000').trim(),
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
    from: process.env.EMAIL_FROM || 'noreply@imagicaholidays.com',
    adminFrom: process.env.ADMIN_EMAIL_FROM || process.env.APP_EMAIL || 'noreply@imagicaholidays.com',
    adminFromName: process.env.ADMIN_EMAIL_FROM_NAME || 'Imagica Holidays',
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
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
  },

  // --- Google Ads Enhanced Conversions ---
  googleAds: {
    customerId: (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/-/g, ''), // Strip dashes: 123-456-7890 → 1234567890
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    accessToken: process.env.GOOGLE_ADS_ACCESS_TOKEN || '',
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    clientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    loginCustomerId: (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '').replace(/-/g, ''), // MCC account ID if applicable
    apiVersion: process.env.GOOGLE_ADS_API_VERSION || 'v17',
    conversionActionIds: {
      Lead: process.env.GOOGLE_ADS_CONVERSION_ACTION_LEAD || '',
      QualifiedLead: process.env.GOOGLE_ADS_CONVERSION_ACTION_QUALIFIED || '',
      ConvertedLead: process.env.GOOGLE_ADS_CONVERSION_ACTION_CONVERTED || '',
    },
  },

  // --- Meta Conversions API (CAPI) ---
  meta: {
    pixelId: process.env.META_PIXEL_ID || '',
    accessToken: process.env.META_ACCESS_TOKEN || '',
    apiVersion: process.env.META_API_VERSION || 'v24.0',
    testEventCode: process.env.META_TEST_EVENT_CODE || '',
  },
  
  // --- Operational Settings ---
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 20 * 1024 * 1024, // 20MB default
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 1000, // Limit each IP to 1000 requests per window
  },

  // --- Security ---
  immortalEmails: (process.env.IMMORTAL_EMAILS || 'anish629028@gmail.com,harshbuddy01@gmail.com,amanasha481@gmail.com').split(',').map(e => e.trim().toLowerCase()),

  // --- Webhook ---
  webhookApiKey: process.env.WEBHOOK_API_KEY || '',
};

module.exports = config;
