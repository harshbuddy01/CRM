const express = require('express');
const router = express.Router();
const orgSettingController = require('../controllers/org-setting.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

// Settings can be viewed by anyone, but updated only by admin
router.get('/', orgSettingController.getAllSettings);
router.get('/:key', orgSettingController.getSettingByKey);
router.post('/', can('users.manage'), orgSettingController.saveSettings);

module.exports = router;
