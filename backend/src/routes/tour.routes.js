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
router.post('/evaluate-transitions', can('tour.view_assigned'), tourController.evaluateTourTransitions);
router.post('/:id/cancel', can('cancellation.create'), tourController.cancel);
router.post('/:id/send-review-invite', can('tour.view_assigned'), tourController.sendReviewInvite);
router.post('/:id/send-pretour-reminder', can('tour.view_assigned'), tourController.sendPretourReminder);
router.post('/:id/send-daily-dispatch', can('tour.view_assigned'), tourController.sendDailyDispatch);
router.post('/:id/set-phase', can('tour.view_assigned'), tourController.setTourPhase);

module.exports = router;
