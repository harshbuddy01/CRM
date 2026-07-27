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
const socketService = require('./services/socket.service');

console.log('--- STARTING TRAVEL-CRM BACKEND ---');
console.log(`Port Configured: ${config.port}`);
console.log(`Node Environment: ${config.nodeEnv}`);

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log('✅ app.listen() callback triggered successfully.');
  logger.info(`🚀 TravelCRM API server running on port ${config.port}`);
  
  // Initialize Socket.io
  socketService.init(server);

  // Start scheduled tasks
  console.log('⌛ Starting Cron Jobs...');
  startCronJobs();
  console.log('✅ Cron Jobs initialized.');

  // Purge any bloated base64 images from the database on startup (Query and Invoice models) using raw SQL length checks
  try {
    const prisma = require('./config/prisma');
    
    // Clean invoices table
    prisma.$executeRawUnsafe(`
      UPDATE invoices
      SET 
        invoice_header_banner_url = CASE WHEN LENGTH(invoice_header_banner_url) > 2000 THEN NULL ELSE invoice_header_banner_url END,
        invoice_middle_banner_url = CASE WHEN LENGTH(invoice_middle_banner_url) > 2000 THEN NULL ELSE invoice_middle_banner_url END,
        invoice_qr_code_url = CASE WHEN LENGTH(invoice_qr_code_url) > 2000 THEN NULL ELSE invoice_qr_code_url END,
        invoice_logo_url = CASE WHEN LENGTH(invoice_logo_url) > 2000 THEN NULL ELSE invoice_logo_url END
      WHERE 
        LENGTH(invoice_header_banner_url) > 2000 OR 
        LENGTH(invoice_middle_banner_url) > 2000 OR 
        LENGTH(invoice_qr_code_url) > 2000 OR 
        LENGTH(invoice_logo_url) > 2000
    `).then(count => {
      if (count > 0) {
        console.log(`🧹 Raw SQL cleaned up ${count} invoices containing bloated base64 images.`);
      }
    }).catch(err => console.error('❌ Raw SQL invoice cleanup failed:', err));

    // Clean queries table
    prisma.$executeRawUnsafe(`
      UPDATE queries
      SET 
        invoice_header_banner_url = CASE WHEN LENGTH(invoice_header_banner_url) > 2000 THEN NULL ELSE invoice_header_banner_url END,
        invoice_middle_banner_url = CASE WHEN LENGTH(invoice_middle_banner_url) > 2000 THEN NULL ELSE invoice_middle_banner_url END
      WHERE 
        LENGTH(invoice_header_banner_url) > 2000 OR 
        LENGTH(invoice_middle_banner_url) > 2000
    `).then(count => {
      if (count > 0) {
        console.log(`🧹 Raw SQL cleaned up ${count} queries containing bloated base64 images.`);
      }
    }).catch(err => console.error('❌ Raw SQL query cleanup failed:', err));

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

  // Auto-initialize WhatsApp Web client to restore active linked sessions on restart
  // Only enable when ENABLE_WHATSAPP=true is set (e.g., demo environments)
  // This prevents a ~400MB Chromium process from running on production servers
  if (process.env.ENABLE_WHATSAPP === 'true') {
    try {
      require('./services/whatsapp-web.service').initialize();
      console.log('✅ WhatsApp Web service auto-initialized.');
    } catch (e) {
      console.error('❌ Could not auto-initialize WhatsApp Web service:', e);
    }
  } else {
    console.log('ℹ️ WhatsApp Web service disabled (set ENABLE_WHATSAPP=true to enable).');
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
