const express = require('express');
const router = express.Router();
const b2bCommissionController = require('../controllers/b2b-commission.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Apply authentication middleware
router.use(authenticate);

// Note: This router is mounted on /agents in app.js
// So the paths are relative to /agents
router.get('/:agentId/commissions', b2bCommissionController.getCommissionsByAgent);
router.post('/:agentId/commissions', b2bCommissionController.createCommission);
router.get('/:agentId/commission-summary', b2bCommissionController.getCommissionSummary);

// For updating a specific commission (no agentId needed in path typically, but mounted on /agents)
router.put('/commissions/:id', b2bCommissionController.updateCommission);

module.exports = router;
