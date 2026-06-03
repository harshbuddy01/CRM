// ============================================================
// TravelCRM — Authentication Middleware
// ============================================================
// Runs on EVERY protected route. Optimized for performance:
//   1. Extracts JWT from Authorization header (Bearer token)
//   2. Verifies the token signature  
//   3. Reads permissions from JWT payload (cached at login/refresh)
//   4. Does ONE DB query to verify user still exists & is active
//
// If token is missing/invalid → 401 Unauthorized
// ============================================================

const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/prisma');
const { UnauthorizedError } = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Express middleware: authenticate
 * Verifies JWT and attaches user info + permissions to req.user
 * 
 * Performance: Reduced from 5 DB queries to 1 per request.
 * Permissions are now embedded in the JWT at login/refresh time
 * and refreshed whenever the token is refreshed (max 15 min stale).
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Extract token from "Bearer <token>" header or from query parameter
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    // Verify JWT signature and decode payload (includes permissions)
    const decoded = jwt.verify(token, config.jwt.secret);

    // Single DB query: verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive or not found');
    }

    // Attach to request — permissions come from JWT (cached at login/refresh)
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: decoded.role,
      roleLabel: decoded.roleLabel,
      permissions: decoded.permissions || {},
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token has expired'));
    }
    next(error);
  }
};

module.exports = { authenticate };
