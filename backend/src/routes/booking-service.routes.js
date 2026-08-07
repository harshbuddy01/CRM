// ============================================================
// TravelCRM — Booking Service Routes (Sprint 10)
// ============================================================

const express = require('express');
const router = express.Router();
const bookingServiceService = require('../services/booking-service.service');
const { authenticate } = require('../middlewares/authenticate');

// Generate booking services from the confirmed proposal
router.post('/queries/:id/booking-services/generate', authenticate, async (req, res, next) => {
  try {
    const result = await bookingServiceService.generateFromProposal(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// List all booking services for a query
router.get('/queries/:id/booking-services', authenticate, async (req, res, next) => {
  try {
    const services = await bookingServiceService.listByQuery(req.params.id);
    res.json({ success: true, data: services });
  } catch (err) { next(err); }
});

// Update a booking service
router.patch('/booking-services/:id', authenticate, async (req, res, next) => {
  try {
    const service = await bookingServiceService.updateService(req.params.id, req.body);
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
});

// Record a supplier payment
router.post('/booking-services/:id/payments', authenticate, async (req, res, next) => {
  try {
    const service = await bookingServiceService.recordPayment(req.params.id, req.body.amount);
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
});

// Send booking confirmation email to supplier
router.post('/booking-services/:id/send-mail', authenticate, async (req, res, next) => {
  try {
    const service = await bookingServiceService.markMailSent(req.params.id);
    // Also log in email_logs with communicationType = 'supplier'
    const prisma = require('../config/prisma');
    const svc = await prisma.bookingService.findUnique({ where: { id: req.params.id }, include: { query: true } });
    if (svc && svc.supplierEmail) {
      const { sendMail } = require('../config/mailer');
      const datesText = svc.serviceType === 'hotel' 
        ? `Check-in: ${svc.checkIn ? new Date(svc.checkIn).toLocaleDateString('en-IN') : 'TBD'}, Check-out: ${svc.checkOut ? new Date(svc.checkOut).toLocaleDateString('en-IN') : 'TBD'}`
        : `Service Date: ${svc.serviceDate ? new Date(svc.serviceDate).toLocaleDateString('en-IN') : 'TBD'}`;
      
      const formattedBody = req.body.emailBody
        ? req.body.emailBody
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>')
        : `
          <h3>Booking Confirmation Request</h3>
          <p>Dear Partner,</p>
          <p>Please find the booking confirmation request details below:</p>
          <ul>
            <li><strong>Service Name:</strong> ${svc.serviceName}</li>
            <li><strong>Dates/Timings:</strong> ${datesText}</li>
            <li><strong>Guest Name:</strong> ${svc.query?.name || 'Valued Guest'}</li>
            <li><strong>Pax Count:</strong> ${svc.units}</li>
            <li><strong>Notes:</strong> ${svc.notes || '—'}</li>
          </ul>
          <p>Please confirm the booking at your earliest convenience.</p>
          <p>Best regards,<br/>Imagica Holidays</p>
        `;

      const finalHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%); padding: 30px 24px; text-align: center; }
            .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
            .content { padding: 35px 30px; color: #374151; font-size: 15px; line-height: 1.7; }
            .content strong { color: #111827; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BOOKING CONFIRMATION REQUEST</h1>
            </div>
            <div class="content">
              ${formattedBody}
            </div>
            <div class="footer">
              This is an automated request from the Imagica Holidays Booking Portal.
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        await sendMail({
          from: `"Imagica Holidays Reservations" <reservation@imagicaholidays.com>`,
          replyTo: 'reservation@imagicaholidays.com',
          to: svc.supplierEmail,
          subject: `Booking Confirmation Request - ${svc.serviceName}`,
          html: finalHtml,
        });
      } catch (mailErr) {
        console.error('[BookingSendMail] SMTP error:', mailErr.message);
      }

      await prisma.emailLog.create({
        data: {
          queryId: svc.queryId,
          subject: `Booking Confirmation - ${svc.serviceName}`,
          body: (req.body.emailBody || '').replace(/<[^>]*>/g, ''),
          sentBy: req.user.id,
          communicationType: 'supplier',
        },
      });
    }
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
});

module.exports = router;
