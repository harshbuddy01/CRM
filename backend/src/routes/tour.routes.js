// ============================================================
// TravelCRM — Tour Routes
// ============================================================

const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

router.get('/', can('tour.view_all'), tourController.list);
router.get('/:id', can('tour.view_all'), tourController.getById);
router.get('/:id/refund-estimate', can('tour.cancel'), tourController.refundEstimate);
router.patch('/:id/ops', can('tour.edit_ops'), tourController.updateOps);
router.post('/:id/cancel', can('tour.cancel'), tourController.cancel);

module.exports = router;
