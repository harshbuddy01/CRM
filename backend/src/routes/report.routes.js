// ============================================================
// TravelCRM — Report Routes
// ============================================================

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

// Everyone gets their dashboard; logic shifts based on view_all permissions
router.get('/dashboard', reportController.getDashboardData);

// Detailed reports — require report viewing permission
router.get('/lead-funnel', can('query.view_all'), reportController.getLeadFunnel);
router.get('/sales', can('query.view_all'), reportController.getSales);
router.get('/collections', can('query.view_all'), reportController.getCollections);
router.get('/tours', can('query.view_all'), reportController.getTours);
router.get('/marketing', can('query.view_all'), reportController.getMarketing);

// CSV Export — Admin only
router.get('/:type/csv', can('query.view_all'), reportController.exportCsv);

module.exports = router;
