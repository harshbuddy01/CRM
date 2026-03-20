// ============================================================
// TravelCRM — Tour Routes
// ============================================================

const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const { requireAuth, requirePermission } = require('../middlewares/auth.middleware');

router.use(requireAuth);

router.get('/', requirePermission('tour.view_all'), tourController.list);
router.get('/:id', requirePermission('tour.view_all'), tourController.getById);
router.get('/:id/refund-estimate', requirePermission('tour.cancel'), tourController.refundEstimate);
router.patch('/:id/ops', requirePermission('tour.edit_ops'), tourController.updateOps);
router.post('/:id/cancel', requirePermission('tour.cancel'), tourController.cancel);

module.exports = router;
