// ============================================================
// TravelCRM — Query Routes
// ============================================================

const express = require('express');
const router = express.Router();
const queryController = require('../controllers/query.controller');
const queryValidator = require('../validators/query.validator');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

// ALL routes here are protected and require a valid JWT
router.use(authenticate);

// List queries (can view own OR all, handled inside controller/service)
router.get('/', queryController.list);

// Create query
router.post(
  '/', 
  can('query.create'), 
  queryValidator.validateCreateQuery, 
  queryController.create
);

// Get query details
router.get('/:id', queryController.getById);

// Update query details
router.put(
  '/:id', 
  queryController.update
);

// Assign query to agent (Admin/Manager only typically, depending on role perms)
router.patch(
  '/:id/assign', 
  can('query.assign'), 
  queryValidator.validateAssignQuery, 
  queryController.assign
);

// Soft delete query (Admin/Manager only)
router.delete(
  '/:id', 
  can('query.delete'), 
  queryController.remove
);

module.exports = router;
