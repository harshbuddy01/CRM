// ============================================================
// TravelCRM — Tour Dispatch Routes (Hotel/Driver per Day)
// ============================================================

const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/tour-dispatch.controller');
const { authenticate } = require('../middlewares/authenticate');

// Get full dispatch plan (all days with hotel + driver assignments)
router.get('/tours/:id/dispatch', authenticate, dispatchController.getDispatch);

// Assign/update driver for one or more days
router.post('/tours/:id/dispatch/driver', authenticate, dispatchController.assignDriver);

// Assign/update hotel for one or more days (updates BookingService)
router.post('/tours/:id/dispatch/hotel', authenticate, dispatchController.assignHotel);

// Generate guest credentials (username + PIN) — idempotent
router.post('/tours/:id/guest-credentials', authenticate, dispatchController.generateGuestCredentials);
router.post('/tours/:id/send-email', authenticate, dispatchController.sendGuestCredentialsEmail);

module.exports = router;
