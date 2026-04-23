// ============================================================
// TravelCRM — Website Content Routes
// Protected CRUD for journeys & trending (public read endpoints are in app.js)
// ============================================================

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/website-content.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

// ── Protected Routes (auth + admin permission) ──────────────

router.use(authenticate);

// Journeys CRUD
router.get('/journeys', ctrl.listJourneys);
router.post('/journeys', can('master.manage_destinations'), ctrl.createJourney);
router.get('/journeys/:id', ctrl.getJourney);
router.put('/journeys/:id', can('master.manage_destinations'), ctrl.updateJourney);
router.delete('/journeys/:id', can('master.manage_destinations'), ctrl.deleteJourney);

// Journey day management
router.post('/journeys/:id/days', can('master.manage_destinations'), ctrl.addJourneyDay);
router.put('/journey-days/:dayId', can('master.manage_destinations'), ctrl.updateJourneyDay);
router.delete('/journey-days/:dayId', can('master.manage_destinations'), ctrl.removeJourneyDay);

// Trending destinations CRUD
router.get('/trending', ctrl.listTrending);
router.post('/trending', can('master.manage_destinations'), ctrl.createTrending);
router.put('/trending/:id', can('master.manage_destinations'), ctrl.updateTrending);
router.delete('/trending/:id', can('master.manage_destinations'), ctrl.deleteTrending);

module.exports = router;
