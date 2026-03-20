// ============================================================
// TravelCRM — Proposal Routes
// ============================================================

const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposal.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

router.use(authenticate);

// We need a route for GET /v1/proposals/:id
// The routes for POST /v1/queries/:id/proposals will go in query.routes.js 
// or we can structure it here if we mount this file under /v1/proposals. 
// We will build GET /v1/proposals/:id here:
router.get('/:id', proposalController.getProposalById);
router.get('/', can('proposal.view_all'), proposalController.listAllProposals);

// Download PDF
router.get('/:id/pdf', proposalController.downloadPdf);

// Dispatch Notifications (with Idempotency Queue)
router.post('/:id/send-whatsapp', proposalController.sendWhatsapp);
router.post('/:id/send-email', proposalController.sendEmail);

// Logging events (like whatsapp_opened)
router.post('/:id/log/:event', proposalController.logEvent);

module.exports = router;
