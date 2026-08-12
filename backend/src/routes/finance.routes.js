// ============================================================
// TravelCRM — Finance Routes (Sprint 8)
// ============================================================

const express = require('express');
const router = express.Router();
const finance = require('../controllers/finance.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

// Public debug route (no auth) — diagnose PDF generation on server
router.get('/debug-pdf-public', finance.debugPdfPublic);
router.get('/public/invoices/:id/download-pdf', finance.downloadInvoicePdf);

router.use(authenticate);

// ─── Expenses ────────────────────────────────────────────────
router.get('/expenses', can('payment.view_all'), finance.listExpenses);
router.post('/expenses', can('payment.view_all'), finance.createExpense);
router.put('/expenses/:id', can('payment.view_all'), finance.updateExpense);
router.delete('/expenses/:id', can('payment.view_all'), finance.deleteExpense);

// ─── Invoices ────────────────────────────────────────────────
router.get('/invoices', can('payment.view_all'), finance.listInvoices);
router.get('/invoices/:id', can('payment.view_all'), finance.getInvoice);
router.post('/invoices', can('payment.view_all'), finance.createInvoice);
router.put('/invoices/:id', can('payment.view_all'), finance.updateInvoice);
router.put('/invoices/:id/regenerate', can('payment.view_all'), finance.regenerateInvoice);
router.get('/invoices/:id/pdf', can('payment.view_all'), finance.downloadInvoicePdf);
router.get('/invoices/:id/html', can('payment.view_all'), finance.getInvoiceHtml);
router.post('/invoices/:id/send-whatsapp', can('payment.view_all'), finance.sendInvoiceWhatsapp);
router.delete('/invoices/:id', can('payment.view_all'), finance.deleteInvoice);

// ─── Vendor Payments ─────────────────────────────────────────
router.get('/vendor-payments', can('payment.view_all'), finance.listVendorPayments);
router.post('/vendor-payments', can('payment.view_all'), finance.createVendorPayment);
router.delete('/vendor-payments/:id', can('payment.view_all'), finance.deleteVendorPayment);

// ─── P&L ─────────────────────────────────────────────────────
router.get('/pnl', can('payment.view_all'), finance.getPnlSummary);

module.exports = router;
