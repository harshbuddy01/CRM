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

  // Seed default statuses if none exist
  try {
    require('./services/status-setting.service').seedDefaultStatuses()
      .then(() => console.log('✅ Status settings checked/seeded.'))
      .catch(err => console.error('❌ Status seeding failed:', err));
  } catch (e) {
    console.error('❌ Could not load status service:', e);
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
