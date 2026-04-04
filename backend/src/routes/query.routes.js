// ============================================================
// TravelCRM — Query Routes
// ============================================================

const express = require('express');
const router = express.Router();
const queryController = require('../controllers/query.controller');
const proposalController = require('../controllers/proposal.controller');
const queryService = require('../services/query.service');
const queryValidator = require('../validators/query.validator');
const financeController = require('../controllers/finance.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');
const config = require('../config');

const logger = require('../utils/logger');

// Simple API key guard for public webhook routes
const webhookApiKeyGuard = (req, res, next) => {
  const apiKey = config.webhookApiKey;
  
  // If no key is configured, warn and decide based on environment
  if (!apiKey) {
    if (config.nodeEnv === 'production') {
      logger.error('[Webhook] WEBHOOK_API_KEY is not set — rejecting request in production');
      return res.status(500).json({ success: false, message: 'Webhook is not configured' });
    }
    logger.warn('[Webhook] WEBHOOK_API_KEY is not set — allowing request in development mode');
    return next();
  }
  
  const providedKey = req.headers['x-api-key'];
  if (!providedKey || providedKey !== apiKey) {
    return res.status(401).json({ success: false, message: 'Invalid or missing API key' });
  }
  next();
};

const webhookController = require('../controllers/webhook.controller');

// Public Webhook for external landing pages
router.post('/webhook/website', webhookApiKeyGuard, queryValidator.validateCreateQuery, queryController.createFromWebhook);

// Public Webhooks for external lead sources (WhatsApp, Facebook, Google)
router.post('/webhook/whatsapp', webhookApiKeyGuard, webhookController.createFromWhatsapp);
router.post('/webhook/facebook', webhookController.createFromFacebook); // Facebook verifies via GET challenge
router.get('/webhook/facebook', webhookController.createFromFacebook);  // Facebook subscription verification
router.post('/webhook/google', webhookApiKeyGuard, webhookController.createFromGoogle);

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

router.post(
  '/:id/proposals/insert',
  can('query.edit_own'),
  proposalController.insertFromItinerary
);

router.post(
  '/:id/proposals/new-itinerary',
  can('query.edit_own'),
  proposalController.createWithNewItinerary
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

// Send Email
router.post(
  '/:id/send-email',
  can('query.edit_own'),
  queryController.sendEmail
);

// Send Supplier Emails
router.post(
  '/:id/supplier-email',
  can('query.edit_own'),
  queryController.sendSupplierEmail
);

// Get Email Logs for Query (Sprint 9/10 Bugfix)
router.get('/:id/email-logs', async (req, res, next) => {
  try {
    const canViewAll = req.user.permissions['query.view_all'];
    const query = await queryService.getQueryById(req.params.id, req.user.id, canViewAll);
    if (!query) return res.status(403).json({ success: false, message: 'Access Denied' });

    const prisma = require('../config/prisma');
    const logs = await prisma.emailLog.findMany({
      where: { queryId: req.params.id },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { sentAt: 'desc' }
    });
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
});

// Get History/Activity Logs & Integration Logs for Query (Unified Timeline)
router.get('/:id/history', async (req, res, next) => {
  try {
    const canViewAll = req.user.permissions['query.view_all'];
    const query = await queryService.getQueryById(req.params.id, req.user.id, canViewAll);
    if (!query) return res.status(403).json({ success: false, message: 'Access Denied' });

    const prisma = require('../config/prisma');
    const [activityLogs, integrationLogs, emailLogs] = await Promise.all([
      prisma.activityLog.findMany({
        where: { entityType: 'query', entityId: req.params.id },
        include: { user: { select: { id: true, name: true } } }
      }),
      prisma.integrationLog.findMany({
        where: { relatedId: req.params.id }
      }),
      prisma.emailLog.findMany({
        where: { queryId: req.params.id },
        include: { sender: { select: { id: true, name: true } } }
      })
    ]);

    // Map IntegrationLogs to look like ActivityLogs
    const mappedIntegrations = integrationLogs.map(log => ({
      id: log.id,
      entityType: 'integration',
      entityId: log.relatedId,
      action: `integration.${log.type || 'system'}.${log.status || 'event'}`,
      newValue: log.payload,
      createdAt: log.createdAt,
      user: { name: 'System' }
    }));

    // Map EmailLogs to look like ActivityLogs
    const mappedEmails = emailLogs.map(log => ({
      id: log.id,
      entityType: 'email',
      entityId: log.queryId,
      action: 'integration.email.success', // simplified for timeline
      newValue: { subject: log.subject, to: log.to },
      createdAt: log.sentAt,
      user: log.sender || { name: 'System' }
    }));

    // Merge and Sort by descending created date
    const history = [...activityLogs, ...mappedIntegrations, ...mappedEmails].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ success: true, data: history });
  } catch (err) { next(err); }
});

