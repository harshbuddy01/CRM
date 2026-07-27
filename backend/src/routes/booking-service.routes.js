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
      await prisma.emailLog.create({
        data: {
          queryId: svc.queryId,
          subject: `Booking Confirmation - ${svc.serviceName}`,
          body: req.body.emailBody || `Booking confirmation for ${svc.serviceName}. Dates: ${svc.checkIn || svc.serviceDate}. Guest: ${svc.query.name}.`,
          sentBy: req.user.id,
          communicationType: 'supplier',
        },
      });
    }
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
});

module.exports = router;
