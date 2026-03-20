// ============================================================
// TravelCRM — Report Routes
// ============================================================

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/authenticate');

router.use(authenticate);

// Everyone gets their dashboard; logic shifts based on view_all permissions
router.get('/dashboard', reportController.getDashboardData);

module.exports = router;
