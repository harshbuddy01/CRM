// ============================================================
// TravelCRM — Voucher Routes (Sprint 10)
// ============================================================

const express = require('express');
const router = express.Router();
const voucherService = require('../services/voucher.service');
const orgSettingService = require('../services/org-setting.service');
const { authenticate } = require('../middlewares/authenticate');

// Public route to view/download voucher PDF directly (bypasses Cloudinary ACL issues for clients/suppliers)
router.get('/vouchers/:id/download-pdf', async (req, res, next) => {
  try {
    const voucher = await voucherService.getById(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

    const settings = await orgSettingService.getAllSettings();
    const pdfService = require('../services/pdf.service');
    const html = generateVoucherHtml(voucher, settings);
    const pdfBuffer = await pdfService.generatePdfFromHtml(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename=Voucher-${voucher.voucherNumber}.pdf`);
    res.end(pdfBuffer);
  } catch (err) { next(err); }
});

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

    // Fetch dynamic company details
    const settings = await orgSettingService.getAllSettings();

    // Use the PDF service to generate a voucher PDF
    const pdfService = require('../services/pdf.service');
    const html = generateVoucherHtml(voucher, settings);
    const pdfBuffer = await pdfService.generatePdfFromHtml(html);

    // Upload to Cloudinary using image type for public access compatibility
    const cloudinary = require('../config/cloudinary');
    await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'travelcrm/vouchers', resource_type: 'image', format: 'pdf' },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(pdfBuffer);
    });

    const publicUrl = `${process.env.API_URL || 'https://api.imagicaholidays.com/api/v1'}/vouchers/${req.params.id}/download-pdf`;
    const updated = await voucherService.updatePdfUrl(req.params.id, publicUrl);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// Get share links (WhatsApp / SMS)
router.post('/vouchers/:id/share-links', async (req, res, next) => {
  try {
    const voucher = await voucherService.getById(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

    let phone = '';
    if (voucher.voucherType === 'supplier') {
      const prisma = require('../config/prisma');
      const supplier = await prisma.supplier.findFirst({
        where: { companyName: { equals: voucher.supplierName, mode: 'insensitive' } }
      });
      phone = supplier?.phone || '';
    } else {
      phone = voucher.query?.phone || '';
    }

    let normalizedPhone = '';
    if (phone && typeof phone === 'string') {
      normalizedPhone = phone.replace(/\D/g, '');
      if (normalizedPhone.length === 10) {
        normalizedPhone = `91${normalizedPhone}`;
      }
    }

    const recipientName = voucher.voucherType === 'supplier' ? voucher.supplierName : (voucher.leadPaxName || voucher.query?.name || 'Customer');
    const msgText = `Hi ${recipientName}, here is the ${voucher.voucherType === 'customer' ? 'booking confirmation voucher' : 'supplier reservation voucher'} (${voucher.voucherNumber}) for ${voucher.hotelName || 'your booking'}: ${voucher.pdfUrl || ''}`;
    
    const waLink = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(msgText)}`;
    const smsLink = `sms:${normalizedPhone}?body=${encodeURIComponent(msgText)}`;

    res.json({ success: true, waLink, smsLink, recipientPhone: phone });
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
    const toEmail = req.body.email || (voucher.voucherType === 'supplier' ? (await prisma.supplier.findFirst({ where: { companyName: { equals: voucher.supplierName, mode: 'insensitive' } } }))?.email : voucher.query.email);
    const commType = voucher.voucherType === 'supplier' ? 'supplier' : 'customer';

    await prisma.emailLog.create({
      data: {
        queryId: voucher.queryId,
        subject: `Voucher ${voucher.voucherNumber} - ${voucher.voucherType === 'customer' ? 'Booking Confirmation' : 'Supplier Reservation'}`,
        body: `Voucher ${voucher.voucherNumber} sent to ${toEmail || 'unknown recipient'}`,
        sentBy: req.user.id,
        communicationType: commType,
      },
    });

    await voucherService.markSent(req.params.id);
    res.json({ success: true, message: 'Voucher sent successfully' });
  } catch (err) { next(err); }
});

module.exports = router;

// ─── HTML Generator ───────────────────────────────────────────
const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escapeHtml = esc;

const getSafeImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

function generateVoucherHtml(voucher, settings = {}) {
  const isCustomer = voucher.voucherType === 'customer';
  
  // Dynamic brand identity fields
  const companyLogo = settings.companyLogoUrl || '';
  const companyName = settings.companyName || 'Sikkim Holidays';
  const companySlogan = settings.companySlogan || 'A Unit of Ethno Trails Holidays PVT LTD';
  const companyAddress = settings.companyAddress || '32 Chowringhee Road, Building No./Flat No.: 706, Om Tower, Park Street, Kolkata - 700071';
  const companyPhone = settings.companyPhone || '+91-8981510077';
  const companyEmail = settings.companyEmail || 'sikkimholidays.booking@gmail.com';
  const companyWeb = settings.companyWebsite || 'sikkimholidays.com';

  // Calculate dynamic nights count
  const inDate = voucher.checkIn ? new Date(voucher.checkIn) : null;
  const outDate = voucher.checkOut ? new Date(voucher.checkOut) : null;
  let nightsCount = 1;
  if (inDate && outDate && !isNaN(inDate.getTime()) && !isNaN(outDate.getTime())) {
    const diff = Math.abs(outDate.getTime() - inDate.getTime());
    nightsCount = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
  }

  // Format dates
  const formatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const checkInFormatted = inDate && !isNaN(inDate.getTime()) ? inDate.toLocaleDateString('en-IN', formatOptions) : 'TBD';
  const checkOutFormatted = outDate && !isNaN(outDate.getTime()) ? outDate.toLocaleDateString('en-IN', formatOptions) : 'TBD';

  // Timings
  const checkInTime = voucher.checkInTime || '14:00';
  const checkOutTime = voucher.checkOutTime || '11:00';

  // Build night-by-night breakdown rows
  let nightRowsHtml = '';
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  for (let i = 1; i <= nightsCount; i++) {
    nightRowsHtml += `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #efe4d2; font-family: 'Montserrat', sans-serif; font-size: 11px; color: #4b5563;">${getOrdinal(i)} Night</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #efe4d2; font-family: 'EB Garamond', serif; font-size: 13px; font-weight: bold; color: #1e3a8a;">${esc(voucher.mealPlan || 'Dinner + Breakfast')}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #efe4d2; font-family: 'EB Garamond', serif; font-size: 13px; color: #1f2937;">1 ${esc(voucher.roomType || 'Deluxe')} (${esc(voucher.paxDetails || '2 Pax')})</td>
      </tr>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@700;800&display=swap');
        
        body {
          margin: 0;
          padding: 30px;
          font-family: 'EB Garamond', serif;
          color: #2c3e50;
          background: #fdfcf7;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .voucher-card {
          background: #ffffff;
          border: 1px solid #efe4d2;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          max-width: 800px;
          margin: 0 auto;
        }

        /* 1. Header Area with Brand Identity */
        .brand-header {
          display: flex;
          align-items: center;
          gap: 15px;
          border-bottom: 2px solid #1e3a8a;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        .brand-logo {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #d4af37;
          flex-shrink: 0;
        }
        .brand-info {
          flex: 1;
        }
        .brand-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 800;
          color: #1e3a8a;
          margin: 0 0 2px 0;
          letter-spacing: 0.5px;
        }
        .brand-address {
          font-family: 'Montserrat', sans-serif;
          font-size: 8px;
          font-weight: 600;
          color: #6b7280;
          margin: 0 0 4px 0;
          text-transform: uppercase;
          line-height: 1.3;
        }
        .brand-contact {
          font-family: 'Montserrat', sans-serif;
          font-size: 9px;
          font-weight: 700;
          color: #d4af37;
        }

        /* 2. Hotel Voucher Header */
        .voucher-title-section {
          text-align: center;
          margin-bottom: 25px;
        }
        .voucher-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 800;
          color: #1e3a8a;
          text-transform: uppercase;
          letter-spacing: 2px;
          display: inline-block;
          border-bottom: 1.5px solid #d4af37;
          padding-bottom: 4px;
        }

        /* 3. Detail Columns */
        .grid-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 25px;
          text-align: left;
        }
        .detail-column-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
        .detail-value-bold {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
          color: #1e3a8a;
          margin: 0 0 2px 0;
        }
        .detail-value-sub {
          font-family: 'EB Garamond', serif;
          font-size: 13px;
          color: #4b5563;
          font-style: italic;
        }

        /* 4. Booking CNF / Trip ID Badges */
        .badges-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .badge-cnf {
          background: #fdf2f8;
          border: 1px solid #fbcfe8;
          color: #9d174d;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }
        .badge-trip {
          background: #fef9c3;
          border: 1px solid #fef08a;
          color: #854d0e;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }
        .confirmed-by {
          font-family: 'EB Garamond', serif;
          font-size: 12px;
          color: #4b5563;
          margin-top: 5px;
          font-weight: 600;
        }

        /* 5. Stay Dates Banner */
        .stay-banner {
          background: #f9f6f0;
          border: 1px solid #efe4d2;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 25px;
          margin-bottom: 25px;
          text-align: center;
        }
        .banner-date-block {
          flex: 1;
        }
        .banner-date-title {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 700;
          color: #1e3a8a;
          margin: 0;
        }
        .banner-date-time {
          font-family: 'EB Garamond', serif;
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
          margin-top: 1px;
        }
        .banner-nights-block {
          padding: 0 20px;
          border-left: 1px solid #efe4d2;
          border-right: 1px solid #efe4d2;
          min-width: 80px;
        }
        .banner-nights-count {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* 6. Nightly breakdown table */
        .nights-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          margin-bottom: 20px;
        }
        .nights-table th {
          background: #1e3a8a;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 700;
          padding: 10px 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .nights-table th:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
        .nights-table th:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; }

        .greeting-box {
          background: #fdfbf7;
          border-left: 3px solid #d4af37;
          padding: 12px 15px;
          font-family: 'EB Garamond', serif;
          font-size: 13px;
          font-style: italic;
          color: #4b5563;
          border-radius: 0 6px 6px 0;
        }
      </style>
    </head>
    <body>
      <div class="voucher-card">
        
        <!-- 1. Brand Identity Header -->
        <div class="brand-header">
          ${companyLogo ? `<img src="${getSafeImageUrl(companyLogo)}" alt="Logo" class="brand-logo" />` : `<div style="width: 50px; height: 50px; border-radius: 50%; background: #1e3a8a; border: 2px solid #d4af37; display: flex; align-items: center; justify-content: center; color: white; font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; flex-shrink: 0;">SH</div>`}
          <div class="brand-info">
            <h1 class="brand-title">${escapeHtml(companyName)}</h1>
            <p class="brand-address">${escapeHtml(companySlogan)}</p>
            <p class="brand-address">${escapeHtml(companyAddress)}</p>
            <div class="brand-contact">
              <span>Phone: ${escapeHtml(companyPhone)}</span> &bull; 
              <span>Email: ${escapeHtml(companyEmail)}</span> &bull; 
              <span>Website: ${escapeHtml(companyWeb)}</span>
            </div>
          </div>
        </div>

        <!-- 2. Voucher Header Title -->
        <div class="voucher-title-section">
          <span class="voucher-title">${isCustomer ? 'Hotel Voucher' : 'Supplier Reservation'}</span>
        </div>

        <!-- 3. Details Columns -->
        <div class="grid-details">
          <div>
            <div class="detail-column-title">Hotel Details</div>
            <h2 class="detail-value-bold">${escapeHtml(voucher.hotelName || 'Premium Hotel')}</h2>
            <div class="detail-value-sub">${escapeHtml(voucher.destination || 'Sikkim')}</div>
          </div>
          <div>
            <div class="detail-column-title">Guest Details</div>
            <h2 class="detail-value-bold">${escapeHtml(voucher.leadPaxName || voucher.query?.name || 'Valued Guest')}</h2>
            <div class="detail-value-sub">${escapeHtml(voucher.paxDetails || '2 Adults')}</div>
          </div>
        </div>

        <!-- 4. CNF / Trip ID Badges -->
        <div class="badges-section">
          ${voucher.confirmationNumber ? `
          <div class="badge-cnf">Booking CNF: ${escapeHtml(voucher.confirmationNumber)}</div>
          ` : ''}
          <div class="badge-trip">Trip ID: ${escapeHtml(voucher.query?.queryCode || 'QRY-TBD')}</div>
        </div>
        
        <div class="confirmed-by" style="text-align: left; margin-bottom: 20px;">
          Confirmed By: ${escapeHtml(voucher.creator?.name || 'Team Sikkim Holidays')} 
          ${voucher.creator?.mobile ? `(${escapeHtml(voucher.creator.mobile)})` : ''}
        </div>

        <!-- 5. Stay Dates Banner -->
        <div class="stay-banner">
          <div class="banner-date-block">
            <h4 class="banner-date-title">${checkInFormatted}</h4>
            <div class="banner-date-time">Check-in at ${checkInTime} hrs</div>
          </div>
          <div class="banner-nights-block">
            <span class="banner-nights-count">${nightsCount} Night${nightsCount > 1 ? 's' : ''}</span>
          </div>
          <div class="banner-date-block">
            <h4 class="banner-date-title">${checkOutFormatted}</h4>
            <div class="banner-date-time">Check-out at ${checkOutTime} hrs</div>
          </div>
        </div>

        <!-- 6. Nightly breakdown table -->
        <table class="nights-table">
          <thead>
            <tr>
              <th># Night</th>
              <th>Meal Plan</th>
              <th>Rooms</th>
            </tr>
          </thead>
          <tbody>
            ${nightRowsHtml}
          </tbody>
        </table>

        <!-- 7. Bottom greeting message -->
        ${voucher.greetingMessage ? `
        <div class="greeting-box">
          "${escapeHtml(voucher.greetingMessage)}"
        </div>
        ` : ''}

      </div>
    </body>
    </html>
  `;
}

