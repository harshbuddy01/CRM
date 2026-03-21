const express = require('express');
const router = express.Router();
const statusSettingController = require('../controllers/status-setting.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

// Everyone can view status settings (frontend relies on this)
router.get('/', statusSettingController.getAllStatuses);

// Only admins can modify status colors/labels or trigger seeding
router.patch('/:code', can('users.manage'), statusSettingController.updateStatusSetting);
router.post('/seed', can('users.manage'), statusSettingController.seedStatuses);

module.exports = router;
