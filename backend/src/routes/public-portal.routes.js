// ============================================================
// TravelCRM — Public Portal Routes (No Auth Required)
// Guest Portal, Driver Portal, Hotel Portal APIs
// ============================================================

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/public-portal.controller');
const { downloadPdfPublic } = require('./voucher.routes');
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
router.post('/guest/:tourCode/transit-details', ctrl.updateGuestTransitDetails);
router.get('/guest/:tourCode/driver-location', ctrl.getDriverLocationForGuest);
router.post('/guest/:tourCode/hotel-request', ctrl.createHotelRequest);
router.get('/guest/:tourCode/hotel-requests', ctrl.getGuestHotelRequests);

// ── Driver Portal ──────────────────────────────────────────
router.post('/driver/login', ctrl.driverLogin);
router.get('/driver/:driverId', ctrl.getDriverTrips);
router.post('/driver/:driverId/ride/start', ctrl.startDriverRide);
router.post('/driver/:driverId/ride/location', ctrl.updateDriverLocation);
router.post('/driver/:driverId/ride/complete', ctrl.completeDriverRide);
router.post('/driver/:driverId/ride/status', ctrl.updateDriverRideStatus);

// ── Hotel Portal ───────────────────────────────────────────
router.post('/hotel/login', ctrl.hotelLogin);
router.get('/hotel/:hotelName/guests', ctrl.getHotelGuests);
router.get('/hotel/:hotelId/requests', ctrl.getHotelRequests);
router.patch('/hotel/:hotelId/requests/:requestId', ctrl.updateHotelRequestStatus);

// ── Voucher Public Download ───────────────────────────────
router.get('/vouchers/:id/download-pdf', downloadPdfPublic);

module.exports = router;
