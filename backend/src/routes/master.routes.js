// ============================================================
// TravelCRM — Master Routes
// ============================================================

const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can, canAny } = require('../middlewares/can');

router.use(authenticate);

// --- Destinations ---
router.get('/destinations', masterController.getDestinations);
router.post('/destinations', can('master.manage'), masterController.createDestination);
router.put('/destinations/:id', can('master.manage'), masterController.updateDestination);
router.delete('/destinations/:id', can('master.manage'), masterController.deleteDestination);

// --- Hotels ---
router.get('/hotels', masterController.getHotels);
router.post('/hotels', can('master.manage'), masterController.createHotel);
router.put('/hotels/:id', can('master.manage'), masterController.updateHotel);
router.delete('/hotels/:id', can('master.manage'), masterController.deleteHotel);

module.exports = router;
