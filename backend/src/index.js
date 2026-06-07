// ============================================================
// TravelCRM — Server Entry Point
// ============================================================
// This file ONLY starts the HTTP server.
// All Express configuration lives in app.js.
// ============================================================

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { startCronJobs } = require('./cron');

console.log('--- STARTING TRAVEL-CRM BACKEND ---');
console.log(`Port Configured: ${config.port}`);
console.log(`Node Environment: ${config.nodeEnv}`);

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log('✅ app.listen() callback triggered successfully.');
  logger.info(`🚀 TravelCRM API server running on port ${config.port}`);
  
  // Start scheduled tasks
  console.log('⌛ Starting Cron Jobs...');
  startCronJobs();
  console.log('✅ Cron Jobs initialized.');

  // Purge any bloated base64 images from the database on startup (Query and Invoice models)
  try {
    const prisma = require('./config/prisma');
    
    // Clean Invoice model
    prisma.invoice.updateMany({
      where: {
        OR: [
          { invoiceHeaderBannerUrl: { startsWith: 'data:image/' } },
          { invoiceMiddleBannerUrl: { startsWith: 'data:image/' } },
          { invoiceQrCodeUrl: { startsWith: 'data:image/' } },
          { invoiceLogoUrl: { startsWith: 'data:image/' } },
        ]
      },
      data: {
        invoiceHeaderBannerUrl: null,
        invoiceMiddleBannerUrl: null,
        invoiceQrCodeUrl: null,
        invoiceLogoUrl: null,
      }
    }).then(res => {
      if (res.count > 0) {
        console.log(`🧹 cleaned up ${res.count} invoices containing bloated base64 images.`);
      }
    }).catch(err => console.error('❌ Base64 invoice cleanup failed:', err));

    // Clean Query model
    prisma.query.updateMany({
      where: {
        OR: [
          { invoiceHeaderBannerUrl: { startsWith: 'data:image/' } },
          { invoiceMiddleBannerUrl: { startsWith: 'data:image/' } },
        ]
      },
      data: {
        invoiceHeaderBannerUrl: null,
        invoiceMiddleBannerUrl: null,
      }
    }).then(res => {
      if (res.count > 0) {
        console.log(`🧹 cleaned up ${res.count} queries containing bloated base64 images.`);
      }
    }).catch(err => console.error('❌ Base64 query cleanup failed:', err));

  } catch (e) {
    console.error('❌ Could not initialize database base64 cleanup:', e);
  }

  // Seed default statuses if none exist
  try {
    require('./services/status-setting.service').seedDefaultStatuses()
      .then(() => console.log('✅ Status settings checked/seeded.'))
      .catch(err => console.error('❌ Status seeding failed:', err));
  } catch (e) {
    console.error('❌ Could not load status service:', e);
  }

  // Auto-seed website content (journeys + trending) if tables are empty
  try {
    require('./scripts/auto-seed-website').autoSeedWebsiteContent()
      .then(() => console.log('✅ Website content auto-seed checked.'))
      .catch(err => console.error('⚠️ Website content auto-seed failed:', err.message));
  } catch (e) {
    console.error('⚠️ Could not load auto-seed script:', e.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  server.close(() => process.exit(1));
});
