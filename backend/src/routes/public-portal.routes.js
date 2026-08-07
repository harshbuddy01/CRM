// ============================================================
// TravelCRM — Public Portal Routes (No Auth Required)
// Guest Portal, Driver Portal, Hotel Portal APIs
// ============================================================

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/public-portal.controller');
const { downloadPdfPublic } = require('./voucher.routes');
const rateLimit = require('express-rate-limit');

const portalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please slow down.' },
});

router.use(portalLimiter);

// ── Guest Portal ───────────────────────────────────────────
router.post('/guest/login', ctrl.guestLogin);
router.get('/guest/:tourCode', ctrl.getGuestTrip);
router.post('/guest/:tourCode/sos', ctrl.guestSOS);
router.post('/guest/:tourCode/transit-details', ctrl.updateGuestTransitDetails);
router.get('/guest/:tourCode/driver-location', ctrl.getDriverLocationForGuest);
router.post('/guest/:tourCode/hotel-request', ctrl.createHotelRequest);
router.get('/guest/:tourCode/hotel-requests', ctrl.getGuestHotelRequests);

// ── Driver Portal ──────────────────────────────────────────
router.post('/driver/login', ctrl.driverLogin);
router.get('/driver/:driverId', ctrl.getDriverTrips);
router.post('/driver/:driverId/ride/start', ctrl.startDriverRide);
router.post('/driver/:driverId/ride/location', ctrl.updateDriverLocation);
router.post('/driver/:driverId/ride/complete', ctrl.completeDriverRide);
router.post('/driver/:driverId/ride/status', ctrl.updateDriverRideStatus);

// ── Hotel Portal ───────────────────────────────────────────
router.post('/hotel/login', ctrl.hotelLogin);
router.get('/hotel/:hotelName/guests', ctrl.getHotelGuests);
router.get('/hotel/:hotelId/requests', ctrl.getHotelRequests);
router.patch('/hotel/:hotelId/requests/:requestId', ctrl.updateHotelRequestStatus);

// ── Voucher Public Download ───────────────────────────────
router.get('/vouchers/:id/download-pdf', downloadPdfPublic);

