// ============================================================
// TravelCRM — Admin & System Routes
// Operations for maintenance, backups, and system status
// ============================================================

const express = require('express');
const router = express.Router();
const runSnapshot = require('../scripts/backup-db');
const { protect, restrictTo } = require('../middlewares/auth');

/**
 * @route   POST /api/v1/admin/backup/trigger
 * @desc    Manually trigger a Safety Vault backup
 * @access  Admin Only
 */
router.post('/backup/trigger', protect, restrictTo('admin'), async (req, res, next) => {
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

module.exports = router;
