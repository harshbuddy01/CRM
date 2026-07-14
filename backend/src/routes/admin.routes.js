// ============================================================
// TravelCRM — Admin & System Routes
// Operations for maintenance, backups, system status, and
// team activity logs.
// ============================================================

const express = require('express');
const router = express.Router();
const runSnapshot = require('../scripts/backup-db');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');
const prisma = require('../config/prisma');

/**
 * @route   POST /api/v1/admin/backup/trigger
 * @desc    Manually trigger a Safety Vault backup
 * @access  Admin Only
 */
router.post('/backup/trigger', authenticate, can('system.backup'), async (req, res, next) => {

  console.log(`🚀 [Admin] Backup triggered by ${req.user.email}`);

  try {
    // We run this asynchronously so the request doesn't timeout
    runSnapshot()
      .then(() => console.log('✅ [Admin] Async Backup Complete'))
      .catch(err => console.error('❌ [Admin] Async Backup Failed:', err.message));

    res.status(202).json({
      success: true,
      message: 'Safety Vault backup initiated successfully.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/admin/activity-logs
 * @desc    Fetch team activity logs with search, filters, and pagination
 *          Only shows last 7 days of data (older logs are auto-purged nightly)
 * @access  Admin Only (users.manage)
 * @query   userId, entityType, search, from, to, page (default 1), limit (default 50)
 */
router.get('/activity-logs', authenticate, can('users.manage'), async (req, res, next) => {
  try {
    const {
      userId,
      entityType,
      search,
      from,
      to,
      page = '1',
      limit = '50',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Always cap to last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fromDate = from ? new Date(from) : sevenDaysAgo;
    const toDate = to ? new Date(to) : new Date();

    // Build the where clause
    const where = {
      createdAt: {
        gte: fromDate < sevenDaysAgo ? sevenDaysAgo : fromDate,
        lte: toDate,
      },
    };

    if (userId && userId !== 'all') {
      where.userId = userId;
    }

    if (entityType && entityType !== 'all') {
      where.entityType = entityType;
    }

    // Search by action text OR user name (using subquery approach)
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { action: { contains: searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { entityId: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              role: { select: { label: true, name: true } },
              department: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasMore: pageNum < totalPages,
        },
        retentionDays: 7,
        oldestAllowed: sevenDaysAgo.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/admin/activity-logs/users
 * @desc    Get list of users who have activity in the last 7 days (for filter dropdown)
 * @access  Admin Only
 */
router.get('/activity-logs/users', authenticate, can('users.manage'), async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Distinct users who have logged activity in the past 7 days
    const activeUsers = await prisma.activityLog.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        userId: { not: null },
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            role: { select: { label: true } },
          },
        },
      },
      distinct: ['userId'],
      orderBy: { createdAt: 'desc' },
    });

    const users = activeUsers
      .map(l => l.user)
      .filter(Boolean);

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
