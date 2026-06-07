// ============================================================
// TravelCRM — Finance Controller (Sprint 8)
// ============================================================

const financeService = require('../services/finance.service');
const prisma = require('../config/prisma');
const pdfService = require('../services/pdf.service');
const { getArtisanalTemplate, getBillingStatementTemplate } = require('../templates/billingStatement.template');
const orgSettingService = require('../services/org-setting.service');
const cloudinary = require('../config/cloudinary');

const uploadBase64Image = async (base64Str, folder = 'travelcrm/invoices') => {
  if (!base64Str || !base64Str.startsWith('data:image/')) {
    return base64Str;
  }
  try {
    const uploadResult = await cloudinary.uploader.upload(base64Str, {
      folder,
      resource_type: 'auto',
    });
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Failed to upload base64 image to Cloudinary:', error);
    return base64Str;
  }
};

const ensureCloudinaryImages = async (invoice) => {
  let needsUpdate = false;
  const updateData = {};
  const imgFields = ['invoiceHeaderBannerUrl', 'invoiceMiddleBannerUrl', 'invoiceQrCodeUrl', 'invoiceLogoUrl'];
  for (const field of imgFields) {
    if (invoice[field] && invoice[field].startsWith('data:image/')) {
      const cloudinaryUrl = await uploadBase64Image(invoice[field]);
      if (cloudinaryUrl && cloudinaryUrl.startsWith('http')) {
        invoice[field] = cloudinaryUrl;
        updateData[field] = cloudinaryUrl;
        needsUpdate = true;
      }
    }
  }
  if (needsUpdate) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: updateData,
    });
  }
};

