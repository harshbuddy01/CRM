// ============================================================
// TravelCRM — Global Error Handler Middleware
// ============================================================
// This is the LAST middleware in the Express chain.
// It catches ALL errors thrown anywhere in the app and
// returns a clean, standardized JSON response.
//
// Operational errors (AppError) → return the error message
// Programming errors (bugs)    → return generic 500 message
// ============================================================

const logger = require('../utils/logger');
const { AppError } = require('../utils/AppError');

/**
 * Global error handling middleware.
 * Must have 4 parameters (err, req, res, next) for Express to
 * recognize it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    logger.error(`[${err.statusCode}] ${err.message}`);
    logger.error(err.stack);

    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // In PRODUCTION: only send operational errors to the client
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  // Programming / unknown errors → don't leak details
  logger.error('UNEXPECTED ERROR:', err);
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

module.exports = { errorHandler };
