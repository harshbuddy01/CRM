// ============================================================
// TravelCRM — Tour Controller
// ============================================================

const tourService = require('../services/tour.service');
const { BusinessError } = require('../utils/AppError');

const list = async (req, res, next) => {
  try {
    const filterType = req.query.filterType || (req.query.fieldOnly === 'true' || req.query.fieldOnly === true ? 'field' : (req.query.view || 'all'));
    const isOwnerOrAdmin = ['admin', 'system_owner'].includes(req.user?.role);
    const result = await tourService.listTours({
      ...req.query,
      filterType, // 'ops', 'field', 'all'
      opsUserId: (filterType === 'field' && !isOwnerOrAdmin) ? req.user.id : req.query.opsUserId,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const tour = await tourService.getTourDetails(req.params.id);
    res.json({ success: true, data: tour });
  } catch (error) {
    next(error);
  }
};

const updateOps = async (req, res, next) => {
  try {
    const tourId = req.params.id;
    const tourDetails = await tourService.getTourDetails(tourId);

    // Check role-based permission bypass
    const userEmail = req.user?.email?.toLowerCase().trim();
    const { immortalEmails } = require('../config');
    const isAdminOrOps = ['admin', 'system_owner', 'ops'].includes(req.user?.role) || 
                         immortalEmails.some(e => e.toLowerCase() === userEmail) ||
                         req.user?.permissions?.['tour.edit_all'];

    if (!isAdminOrOps) {
      // If not admin/ops, must be the assigned agent to update status/notes
      if (tourDetails.assignedOps !== req.user.id) {
        throw new BusinessError('You are not assigned to manage this tour');
      }
    }

    const tour = await tourService.updateTourOps(tourId, req.body);
    res.json({ success: true, message: 'Tour updated', data: tour });
  } catch (error) {
    next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      throw new BusinessError('Cancellation reason is required');
    }
    const cancellation = await tourService.cancelTour(req.params.id, req.user.id, reason);
    res.json({ success: true, message: 'Tour cancelled, refund calculated', data: cancellation });
  } catch (error) {
    next(error);
  }
};

const refundEstimate = async (req, res, next) => {
  try {
    const estimate = await tourService.estimateRefund(req.params.id);
    res.json({ success: true, data: estimate });
  } catch (error) {
    next(error);
  }
};

const sendReviewInvite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { testPhone } = req.body;
    const prisma = require('../config/prisma');

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: { query: true }
    });
    if (!tour) throw new BusinessError('Tour not found');

    const rawPhone = testPhone || tour.query?.phone;
    if (!rawPhone) throw new BusinessError('No recipient phone number available');

    let phone = rawPhone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const guestName = tour.query?.name || 'Valued Traveler';
    const destination = tour.query?.destination || 'your destination';
    const reviewUrl = `https://imagicaholidays.com/review/${tour.tourCode}`;
    const nextAttempt = (tour.reviewFollowupCount || 0) + 1;

    let whatsappSent = false;
    let errorDetail = null;

    // Direct WhatsApp Click-to-Chat URL
    const messageText = `Hi ${guestName}, thank you for traveling with Imagica Holidays to ${destination}! We hope you had a memorable holiday. Please share your review here: ${reviewUrl} — Imagica Holidays Team.`;
    const directWaUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

    // Queue Cloud API Template Dispatch
    try {
      const queueService = require('../services/queue.service');
      await queueService.enqueueWhatsappJob(
        tour.id,
        phone,
        'customer_review_invite',
        [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: guestName },
              { type: 'text', text: destination },
              { type: 'text', text: reviewUrl }
            ]
          }
        ]
      );
      whatsappSent = true;
    } catch (err) {
      errorDetail = err.message;
    }

    // Update tour review record
    const updatedTour = await prisma.tour.update({
      where: { id: tour.id },
      data: {
        reviewStatus: 'SENT',
        reviewSentAt: new Date(),
        reviewFollowupCount: nextAttempt
      }
    });

    res.json({
      success: true,
      message: `Review invite dispatched to +${phone}`,
      data: {
        phone,
        reviewUrl,
        directWaUrl,
        messageText,
        reviewStatus: updatedTour.reviewStatus,
        reviewFollowupCount: updatedTour.reviewFollowupCount,
        whatsappSent,
        errorDetail
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  getById,
  updateOps,
  cancel,
  refundEstimate,
  sendReviewInvite,
};
