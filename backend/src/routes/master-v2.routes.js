const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master-v2.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

const registerMaster = (path, modelName) => {
  router.get(`/${path}`, masterController.getList(modelName));
  router.post(`/${path}`, can('master.manage_destinations'), masterController.create(modelName));
  router.patch(`/${path}/:id`, can('master.manage_destinations'), masterController.update(modelName));
  router.delete(`/${path}/:id`, can('master.manage_destinations'), masterController.remove(modelName));
};

registerMaster('suppliers', 'supplier');
registerMaster('activities', 'activity');
registerMaster('transfers', 'transfer');
registerMaster('room-types', 'roomType');
registerMaster('meal-plans', 'mealPlan');
registerMaster('package-themes', 'packageTheme');

module.exports = router;
