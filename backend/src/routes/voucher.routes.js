// ============================================================
// TravelCRM — Voucher Routes (Sprint 10)
// ============================================================

const express = require('express');
const router = express.Router();
const voucherService = require('../services/voucher.service');
const { authenticate } = require('../middlewares/authenticate');

router.use(authenticate);

// List vouchers for a query
router.get('/queries/:id/vouchers', async (req, res, next) => {
  try {
    const vouchers = await voucherService.listByQuery(req.params.id);
    res.json({ success: true, data: vouchers });
  } catch (err) { next(err); }
});

// Create a new voucher
router.post('/queries/:id/vouchers', async (req, res, next) => {
  try {
    const voucher = await voucherService.createVoucher({
      ...req.body,
      queryId: req.params.id,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: voucher });
  } catch (err) { next(err); }
});

// Generate voucher PDF
router.post('/vouchers/:id/generate-pdf', async (req, res, next) => {
  try {
    const voucher = await voucherService.getById(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

    // Use the PDF service to generate a voucher PDF
    const pdfService = require('../services/pdf.service');
    const html = generateVoucherHtml(voucher);
    const pdfBuffer = await pdfService.generatePdfFromHtml(html);

    // Upload to Cloudinary
    const cloudinary = require('cloudinary').v2;
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'travelcrm/vouchers', resource_type: 'raw', format: 'pdf' },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(pdfBuffer);
    });

    const updated = await voucherService.updatePdfUrl(req.params.id, result.secure_url);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// Send voucher by email
router.post('/vouchers/:id/send', async (req, res, next) => {
  try {
    const voucher = await voucherService.getById(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    if (!voucher.pdfUrl) return res.status(400).json({ success: false, message: 'Generate PDF first' });

    // Log the email
    const prisma = require('../config/prisma');
    const toEmail = req.body.email || voucher.query.email;
    const commType = voucher.voucherType === 'supplier' ? 'supplier' : 'customer';

    await prisma.emailLog.create({
      data: {
        queryId: voucher.queryId,
        subject: `Voucher ${voucher.voucherNumber} - ${voucher.voucherType === 'customer' ? 'Booking Confirmation' : 'Supplier Reservation'}`,
        body: `Voucher ${voucher.voucherNumber} sent to ${toEmail}`,
        sentBy: req.user.id,
        communicationType: commType,
      },
    });

    await voucherService.markSent(req.params.id);
    res.json({ success: true, message: 'Voucher sent successfully' });
  } catch (err) { next(err); }
});

module.exports = router;

// ─── Helper ──────────────────────────────────────────────────
function generateVoucherHtml(voucher) {
  const isCustomer = voucher.voucherType === 'customer';
  return `
    <html>
    <head><style>
      body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
      .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
      .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
      .header p { color: #666; margin: 5px 0; }
      .voucher-number { background: #f0f4ff; padding: 10px 20px; border-radius: 8px; display: inline-block; font-weight: bold; color: #2563eb; }
      .section { margin: 20px 0; }
      .section h3 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
      td:first-child { font-weight: 600; width: 40%; color: #555; }
      .greeting { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; font-style: italic; }
    </style></head>
    <body>
      <div class="header">
        <h1>${isCustomer ? 'Booking Confirmation' : 'Supplier Reservation Voucher'}</h1>
        <p class="voucher-number">${voucher.voucherNumber}</p>
      </div>
      <div class="section">
        <h3>${isCustomer ? 'Guest Details' : 'Reservation Details'}</h3>
        <table>
          ${voucher.leadPaxName ? `<tr><td>Guest Name</td><td>${voucher.leadPaxName}</td></tr>` : ''}
          ${voucher.paxDetails ? `<tr><td>Pax</td><td>${voucher.paxDetails}</td></tr>` : ''}
          ${voucher.destination ? `<tr><td>Destination</td><td>${voucher.destination}</td></tr>` : ''}
          ${voucher.hotelName ? `<tr><td>Hotel</td><td>${voucher.hotelName}</td></tr>` : ''}
          ${voucher.supplierName ? `<tr><td>Supplier</td><td>${voucher.supplierName}</td></tr>` : ''}
          ${voucher.checkIn ? `<tr><td>Check-in</td><td>${new Date(voucher.checkIn).toLocaleDateString()}</td></tr>` : ''}
          ${voucher.checkOut ? `<tr><td>Check-out</td><td>${new Date(voucher.checkOut).toLocaleDateString()}</td></tr>` : ''}
          ${voucher.roomType ? `<tr><td>Room Type</td><td>${voucher.roomType}</td></tr>` : ''}
          ${voucher.mealPlan ? `<tr><td>Meal Plan</td><td>${voucher.mealPlan}</td></tr>` : ''}
          ${voucher.confirmationNumber ? `<tr><td>Confirmation #</td><td>${voucher.confirmationNumber}</td></tr>` : ''}
        </table>
      </div>
      ${voucher.greetingMessage ? `<div class="greeting">${voucher.greetingMessage}</div>` : ''}
    </body>
    </html>
  `;
}
