// ============================================================
// TravelCRM — Public Portal Routes (No Auth Required)
// Guest Portal, Driver Portal, Hotel Portal APIs
// ============================================================

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/public-portal.controller');
const rateLimit = require('express-rate-limit');

const portalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please slow down.' },
});

router.use(portalLimiter);

// ── Guest Portal ───────────────────────────────────────────
router.post('/guest/login', ctrl.guestLogin);
router.get('/guest/:tourCode', ctrl.getGuestTrip);
router.post('/guest/:tourCode/sos', ctrl.guestSOS);

// ── Driver Portal ──────────────────────────────────────────
router.get('/driver/:driverId', ctrl.getDriverTrips);

// ── Hotel Portal ───────────────────────────────────────────
router.get('/hotel/:hotelName/guests', ctrl.getHotelGuests);

module.exports = router;
