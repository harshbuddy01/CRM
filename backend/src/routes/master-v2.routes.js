// ============================================================
// TravelCRM — Master V2 Routes (Sprint 7)
// ============================================================

const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master-v2.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

// Destinations dropdown (for forms)
router.get('/destinations', masterController.getDestinations);

const registerMaster = (path, modelName, permission = 'master.manage_destinations') => {
  router.get(`/${path}`,     masterController.getList(modelName));
  router.post(`/${path}`,    can(permission), masterController.create(modelName));
  router.patch(`/${path}/:id`, can(permission), masterController.update(modelName));
  router.delete(`/${path}/:id`, can(permission), masterController.remove(modelName));
};

registerMaster('suppliers',            'supplier', 'master.manage_vendors');
registerMaster('activities',           'activity', 'master.manage_destinations');
registerMaster('transfers',            'transfer', 'master.manage_destinations');
registerMaster('room-types',           'roomType', 'master.manage_hotels');
registerMaster('meal-plans',           'mealPlan', 'master.manage_hotels');
registerMaster('package-themes',       'packageTheme', 'master.manage_destinations');
registerMaster('day-itinerary-templates', 'dayItineraryTemplate', 'master.manage_destinations');
registerMaster('destinations',         'destination', 'master.manage_destinations');
registerMaster('gallery-images',       'galleryImage', 'master.manage_destinations');

module.exports = router;
