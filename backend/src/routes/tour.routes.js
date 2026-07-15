// ============================================================
// TravelCRM — Tour Routes
// ============================================================

const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

router.get('/', can('tour.view_assigned'), tourController.list);
router.get('/:id', can('tour.view_assigned'), tourController.getById);
router.get('/:id/refund-estimate', can('cancellation.create'), tourController.refundEstimate);
router.patch('/:id/ops', can('tour.view_assigned'), tourController.updateOps);
router.post('/:id/cancel', can('cancellation.create'), tourController.cancel);

module.exports = router;
