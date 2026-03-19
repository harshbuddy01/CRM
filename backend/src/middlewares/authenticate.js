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

/**
 * Loads a user's effective permissions by merging:
 *   1. Role default permissions (from role_permissions table)
 *   2. Per-person overrides (from user_permission_overrides table)
 * Override ALWAYS wins over the role default.
 *
 * @param {string} userId - The user's UUID
 * @returns {Object} - { 'query.view_all': true, 'payment.delete': false, ... }
 */
async function getUserPermissions(userId) {
  // Step 1: Load role default permissions
  const rolePerms = await prisma.$queryRaw`
    SELECT p.key, rp.granted
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN users u ON u.role_id = rp.role_id
    WHERE u.id = ${userId}::uuid
  `;

  const perms = {};
  for (const row of rolePerms) {
    perms[row.key] = row.granted;
  }

  // Step 2: Apply personal overrides (wins over role)
  const overrides = await prisma.$queryRaw`
    SELECT p.key, upo.granted
    FROM user_permission_overrides upo
    JOIN permissions p ON p.id = upo.permission_id
    WHERE upo.user_id = ${userId}::uuid
  `;

  for (const override of overrides) {
    perms[override.key] = override.granted;
  }

  return perms;
}

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

module.exports = { authenticate, getUserPermissions };
