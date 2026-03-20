// ============================================================
// TravelCRM — Payment Routes
// ============================================================

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { requireAuth, requirePermission } = require('../middlewares/auth.middleware');

// Public Webhook (Razorpay calls this directly without auth)
router.post('/webhook', paymentController.webhook);

// Protected routes
router.use(requireAuth);

router.get('/', requirePermission('payment.view_all'), paymentController.list);
router.get('/overdue', requirePermission('payment.view_all'), paymentController.overdue);

// Core creation routes
router.post('/', requirePermission('payment.create'), paymentController.recordPayment);
router.post('/razorpay-link', requirePermission('payment.create'), paymentController.razorpayLink);

module.exports = router;
