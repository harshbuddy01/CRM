// ============================================================
// TravelCRM — Finance Controller (Sprint 8)
// ============================================================

const financeService = require('../services/finance.service');

// ─── Expenses ────────────────────────────────────────────────
const listExpenses = async (req, res, next) => {
  try {
    const { category, from, to, page, limit } = req.query;
    res.json({ success: true, data: await financeService.listExpenses({ category, from, to, page: parseInt(page) || 1, limit: parseInt(limit) || 50 }) });
  } catch (e) { next(e); }
};
const createExpense = async (req, res, next) => {
  try {
    req.body.recordedBy = req.user.id;
    res.status(201).json({ success: true, data: await financeService.createExpense(req.body) });
  } catch (e) { next(e); }
};
const updateExpense = async (req, res, next) => {
  try { res.json({ success: true, data: await financeService.updateExpense(req.params.id, req.body) }); }
  catch (e) { next(e); }
};
const deleteExpense = async (req, res, next) => {
  try { await financeService.deleteExpense(req.params.id); res.json({ success: true, message: 'Expense deleted' }); }
  catch (e) { next(e); }
};

// ─── Invoices ────────────────────────────────────────────────
const listInvoices = async (req, res, next) => {
  try {
    const { status, queryId, page, limit } = req.query;
    res.json({ success: true, data: await financeService.listInvoices({ status, queryId, page: parseInt(page) || 1, limit: parseInt(limit) || 50 }) });
  } catch (e) { next(e); }
};
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await financeService.getInvoice(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (e) { next(e); }
};
const createInvoice = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    res.status(201).json({ success: true, data: await financeService.createInvoice(req.body) });
  } catch (e) { next(e); }
};
const updateInvoice = async (req, res, next) => {
  try { res.json({ success: true, data: await financeService.updateInvoice(req.params.id, req.body) }); }
  catch (e) { next(e); }
};
const deleteInvoice = async (req, res, next) => {
  try { await financeService.deleteInvoice(req.params.id); res.json({ success: true, message: 'Invoice deleted' }); }
  catch (e) { next(e); }
};
const regenerateInvoice = async (req, res, next) => {
  try { res.json({ success: true, data: await financeService.regenerateInvoice(req.params.id) }); }
  catch (e) { next(e); }
};

// ─── Vendor Payments ─────────────────────────────────────────
const listVendorPayments = async (req, res, next) => {
  try {
    const { from, to, supplierId, page, limit } = req.query;
    res.json({ success: true, data: await financeService.listVendorPayments({ from, to, supplierId, page: parseInt(page) || 1, limit: parseInt(limit) || 50 }) });
  } catch (e) { next(e); }
};
const createVendorPayment = async (req, res, next) => {
  try {
    req.body.recordedBy = req.user.id;
    res.status(201).json({ success: true, data: await financeService.createVendorPayment(req.body) });
  } catch (e) { next(e); }
};
const deleteVendorPayment = async (req, res, next) => {
  try { await financeService.deleteVendorPayment(req.params.id); res.json({ success: true, message: 'Vendor payment deleted' }); }
  catch (e) { next(e); }
};

// ─── P&L Summary ─────────────────────────────────────────────
const getPnlSummary = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    res.json({ success: true, data: await financeService.getPnlSummary(year, month) });
  } catch (e) { next(e); }
};

module.exports = {
  listExpenses, createExpense, updateExpense, deleteExpense,
  listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, regenerateInvoice,
  listVendorPayments, createVendorPayment, deleteVendorPayment,
  getPnlSummary,
};
