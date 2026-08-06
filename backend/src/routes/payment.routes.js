// ============================================================
// TravelCRM — Payment Routes
// ============================================================

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

// Public Webhook (Razorpay calls this directly without auth)
router.post('/webhook', paymentController.webhook);

// Protected routes
router.use(authenticate);

router.get('/', can('payment.view_all'), paymentController.list);
router.get('/overdue', can('payment.view_all'), paymentController.overdue);

// Core creation & management routes
router.post('/', can('payment.create'), paymentController.recordPayment);
router.post('/razorpay-link', can('payment.create'), paymentController.razorpayLink);
router.put('/:id', can('payment.create'), paymentController.updatePayment);
router.delete('/:id', can('payment.create'), paymentController.deletePayment);

module.exports = router;
