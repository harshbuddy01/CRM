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
    const { testPhone, testEmail } = req.body;
    const prisma = require('../config/prisma');
    const emailService = require('../services/email.service');

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: { query: true }
    });
    if (!tour) throw new BusinessError('Tour not found');

    const rawPhone = testPhone || tour.query?.phone;
    if (!rawPhone) throw new BusinessError('No recipient phone number available');

    let phone = rawPhone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const recipientEmail = testEmail || tour.query?.email;
    const guestName = tour.query?.name || 'Valued Traveler';
    const destination = tour.query?.destination || 'your destination';
    const reviewUrl = `https://imagicaholidays.com/review/${tour.tourCode}`;
    const nextAttempt = (tour.reviewFollowupCount || 0) + 1;

    let whatsappSent = false;
    let whatsappError = null;
    let emailSent = false;
    let emailError = null;

    // Direct WhatsApp Click-to-Chat URL
    const messageText = `Hi ${guestName}, thank you for traveling with Imagica Holidays to ${destination}! We hope you had a memorable holiday. Please share your review here: ${reviewUrl} — Imagica Holidays Team.`;
    const directWaUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

    // 1. Queue Cloud API Template Dispatch (WhatsApp)
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
      whatsappError = err.message;
    }

    // 2. Dual Dispatch: Send Branded Review Email via Brevo SMTP
    if (recipientEmail) {
      try {
        await emailService.sendReviewInviteEmail({
          to: recipientEmail,
          guestName,
          destination,
          reviewUrl,
          tourCode: tour.tourCode
        });
        emailSent = true;
      } catch (err) {
        emailError = err.message;
      }
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

    // Query Note
    await prisma.queryNote.create({
      data: {
        queryId: tour.queryId,
        userId: req.user.id,
        note: `⭐ Review invite dispatched to +${phone}${recipientEmail ? ` & ${recipientEmail}` : ''}. Link: ${reviewUrl}.`,
        noteType: 'note'
      }
    }).catch(() => {});

    res.json({
      success: true,
      message: `Review invite dispatched to +${phone}${recipientEmail ? ` & ${recipientEmail}` : ''}`,
      data: {
        phone,
        email: recipientEmail,
        reviewUrl,
        directWaUrl,
        messageText,
        reviewStatus: updatedTour.reviewStatus,
        reviewFollowupCount: updatedTour.reviewFollowupCount,
        whatsappSent,
        whatsappError,
        emailSent,
        emailError
      }
    });
  } catch (error) {
    next(error);
  }
};

const sendPretourReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { testPhone, testEmail } = req.body;
    const prisma = require('../config/prisma');
    const emailService = require('../services/email.service');

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        query: true,
        proposal: true,
        payments: { where: { deletedAt: null } }
      }
    });
    if (!tour) throw new BusinessError('Tour not found');

    const rawPhone = testPhone || tour.query?.phone;
    if (!rawPhone) throw new BusinessError('No recipient phone number available');

    let phone = rawPhone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const recipientEmail = testEmail || tour.query?.email;
    const guestName = tour.query?.name || 'Valued Traveler';
    const destination = tour.query?.destination || 'your destination';
    const totalCost = Number(tour.proposal?.sellingPrice || 0);
    const totalPaid = tour.payments.reduce((s, p) => s + Number(p.amount), 0);
    const balanceDue = Math.max(0, totalCost - totalPaid);

    const startDateStr = tour.startDate ? new Date(tour.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'soon';

    let balanceMsg = '';
    if (balanceDue > 0) {
      balanceMsg = `\n\n💳 Friendly Reminder: Your remaining package balance is ₹${balanceDue.toLocaleString('en-IN')}, scheduled prior to departure.`;
    }

    const messageText = `Hi ${guestName}, greetings from Imagica Holidays! 🌟 Are you excited for your upcoming tour to ${destination}? We are finalizing your tour arrangements to ensure a seamless experience. We look forward to hosting you on ${startDateStr}!${balanceMsg}\n\n— Imagica Holidays Team`;
    const directWaUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

    // 1. Queue Cloud API template if available (WhatsApp)
    let whatsappSent = false;
    let whatsappError = null;
    try {
      const queueService = require('../services/queue.service');
      await queueService.enqueueWhatsappJob(
        tour.id,
        phone,
        'travel_inquiry_update',
        [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: guestName },
              { type: 'text', text: tour.tourCode }
            ]
          }
        ]
      ).catch(() => {});
      whatsappSent = true;
    } catch (e) {
      whatsappError = e.message;
    }

    // 2. Dual Dispatch: Send Branded Pre-Tour Email via Brevo SMTP
    let emailSent = false;
    let emailError = null;
    if (recipientEmail) {
      try {
        await emailService.sendPretourEmail({
          to: recipientEmail,
          guestName,
          destination,
          startDateStr,
          totalCost,
          balanceDue,
          tourCode: tour.tourCode
        });
        emailSent = true;
      } catch (err) {
        emailError = err.message;
      }
    }

    // Log Query Activity / Note
    await prisma.queryNote.create({
      data: {
        queryId: tour.queryId,
        userId: req.user.id,
        note: `📱 Pre-Tour (Day -2) reminder message dispatched to +${phone}${recipientEmail ? ` & ${recipientEmail}` : ''}. Balance due: ₹${balanceDue}.`,
        noteType: 'note'
      }
    }).catch(() => {});

    res.json({
      success: true,
      message: `Pre-tour reminder dispatched to +${phone}${recipientEmail ? ` & ${recipientEmail}` : ''}`,
      data: {
        phone,
        email: recipientEmail,
        messageText,
        directWaUrl,
        balanceDue,
        whatsappSent,
        whatsappError,
        emailSent,
        emailError
      }
    });
  } catch (error) {
    next(error);
  }
};

const sendDailyDispatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dayNumber = 1, testPhone, testEmail } = req.body;
    const prisma = require('../config/prisma');
    const emailService = require('../services/email.service');

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        query: true,
        proposal: {
          include: {
            itinerary: {
              include: {
                days: {
                  include: { events: true },
                  orderBy: { dayNumber: 'asc' }
                }
              }
            }
          }
        },
        tourDrivers: { include: { driver: true } },
        bookingServices: true
      }
    });
    if (!tour) throw new BusinessError('Tour not found');

    const rawPhone = testPhone || tour.query?.phone;
    if (!rawPhone) throw new BusinessError('No recipient phone number available');

    let phone = rawPhone.replace(/\D/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const recipientEmail = testEmail || tour.query?.email;
    const guestName = tour.query?.name || 'Valued Traveler';
    const dayNum = parseInt(dayNumber, 10) || 1;

    // Find driver assigned to this day — if not set, omit completely (leave blank as instructed)
    const dayDriver = tour.tourDrivers.find(d => d.dayNumber === dayNum)?.driver;
    let driverInfo = '';
    if (dayDriver?.name) {
      const phonePart = dayDriver.phone ? ` (${dayDriver.phone})` : '';
      const vehiclePart = (dayDriver.vehicleName || dayDriver.vehicleNumber || dayDriver.vehicleNo)
        ? `, Vehicle: ${dayDriver.vehicleName || ''} ${dayDriver.vehicleNumber || dayDriver.vehicleNo || ''}`.trim()
        : '';
      driverInfo = `\n🚗 Assigned Chauffeur: ${dayDriver.name}${phonePart}${vehiclePart}`;
    }

    // Find hotel for tonight (check bookingServices or itinerary day hotel)
    const dayHotel = tour.bookingServices.find(b => b.dayNumber === dayNum && b.serviceType === 'hotel');
    const itinDay = tour.proposal?.itinerary?.days?.find(d => d.dayNumber === dayNum);
    const hotelName = dayHotel?.serviceName || itinDay?.hotel?.name || itinDay?.hotelName;
    let hotelInfo = '';
    if (hotelName) {
      hotelInfo = `\n🏨 Tonight's Hotel: ${hotelName}`;
    }

    // Itinerary title
    const dayTitle = itinDay?.title || `Day ${dayNum} Sightseeing`;

    const messageText = `Good morning ${guestName}! 🌟 Welcome to Day ${dayNum} of your holiday with Imagica Holidays!\n\n📍 Today's Plan: ${dayTitle}${driverInfo}${hotelInfo}\n\nHave a safe and enjoyable journey! For any assistance, we are just a call away.\n\n— Imagica Holidays Concierge`;
    const directWaUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

    // 1. WhatsApp Cloud API Dispatch
    let whatsappSent = false;
    let whatsappError = null;
    try {
      const queueService = require('../services/queue.service');
      await queueService.enqueueWhatsappJob(
        tour.id,
        phone,
        'travel_inquiry_update',
        [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: guestName },
              { type: 'text', text: `Day ${dayNum}: ${dayTitle}` }
            ]
          }
        ]
      ).catch(() => {});
      whatsappSent = true;
    } catch (e) {
      whatsappError = e.message;
    }

    // 2. Dual Dispatch: Send Branded Daily Logistics Email via Brevo SMTP
    let emailSent = false;
    let emailError = null;
    if (recipientEmail) {
      try {
        await emailService.sendDailyDispatchEmail({
          to: recipientEmail,
          guestName,
          dayNumber: dayNum,
          dayTitle,
          driverInfo,
          hotelInfo,
          tourCode: tour.tourCode
        });
        emailSent = true;
      } catch (err) {
        emailError = err.message;
      }
    }

    // Log Query Note
    await prisma.queryNote.create({
      data: {
        queryId: tour.queryId,
        userId: req.user.id,
        note: `🚗 Day ${dayNum} Logistics dispatch sent to +${phone}${recipientEmail ? ` & ${recipientEmail}` : ''}. Driver: ${dayDriver?.name || 'None (Blank)'}, Hotel: ${hotelName || 'None'}.`,
        noteType: 'note'
      }
    }).catch(() => {});

    res.json({
      success: true,
      message: `Day ${dayNum} logistics dispatch sent to +${phone}${recipientEmail ? ` & ${recipientEmail}` : ''}`,
      data: {
        phone,
        email: recipientEmail,
        dayNumber: dayNum,
        messageText,
        directWaUrl,
        whatsappSent,
        whatsappError,
        emailSent,
        emailError
      }
    });
  } catch (error) {
    next(error);
  }
};

