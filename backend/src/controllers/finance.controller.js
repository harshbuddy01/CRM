// ============================================================
// TravelCRM — Finance Controller (Sprint 8)
// ============================================================

const financeService = require('../services/finance.service');
const prisma = require('../config/prisma');
const pdfService = require('../services/pdf.service');

const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const generateInvoiceHtml = (invoice, payments) => {
  const isPaid = invoice.status === 'paid';
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const balanceDue = Math.max(0, Number(invoice.totalAmount) - totalPaid);

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Invoice - ${escapeHtml(invoice.invoiceNumber)}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Dancing+Script:wght@700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        @page { margin: 0; size: A4; }
        body { 
          margin: 0; padding: 40px; 
          font-family: 'EB Garamond', serif; 
          color: #2c2c2c; 
          background: #fdfbf7; 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact;
        }
        .page { 
          width: 100%; min-height: 100vh; position: relative; background: #fff;
          padding: 60px; box-shadow: 0 0 40px rgba(0,0,0,0.05); border: 1px solid #eee;
        }
        
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #d4af37; padding-bottom: 30px; margin-bottom: 40px; }
        .header-left h1 { font-family: 'Playfair Display', serif; font-size: 42px; margin: 0; color: #1a1a1a; letter-spacing: -0.02em; }
        .header-left .tagline { font-family: 'Dancing Script', cursive; font-size: 24px; color: #d4af37; margin-top: 5px; }
        .header-right { text-align: right; }
        .header-right .invoice-title { font-family: 'Playfair Display', serif; font-size: 32px; color: #8b6e4b; font-style: italic; margin: 0; }
        .header-right .inv-number { font-size: 18px; font-weight: 600; margin-top: 5px; color: #555; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 14px; text-transform: uppercase; margin-top: 10px; border: 1px solid #ccc; }
        .status-paid { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
        .status-unpaid { background: #fffbeb; color: #92400e; border-color: #fde68a; }

        .client-info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; }
        .info-block h4 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #a1a1a1; margin: 0 0 10px 0; font-family: sans-serif; }
        .info-block p { margin: 5px 0; font-size: 18px; color: #1a1a1a; font-weight: 500; }
        .info-block .client-name { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { border-bottom: 1px solid #000; padding: 15px 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; font-family: sans-serif; color: #888; }
        td { padding: 20px 10px; border-bottom: 1px dashed #e5e5e5; font-size: 18px; }
        .text-right { text-align: right; }
        .item-desc { font-weight: 600; color: #1a1a1a; }

        .totals-box { width: 350px; float: right; background: #faf9f6; padding: 30px; border: 1px solid #e5e5e5; }
        .totals-row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 18px; }
        .totals-row.grand-total { border-top: 2px solid #d4af37; padding-top: 15px; margin-top: 15px; font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: #1a1a1a; }
        
        .payments { margin-top: 80px; clear: both; }
        .payments h3 { font-family: 'Playfair Display', serif; font-size: 24px; color: #8b6e4b; font-style: italic; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .payments table th { border-bottom: 1px solid #eee; }
        
        .footer { margin-top: 60px; text-align: center; border-top: 1px solid #eee; padding-top: 40px; clear: both;}
        .footer p { font-family: 'Dancing Script', cursive; font-size: 26px; color: #d4af37; margin: 0; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="header-left">
            <h1>TravelCRM</h1>
            <div class="tagline">Curated Journeys</div>
          </div>
          <div class="header-right">
            <h2 class="invoice-title">Tax Invoice</h2>
            <div class="inv-number">${escapeHtml(invoice.invoiceNumber)}</div>
            <div class="status-badge ${isPaid ? 'status-paid' : 'status-unpaid'}">
              ${isPaid ? 'Paid in Full' : 'Balance Due'}
            </div>
          </div>
        </div>

        <div class="client-info">
          <div class="info-block">
            <h4>Billed To</h4>
            <div class="client-name">${escapeHtml(invoice.clientName)}</div>
            ${invoice.clientEmail ? `<p>${escapeHtml(invoice.clientEmail)}</p>` : ''}
            ${invoice.clientPhone ? `<p>${escapeHtml(invoice.clientPhone)}</p>` : ''}
          </div>
          <div class="info-block" style="text-align: right;">
            <h4>Important Dates</h4>
            <p><strong>Issued:</strong> ${invoice.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Due By:</strong> ${invoice.dueDate ? invoice.dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Upon Receipt'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(invoice.items || []).map(item => `
              <tr>
                <td class="item-desc">${escapeHtml(item.description)}</td>
                <td class="text-right">₹${Number(item.amount || invoice.subtotal).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-box">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>₹${Number(invoice.subtotal).toLocaleString('en-IN')}</span>
          </div>
          ${Number(invoice.taxAmount) > 0 ? `
          <div class="totals-row">
            <span>GST (${Number(invoice.taxPercent)}%)</span>
            <span>+ ₹${Number(invoice.taxAmount).toLocaleString('en-IN')}</span>
          </div>
          ` : ''}
          <div class="totals-row grand-total">
            <span>Total</span>
            <span>₹${Number(invoice.totalAmount).toLocaleString('en-IN')}</span>
          </div>
          <div class="totals-row" style="color: #166534; font-weight: 600;">
            <span>Amount Paid</span>
            <span>- ₹${totalPaid.toLocaleString('en-IN')}</span>
          </div>
          <div class="totals-row" style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px; color: ${balanceDue > 0 ? '#92400e' : '#166534'}; font-weight: 700;">
            <span>Balance Due</span>
            <span>₹${balanceDue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style="clear: both;"></div>

        ${payments.length > 0 ? `
        <div class="payments">
          <h3>Payment History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Mode</th>
                <th>Reference (UTR)</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(p => `
                <tr>
                  <td>${p.paymentDate.toLocaleDateString('en-IN')}</td>
                  <td style="text-transform: uppercase;">${escapeHtml(p.mode)}</td>
                  <td>${escapeHtml(p.referenceUtr || '-')}</td>
                  <td class="text-right" style="color: #166534; font-weight: 600;">₹${Number(p.amount).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for choosing us for your journey.</p>
        </div>
      </div>
    </body>
  </html>
  `;
};

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
const downloadInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await financeService.getInvoice(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    // Fetch payments tied to this query to show on the invoice
    const payments = invoice.queryId 
      ? await prisma.payment.findMany({ where: { queryId: invoice.queryId, status: { in: ['verified', 'banked'] }, deletedAt: null } })
      : [];
      
    const htmlContent = generateInvoiceHtml(invoice, payments);
    const pdfBuffer = await pdfService.generatePdfFromHtml(htmlContent);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (e) {
    next(e);
  }
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
  listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, regenerateInvoice, downloadInvoicePdf,
  listVendorPayments, createVendorPayment, deleteVendorPayment,
  getPnlSummary,
};