// Billing Summary (Sprint 10)
router.get('/:id/billing-statement/pdf', authenticate, can('payment.view_all'), financeController.downloadBillingStatementPdf);
router.get('/:id/billing-summary', async (req, res, next) => {
  try {
    const canViewAll = req.user.permissions['query.view_all'];
    const query = await queryService.getQueryById(req.params.id, req.user.id, canViewAll);
    if (!query) return res.status(403).json({ success: false, message: 'Access Denied' });

    const prisma = require('../config/prisma');
    const queryId = req.params.id;

    // Get the latest proposal selling price
    const proposal = await prisma.proposal.findFirst({
      where: { queryId, deletedAt: null },
      orderBy: { version: 'desc' },
      select: { sellingPrice: true, totalCost: true },
    });

    // Customer payments
    const customerPayments = await prisma.payment.findMany({
      where: { queryId, deletedAt: null },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { paymentDate: 'desc' },
    });

    const totalAmount = Number(proposal?.sellingPrice || 0);
    const totalReceived = customerPayments
      .filter(p => p.status === 'verified' || p.status === 'banked')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPending = totalAmount - totalReceived;

    // Supplier side — from BookingServices + VendorPayments
    const bookingServices = await prisma.bookingService.findMany({ where: { queryId } });
    const supplierAmount = bookingServices.reduce((sum, bs) => sum + Number(bs.totalCost), 0);
    const bookingServicePaid = bookingServices.reduce((sum, bs) => sum + Number(bs.supplierAmountPaid), 0);

    // Supplier payments recorded directly against this query
    const vendorPayments = await prisma.vendorPayment.findMany({
      where: { queryId, deletedAt: null },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { paymentDate: 'desc' },
    });
    const vendorPaymentSum = vendorPayments.reduce((sum, vp) => sum + Number(vp.amount), 0);
    // Use vendorPayments as the canonical supplier payment source if present
    const supplierReceived = (vendorPayments && vendorPayments.length > 0) ? vendorPaymentSum : bookingServicePaid;
    const supplierPending = Math.max(0, supplierAmount - supplierReceived);

    const grossProfit = totalAmount - supplierAmount;

    // Check if invoice exists (exclude soft-deleted)
    const invoice = await prisma.invoice.findFirst({
      where: { queryId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, invoiceNumber: true, status: true, totalAmount: true },
    });

    // Tag payments with type for frontend discrimination
    const taggedCustomerPayments = customerPayments.map(p => ({ ...p, _type: 'customer' }));
    const taggedVendorPayments = vendorPayments.map(p => ({ ...p, _type: 'vendor' }));

    res.json({
      success: true,
      data: {
        customer: { totalAmount, totalReceived, totalPending, grossProfit },
        supplier: { supplierAmount, supplierReceived, supplierPending },
        payments: [...taggedCustomerPayments, ...taggedVendorPayments],
        invoice,
      },
    });
  } catch (err) { next(err); }
});

// Temporary Developer Purge Endpoint (Secured by x-purge-secret)
router.delete('/purge-special/:idOrCode', queryController.purge);

module.exports = router;
