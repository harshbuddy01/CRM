// ============================================================
// TravelCRM — Driver Master Routes
// ============================================================

const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

// Driver Master CRUD
router.get('/', driverController.list);
router.post('/', driverController.create);
router.patch('/:id', driverController.update);
router.delete('/:id', driverController.remove);
router.post('/:id/credentials', can('master.manage_vendors'), driverController.generateDriverCredentials);
router.post('/:id/send-credentials', can('master.manage_vendors'), driverController.sendDriverCredentialsEmail);

module.exports = router;
