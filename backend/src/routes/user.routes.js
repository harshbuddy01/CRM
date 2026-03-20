// ============================================================
// TravelCRM — User Routes
// ============================================================

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

// Only managers/admins who can edit/assign queries should see the full agent list
router.get('/agents', can('query.edit_all'), userController.getActiveAgents);

module.exports = router;