// ── Booking Service Billing PDF Download ───────────────────
router.get('/booking-services/:id/billing-pdf', async (req, res, next) => {
  try {
    const prisma = require('../config/prisma');
    const service = await prisma.bookingService.findUnique({
      where: { id: req.params.id },
      include: {
        query: true,
      }
    });

    if (!service) return res.status(404).json({ success: false, message: 'Booking service not found' });

    // Fetch payments logged for this query and supplier name
    const payments = await prisma.vendorPayment.findMany({
      where: {
        queryId: service.queryId,
        vendorName: service.supplierName || 'Unknown Supplier',
        deletedAt: null
      },
      orderBy: { paymentDate: 'asc' }
    });

    // Browser page instantiation is handled by standard PDF service

    const checkInStr = service.checkIn ? new Date(service.checkIn).toLocaleDateString('en-IN') : 'TBD';
    const checkOutStr = service.checkOut ? new Date(service.checkOut).toLocaleDateString('en-IN') : 'TBD';
    const serviceDateStr = service.serviceDate ? new Date(service.serviceDate).toLocaleDateString('en-IN') : 'TBD';

    const datesHtml = service.serviceType === 'hotel'
      ? `<p><strong>Check-in:</strong> ${checkInStr} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Check-out:</strong> ${checkOutStr}</p>`
      : `<p><strong>Service Date:</strong> ${serviceDateStr}</p>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Purchase Order & Billing Statement</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #374151; line-height: 1.6; margin: 40px; }
          .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .header h1 { font-size: 24px; color: #1e3a8a; margin: 0; text-transform: uppercase; font-weight: 700; }
          .meta-info { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 14px; }
          .section-title { font-size: 14px; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
          .details-table th, .details-table td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; }
          .details-table th { background-color: #f9fafb; font-weight: bold; color: #1f2937; }
          .total-box { margin-left: auto; width: 250px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; font-size: 14px; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
          .total-row.grand { border-top: 1px solid #e5e7eb; font-weight: bold; font-size: 16px; color: #1e3a8a; margin-top: 8px; padding-top: 8px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Purchase Order</h1>
            <p style="margin: 5px 0 0; color: #4b5563;">IMAGICA HOLIDAYS &bull; Billing Statement</p>
          </div>
          <div style="text-align: right;">
            <p style="font-weight: bold; margin: 0;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
            <p style="margin: 5px 0 0; color: #4b5563;">Ref: PO-${service.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div class="meta-info">
          <div>
            <div class="section-title">Supplier / Vendor</div>
            <p style="margin: 0; font-weight: bold; color: #111827;">${service.supplierName || 'Not set'}</p>
            <p style="margin: 5px 0;">Email: ${service.supplierEmail || '—'}</p>
            <p style="margin: 5px 0;">Phone: ${service.supplierPhone || '—'}</p>
          </div>
          <div>
            <div class="section-title">Guest Details</div>
            <p style="margin: 0; font-weight: bold; color: #111827;">Guest Name: ${service.query?.name || 'Valued Guest'}</p>
            <p style="margin: 5px 0;">Contact: ${service.query?.phone || '—'}</p>
            <p style="margin: 5px 0;">Adults/Children: ${service.query?.adults || 0} / ${service.query?.children || 0}</p>
          </div>
        </div>

        <div class="section-title">Service details</div>
        <div style="font-size: 14px; margin-bottom: 25px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">
          <p style="margin: 0 0 10px; font-weight: bold; font-size: 15px; color: #111827;">${service.serviceName}</p>
          ${datesHtml}
          ${service.notes ? `<p style="margin: 10px 0 0; color: #4b5563;"><strong>Notes:</strong> ${service.notes}</p>` : ''}
        </div>

        <div class="section-title">Billing Summary</div>
        <table class="details-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Rate</th>
              <th>Qty (Units)</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${service.serviceName} reservation cost</td>
              <td>₹${Number(service.ratePerUnit).toLocaleString('en-IN')}/-</td>
              <td>${service.units}</td>
              <td style="text-align: right; font-weight: bold;">₹${Number(service.totalCost).toLocaleString('en-IN')}/-</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">Payment Transaction History</div>
        <table class="details-table">
          <thead>
            <tr>
              <th>Payment Date</th>
              <th>Mode</th>
              <th>Reference ID</th>
              <th style="text-align: right;">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            ${payments.length > 0 
              ? payments.map(p => `
                <tr>
                  <td>${new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                  <td>${p.mode || 'UPI'}</td>
                  <td>${p.referenceId || '—'}</td>
                  <td style="text-align: right; font-weight: bold; color: #16a34a;">₹${Number(p.amount).toLocaleString('en-IN')}/-</td>
                </tr>
              `).join('')
              : `<tr><td colspan="4" style="text-align: center; color: #9ca3af;">No payments recorded yet.</td></tr>`
            }
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 30px;">
          <div style="font-size: 12px; color: #6b7280; width: 300px;">
            <p style="font-weight: bold; margin: 0 0 5px; color: #374151;">Important Note to Supplier:</p>
            <p style="margin: 0;">Please check the dates and details carefully. For queries regarding payments or bookings, contact our reservations desk at reservation@imagicaholidays.com.</p>
          </div>
          <div class="total-box">
            <div class="total-row">
              <span>Total Cost:</span>
              <span>₹${Number(service.totalCost).toLocaleString('en-IN')}</span>
            </div>
            <div class="total-row" style="color: #16a34a;">
              <span>Total Paid:</span>
              <span>₹${Number(service.supplierAmountPaid).toLocaleString('en-IN')}</span>
            </div>
            <div class="total-row grand">
              <span>Pending Balance:</span>
              <span>₹${Number(service.supplierAmountPending).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your partnership &bull; Imagica Holidays</p>
        </div>
      </body>
      </html>
    `;

    const { generatePdfFromHtml } = require('../services/pdf.service');
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase_order_${service.id.substring(0,8)}.pdf`);
    res.send(pdfBuffer);

  } catch (err) { next(err); }
});

module.exports = router;
