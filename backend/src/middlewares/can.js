// ============================================================
// TravelCRM — Permission Check Middleware: can(permissionKey)
// ============================================================
// USAGE in routes:
//   router.get('/queries', authenticate, can('query.view_own'), queryController.list);
//   router.delete('/queries/:id', authenticate, can('query.delete'), queryController.remove);
//
// How it works:
//   1. Reads the permission key from req.user.permissions
//      (which was loaded by authenticate middleware)
//   2. If permission is NOT granted → 403 Forbidden + audit log
//   3. If granted → next()
// ============================================================

const { ForbiddenError } = require('../utils/AppError');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

/**
 * Returns an Express middleware that checks if the current user
 * has the specified permission key.
 *
 * @param {string} permKey - Permission key e.g. 'query.view_all'
 * @returns {Function} Express middleware
 */
const can = (permKey) => {
  return async (req, res, next) => {
    try {
      const allowed = req.user?.permissions?.[permKey] ?? false;

      if (!allowed) {
        // Log the denied access attempt to audit trail
        try {
          await prisma.activityLog.create({
            data: {
              userId: req.user.id,
              action: 'permission.denied',
              entityType: 'system',
              entityId: null,
              oldValue: null,
              newValue: { permissionKey: permKey, role: req.user.role },
              ipAddress: req.ip,
            },
          });
        } catch (logError) {
          // Don't let logging failure block the response
          logger.error('Failed to log denied access:', logError.message);
        }

        logger.warn(
          `Access DENIED: User ${req.user.id} (${req.user.role}) tried '${permKey}'`
        );

        throw new ForbiddenError(
          `You do not have permission to perform this action (${permKey})`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { can };