const setTourPhase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { phase } = req.body; // 'upcoming', 'running', 'completed'
    const prisma = require('../config/prisma');

    if (!['upcoming', 'running', 'completed'].includes(phase)) {
      throw new BusinessError('Invalid phase. Must be upcoming, running, or completed');
    }

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: { query: true }
    });
    if (!tour) throw new BusinessError('Tour not found');

    const updateData = { status: phase };
    if (phase === 'completed') {
      updateData.reviewStatus = tour.reviewStatus || 'PENDING';
    } else if (phase === 'upcoming') {
      updateData.reviewStatus = 'PENDING';
      updateData.reviewRating = null;
      updateData.reviewAction = null;
      updateData.reviewNotes = null;
      updateData.reviewDisappointments = [];
    }

    const updatedTour = await prisma.tour.update({
      where: { id },
      data: updateData
    });

    // Sync query status
    if (tour.queryId) {
      const queryStatus = phase === 'upcoming' ? 'confirmed' : (phase === 'running' ? 'in_progress' : 'completed');
      await prisma.query.update({
        where: { id: tour.queryId },
        data: { status: queryStatus }
      });
    }

    res.json({
      success: true,
      message: `Tour phase transitioned to: ${phase}`,
      data: updatedTour
    });
  } catch (error) {
    next(error);
  }
};

const evaluateTourTransitions = async (req, res, next) => {
  try {
    const prisma = require('../config/prisma');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Auto-transition tours that started (startDate <= today <= endDate) to 'running'
    const startingTours = await prisma.tour.findMany({
      where: {
        startDate: { lte: today },
        endDate: { gte: today },
        status: 'upcoming',
        deletedAt: null,
        query: { status: { notIn: ['lost', 'invalid', 'cancelled'] } }
      },
      include: { query: true }
    });

    const transitionedToRunning = [];
    for (const tour of startingTours) {
      await prisma.tour.update({
        where: { id: tour.id },
        data: { status: 'running' }
      });
      if (tour.query && !['in_progress', 'completed', 'lost', 'invalid'].includes(tour.query.status)) {
        await prisma.query.update({
          where: { id: tour.query.id },
          data: { status: 'in_progress' }
        });
      }
      transitionedToRunning.push(tour.tourCode);
    }

    // 2. Auto-transition tours that ended (endDate < today) to 'completed'
    const endedTours = await prisma.tour.findMany({
      where: {
        endDate: { lt: today },
        status: { in: ['upcoming', 'running', 'in_progress'] },
        deletedAt: null,
        query: { status: { notIn: ['lost', 'invalid', 'cancelled'] } }
      },
      include: { query: true }
    });

    const transitionedToCompleted = [];
    for (const tour of endedTours) {
      await prisma.tour.update({
        where: { id: tour.id },
        data: {
          status: 'completed',
          reviewStatus: tour.reviewStatus || 'PENDING'
        }
      });
      if (tour.query && !['completed', 'lost', 'invalid'].includes(tour.query.status)) {
        await prisma.query.update({
          where: { id: tour.query.id },
          data: { status: 'completed' }
        });
      }
      transitionedToCompleted.push(tour.tourCode);
    }

    res.json({
      success: true,
      message: `Evaluated tour transitions. ${transitionedToRunning.length} moved to running, ${transitionedToCompleted.length} moved to completed.`,
      data: {
        transitionedToRunning,
        transitionedToCompleted
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
  sendPretourReminder,
  sendDailyDispatch,
  setTourPhase,
  evaluateTourTransitions,
};
