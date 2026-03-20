// ============================================================
// TravelCRM — Global Error Classes
// ============================================================
// USAGE:
//   throw new ValidationError('Phone number is required');
//   throw new BusinessError('This query has already been confirmed');
//   throw new NotFoundError('Query');
//   throw new UnauthorizedError('Invalid credentials');
//   throw new ForbiddenError('You do not have permission');
//
// These are caught by the global errorHandler middleware and
// returned as clean JSON to the frontend.
// ============================================================

/**
 * Base application error. All custom errors extend this.
 * @param {string} message - Human readable error message
 * @param {number} statusCode - HTTP status code
 * @param {boolean} isOperational - true = expected error, false = bug
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 422 — Input validation failed (missing fields, wrong format) */
class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

/** 400 — Business rule violation (e.g. duplicate entry, invalid state) */
class BusinessError extends AppError {
  constructor(message = 'Business rule violation') {
    super(message, 400);
  }
}

/** 404 — Resource not found */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/** 401 — Authentication failed (bad token, expired, missing) */
class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

/** 403 — Permission denied (role/permission check failed) */
class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  ValidationError,
  BusinessError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};