const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const getBillingDataForQuery = async (queryId) => {
  const query = await prisma.query.findUnique({ 
    where: { id: queryId },
    include: { assignedUser: true }
  });
  if (!query) return null;

  const proposal = await prisma.proposal.findFirst({
    where: { queryId, deletedAt: null },
    orderBy: { version: 'desc' },
    select: { 
      sellingPrice: true, 
      totalCost: true, 
      markupPct: true,
      itinerary: {
        select: {
          costingBreakdown: true,
          sellingPrice: true,
          totalCost: true,
          markupPct: true
        }
      }
    },
  });

  const customerPayments = await prisma.payment.findMany({
    where: { queryId, deletedAt: null, status: { in: ['verified', 'banked'] } },
    include: { user: { select: { name: true } } },
    orderBy: { paymentDate: 'asc' },
  });

  const orgSettings = await orgSettingService.getAllSettings();

  const tour = await prisma.tour.findFirst({
    where: { queryId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: { tourCode: true }
  });

  const bookingServices = await prisma.bookingService.findMany({ where: { queryId } });
  const vendorPayments = await prisma.vendorPayment.findMany({ where: { queryId, deletedAt: null } });

  const totalAmount = Number(proposal?.sellingPrice || 0);
  const totalReceived = customerPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalPending = Math.max(0, totalAmount - totalReceived);

  const supplierAmount = bookingServices.reduce((sum, bs) => sum + Number(bs.totalCost || 0), 0);
  const supplierReceived = vendorPayments.length > 0 
    ? vendorPayments.reduce((sum, vp) => sum + Number(vp.amount || 0), 0)
    : bookingServices.reduce((sum, bs) => sum + Number(bs.supplierAmountPaid || 0), 0);
  const supplierPending = Math.max(0, supplierAmount - supplierReceived);
  const grossProfit = totalAmount - supplierAmount;

  return {
    query,
    customer: { totalAmount, totalReceived, totalPending, grossProfit },
    supplier: { supplierAmount, supplierReceived, supplierPending },
    payments: customerPayments,
    orgSettings,
    tourCode: tour?.tourCode || null,
    proposal
  };
};

const generateBillingStatementHtml = (data) => {
  const { query, customer, supplier, payments } = data;
  const escape = (str) => escapeHtml(str);

  // Helper to safely format numbers
  const fmt = (num) => {
    if (num === null || num === undefined || isNaN(Number(num))) return '0';
    return Number(num).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatDate = (date) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    } catch (e) { return '-'; }
  };

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Statement - ${escape(query.name)}</title>
      <style>
        @page { margin: 15mm; size: A4; }
        body { 
          margin: 0; padding: 0; 
          font-family: 'Times New Roman', Times, serif; 
          color: #1a1a1a; background: #fff; 
          font-size: 14px; line-height: 1.5; 
        }
        .header { border-bottom: 2px solid #8b6e4b; padding-bottom: 10px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; color: #1a1a1a; }
        .internal-badge { background: #8b6e4b; color: #fff; padding: 3px 8px; font-size: 10px; font-weight: bold; border-radius: 3px; float: right; margin-top: 10px; }
        
        .summary-table { width: 100%; border-collapse: separate; border-spacing: 20px 0; margin-left: -20px; margin-bottom: 30px; }
        .summary-table td { width: 50%; vertical-align: top; }
        
        .card { border: 1px solid #e5e3da; background: #faf9f6; padding: 15px; border-radius: 5px; }
        .card h3 { margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #e5e3da; padding-bottom: 5px; color: #5d4037; }
        
        .row { display: block; margin-bottom: 5px; overflow: hidden; }
        .row span:first-child { float: left; color: #666; }
        .row span:last-child { float: right; font-weight: bold; }
        
        .total-row { margin-top: 10px; border-top: 1px solid #d4af37; padding-top: 8px; font-size: 16px; }
        
        .profit-box { background: #e8f5e9; padding: 15px; border-radius: 5px; border: 1px solid #c8e6c9; margin: 20px 0; overflow: hidden; }
        .profit-box span:first-child { font-size: 18px; font-weight: bold; color: #2e7d32; }
        .profit-box span:last-child { float: right; font-size: 20px; font-weight: bold; color: #1b5e20; }

        .section-title { font-size: 18px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #8b6e4b; }
        
        table.ledger { width: 100%; border-collapse: collapse; }
        table.ledger th { text-align: left; background: #f5f5f5; padding: 8px; border-bottom: 1px solid #333; font-size: 12px; }
        table.ledger td { padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
        .text-right { text-align: right; }
        
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
        @media print {
          body { zoom: 0.98; } /* Slight downscale for consistent fit */
          img { max-height: 500px; object-fit: contain; } /* Compress icons/logos */
        }
      </style>
    </head>
    <body>
      <div class="internal-badge">INTERNAL AGENT RECORD</div>
      <div class="header">
        <h1>Billing Statement</h1>
        <p style="margin:5px 0 0 0;">
          <strong>ID:</strong> ${escape(query.queryCode || query.id.slice(0,8))} | 
          <strong>Client:</strong> ${escape(query.name)}
        </p>
      </div>

      <table class="summary-table">
        <tr>
          <td>
            <div class="card">
              <h3>Customer Side</h3>
              <div class="row"><span>Total Package Cost</span> <span>₹${fmt(customer.totalAmount)}</span></div>
              <div class="row" style="color: #2e7d32;"><span>Total Received</span> <span>- ₹${fmt(customer.totalReceived)}</span></div>
              <div class="row total-row" style="color: ${customer.totalPending > 0 ? '#b71c1c' : '#2e7d32'};">
                <span>Pending Balance</span> <span>₹${fmt(customer.totalPending)}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="card">
              <h3>Supplier Side</h3>
              <div class="row"><span>Total Supplier Cost</span> <span>₹${fmt(supplier.supplierAmount)}</span></div>
              <div class="row" style="color: #2e7d32;"><span>Paid to Suppliers</span> <span>- ₹${fmt(supplier.supplierReceived)}</span></div>
              <div class="row total-row" style="color: ${supplier.supplierPending > 0 ? '#b71c1c' : '#2e7d32'};">
                <span>Supplier Pending</span> <span>₹${fmt(supplier.supplierPending)}</span>
              </div>
            </div>
          </td>
        </tr>
      </table>

      <div class="profit-box">
        <span>GROSS PROFIT MARGIN</span>
        <span>₹${fmt(customer.grossProfit)}</span>
      </div>

      <div class="section-title">Verified Payment History</div>
      <table class="ledger">
        <thead>
          <tr>
            <th>Date</th>
            <th>Mode</th>
            <th>Reference Code (UTR)</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(p => `
            <tr>
              <td>${formatDate(p.paymentDate)}</td>
              <td style="text-transform:uppercase;">${escape(p.mode)}</td>
              <td>${escape(p.referenceUtr || p.referenceId || '-')}</td>
              <td class="text-right" style="font-weight:bold; color: #1b5e20;">₹${fmt(p.amount)}</td>
            </tr>
          `).join('')}
          ${payments.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:20px; color:#999;">No verified payments recorded yet.</td></tr>' : ''}
        </tbody>
      </table>

      <div class="footer">
        Generated on ${new Date().toLocaleString('en-IN')} • Secure Internal Record • TravelCRM
      </div>
    </body>
  </html>
  `;
};


const downloadBillingStatementPdf = async (req, res, next) => {
  try {
    const queryId = req.params.id;
    const canViewAll = req.user?.permissions?.['query.view_all'] || false;
    
    const billingData = await getBillingDataForQuery(queryId);
    if (!billingData) return res.status(404).json({ success: false, message: 'Query not found' });

    // Ownership check: only the assigned user or admins can generate this PDF
    if (!canViewAll && billingData.query.assignedTo !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not have access to this billing statement' });
    }

    const html = getBillingStatementTemplate({
      ...billingData,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    });

    const pdfBuffer = await pdfService.generatePdfFromHtml(html);
    const buffer = Buffer.from(pdfBuffer);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': `attachment; filename="Billing-Statement-${billingData.query.queryCode || queryId.slice(0,8)}.pdf"`,
    });
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

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
        @media print {
          body { zoom: 0.95; }
          img { max-height: 500px; object-fit: contain; }
        }
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
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    // Auto-clean base64 strings to prevent Puppeteer crash / A4 bloat
    await ensureCloudinaryImages(invoice);
    
    if (invoice.queryId) {
      const billingData = await getBillingDataForQuery(invoice.queryId);
      if (billingData) {
        const html = getArtisanalTemplate({
          ...billingData,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          invoiceHeaderBannerUrl: invoice.invoiceHeaderBannerUrl,
          invoiceMiddleBannerUrl: invoice.invoiceMiddleBannerUrl,
          invoiceQrCodeUrl: invoice.invoiceQrCodeUrl,
          invoiceLogoUrl: invoice.invoiceLogoUrl,
        });
        const pdfBuffer = await pdfService.generatePdfFromHtml(html);
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Length': pdfBuffer.length,
          'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        });
        return res.send(pdfBuffer);
      }
    }
      
    // Fallback if not linked to a query
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

const getInvoiceHtml = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    // Auto-clean base64 strings to prevent Puppeteer crash / A4 bloat
    await ensureCloudinaryImages(invoice);
    
    if (invoice.queryId) {
      const billingData = await getBillingDataForQuery(invoice.queryId);
      if (billingData) {
        const html = getArtisanalTemplate({
          ...billingData,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          invoiceHeaderBannerUrl: invoice.invoiceHeaderBannerUrl,
          invoiceMiddleBannerUrl: invoice.invoiceMiddleBannerUrl,
          invoiceQrCodeUrl: invoice.invoiceQrCodeUrl,
          invoiceLogoUrl: invoice.invoiceLogoUrl,
        });
        res.set('Content-Type', 'text/html');
        return res.send(html);
      }
    }
      
    // Fallback
    const payments = invoice.queryId 
      ? await prisma.payment.findMany({ where: { queryId: invoice.queryId, status: { in: ['verified', 'banked'] }, deletedAt: null } })
      : [];
    const htmlContent = generateInvoiceHtml(invoice, payments);
    res.set('Content-Type', 'text/html');
    res.send(htmlContent);
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
  listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, regenerateInvoice, downloadInvoicePdf, getInvoiceHtml,
  listVendorPayments, createVendorPayment, deleteVendorPayment,
  getPnlSummary, downloadBillingStatementPdf,
};
