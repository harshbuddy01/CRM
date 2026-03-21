// ============================================================
// TravelCRM — Proposal Routes
// ============================================================

const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposal.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

// Download PDF (Public — customer needs to open via WhatsApp/Email)
router.get('/:id/pdf', proposalController.downloadPdf);

// Logging events (like whatsapp_opened - public for customer tracking)
router.post('/:id/log/:event', proposalController.logEvent);

router.use(authenticate);

// We need a route for GET /v1/proposals/:id
// The routes for POST /v1/queries/:id/proposals will go in query.routes.js 
// or we can structure it here if we mount this file under /v1/proposals. 
// We will build GET /v1/proposals/:id here:
router.get('/:id', proposalController.getProposalById);
router.get('/', can('proposal.view_assigned'), proposalController.listAllProposals);

const multer = require('multer');
const upload = require('../middlewares/upload') || multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Dispatch Notifications (with Idempotency Queue or Sync for custom emails)
router.post('/:id/send-whatsapp', proposalController.sendWhatsapp);
router.post('/:id/send-email', upload.single('attachment'), proposalController.sendEmail);

module.exports = router;
