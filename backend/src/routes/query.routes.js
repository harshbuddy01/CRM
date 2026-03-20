// ============================================================
// TravelCRM — Query Routes
// ============================================================

const express = require('express');
const router = express.Router();
const queryController = require('../controllers/query.controller');
const proposalController = require('../controllers/proposal.controller');
const queryValidator = require('../validators/query.validator');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');
const config = require('../config');

// Simple API key guard for public webhook routes
const webhookApiKeyGuard = (req, res, next) => {
  const apiKey = config.webhookApiKey;
  // If no key is configured (dev mode), allow through
  if (!apiKey) return next();
  
  const providedKey = req.headers['x-api-key'];
  if (!providedKey || providedKey !== apiKey) {
    return res.status(401).json({ success: false, message: 'Invalid or missing API key' });
  }
  next();
};

// Public Webhook for external landing pages
router.post('/webhook/website', webhookApiKeyGuard, queryValidator.validateCreateQuery, queryController.createFromWebhook);

// ALL routes from here below are protected and require a valid JWT
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

// Check duplicate phone
router.get('/duplicate-check', queryController.duplicateCheck);

// Get query details
router.get('/:id', queryController.getById);

// Add note to a query
router.post(
  '/:id/notes',
  can('query.edit_own'),
  queryController.addNote
);

// Delete note
router.delete(
  '/:id/notes/:noteId',
  can('query.edit_own'),
  queryController.deleteNote
);

// --- Proposals ---
router.post(
  '/:id/proposals',
  can('query.edit_own'),
  proposalController.createProposal
);

router.get(
  '/:id/proposals',
  proposalController.getProposalsByQuery
);

// Update query details
router.put(
  '/:id', 
  can('query.edit_own'),
  queryController.update
);

// Change status
router.patch(
  '/:id/status', 
  can('query.status_change'), 
  queryValidator.validateStatusChange,
  queryController.changeStatus
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
