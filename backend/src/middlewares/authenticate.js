// ============================================================
// TravelCRM — Authentication Middleware
// ============================================================
// Runs on EVERY protected route. Does three things:
//   1. Extracts JWT from Authorization header (Bearer token)
//   2. Verifies the token signature
//   3. Loads the user's merged permissions (role + overrides)
//      and attaches them to req.user
//
// If token is missing/invalid → 401 Unauthorized
// ============================================================

const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/prisma');
const { UnauthorizedError } = require('../utils/AppError');
const logger = require('../utils/logger');
const { getUserPermissions } = require('../utils/permissions');

/**
 * Express middleware: authenticate
 * Verifies JWT and attaches user info + permissions to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT signature and decode payload
    const decoded = jwt.verify(token, config.jwt.secret);

    // Fetch user from DB to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive or not found');
    }

    // Ensure user has at least one valid session
    const sessionExists = await prisma.userSession.findFirst({
      where: { 
        userId: user.id,
        expiresAt: { gt: new Date() }
      },
    });
    
    if (!sessionExists) {
      throw new UnauthorizedError('Session expired or logged out');
    }

    // Load merged permissions (role defaults + personal overrides)
    const permissions = await getUserPermissions(user.id);

    // Attach to request for downstream use
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      roleLabel: user.role.label,
      permissions,
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
