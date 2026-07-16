// ============================================================
// TravelCRM — Master Routes
// ============================================================

const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

// --- Destinations ---
router.get('/destinations', masterController.getDestinations);
router.post('/destinations', can('master.manage_destinations'), masterController.createDestination);
router.put('/destinations/:id', can('master.manage_destinations'), masterController.updateDestination);
router.delete('/destinations/:id', can('master.manage_destinations'), masterController.deleteDestination);

// --- Hotels ---
router.get('/hotels', masterController.getHotels);
router.post('/hotels', can('master.manage_hotels'), masterController.createHotel);
router.put('/hotels/:id', can('master.manage_hotels'), masterController.updateHotel);
router.delete('/hotels/:id', can('master.manage_hotels'), masterController.deleteHotel);
router.post('/hotels/:id/credentials', can('master.manage_hotels'), masterController.generateHotelCredentials);
router.post('/hotels/:id/send-credentials', can('master.manage_hotels'), masterController.sendHotelCredentialsEmail);

module.exports = router;
