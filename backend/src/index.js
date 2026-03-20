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

const server = app.listen(config.port, () => {
  logger.info(`🚀 TravelCRM API server running on port ${config.port}`);
  logger.info(`📡 Environment: ${config.nodeEnv}`);
  logger.info(`🌐 Frontend URL: ${config.frontendUrl}`);
  
  // Start scheduled tasks
  startCronJobs();
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
