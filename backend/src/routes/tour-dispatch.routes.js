// ============================================================
// TravelCRM — Tour Dispatch Routes (Hotel/Driver per Day)
// ============================================================

const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/tour-dispatch.controller');
const { authenticate } = require('../middlewares/authenticate');

router.use(authenticate);

// Get full dispatch plan (all days with hotel + driver assignments)
router.get('/tours/:id/dispatch', dispatchController.getDispatch);

// Assign/update driver for one or more days
router.post('/tours/:id/dispatch/driver', dispatchController.assignDriver);

// Assign/update hotel for one or more days (updates BookingService)
router.post('/tours/:id/dispatch/hotel', dispatchController.assignHotel);

// Generate guest credentials (username + PIN) — idempotent
router.post('/tours/:id/guest-credentials', dispatchController.generateGuestCredentials);

module.exports = router;
