// ============================================================
// TravelCRM — Booking Service (Sprint 10 — Post Sales)
// ============================================================

const prisma = require('../config/prisma');
const { BusinessError } = require('../utils/AppError');

/**
 * Auto-generate BookingService records from confirmed proposal days
 */
const generateFromProposal = async (queryId, userId) => {
  // Find the latest non-deleted proposal for this query
  const proposal = await prisma.proposal.findFirst({
    where: { queryId, deletedAt: null },
    orderBy: { version: 'desc' },
    include: {
      query: true,
    }
  });

  if (!proposal) throw new BusinessError('No proposal found for this query');
  if (!proposal.itineraryId) throw new BusinessError('No itinerary linked to this proposal');

  // Check if booking services already exist with payments. If so, don't auto-regenerate.
  const paymentsRecorded = await prisma.bookingService.count({
    where: { queryId, supplierAmountPaid: { gt: 0 } }
  });
  if (paymentsRecorded > 0) {
    throw new BusinessError('Cannot regenerate: Some booking services already have payments recorded. Please edit details manually.');
  }

  // Fetch full itinerary with days and events
  const fullItinerary = await prisma.itinerary.findUnique({
    where: { id: proposal.itineraryId },
    include: {
      days: {
        orderBy: { dayNumber: 'asc' },
        include: { events: { orderBy: { sortOrder: 'asc' } } }
      }
    }
  });

  if (!fullItinerary || !fullItinerary.days) {
    throw new BusinessError('No itinerary details found for this proposal.');
  }

  const adults = proposal.query?.adults || 0;
  const children = proposal.query?.children || 0;
  const totalPaxCount = adults + children;
  const startDate = proposal.travelDateFrom || new Date();

  const services = [];

  for (const day of fullItinerary.days) {
    // Calculate actual date for this day
    const serviceDate = new Date(startDate);
    serviceDate.setDate(serviceDate.getDate() + (day.dayNumber - 1));

    for (const event of (day.events || [])) {
      let serviceType = null;
      if (event.type === 'accommodation') serviceType = 'hotel';
      else if (['transport', 'activity', 'sightseeing'].includes(event.type)) serviceType = 'transport';

      if (serviceType) {
        // Determine check-in/out for hotels
        let checkIn = null;
        let checkOut = null;
        if (serviceType === 'hotel') {
          let meta = event.metadata;
          if (meta && typeof meta === 'string') {
            try { meta = JSON.parse(meta); } catch (e) {}
          }
          if (meta && meta.checkInDate) {
            checkIn = new Date(meta.checkInDate);
          } else {
            checkIn = serviceDate;
          }
          if (meta && meta.checkOutDate) {
            checkOut = new Date(meta.checkOutDate);
          } else {
            checkOut = new Date(serviceDate);
            checkOut.setDate(checkOut.getDate() + 1);
          }
        }

        services.push({
          queryId,
          proposalDayId: null,
          serviceType,
          serviceName: event.title || 'Untitled Service',
          serviceDate: serviceType === 'transport' ? serviceDate : null,
          checkIn,
          checkOut,
          totalCost: event.cost ? Number(event.cost) : 0,
          supplierAmountPaid: 0,
          supplierAmountPending: event.cost ? Number(event.cost) : 0,
          units: totalPaxCount || 1,
          createdBy: userId,
          notes: event.description || null,
          mailStatus: 'not_sent',
          paymentStatus: 'pending',
        });
      }
    }
  }

  if (services.length === 0) {
    throw new BusinessError('No hotel or transport events found in the approved itinerary.');
  }

  // Only delete existing bookings if we have successfully found new ones to insert
  await prisma.bookingService.deleteMany({ where: { queryId } });

  const created = await prisma.bookingService.createMany({ data: services });
  return { message: `Generated ${created.count} booking services`, count: created.count };
};

/**
 * List all booking services for a query
 */
const listByQuery = async (queryId) => {
  return prisma.bookingService.findMany({
    where: { queryId },
    include: {
      supplier: { select: { id: true, companyName: true, email: true, phone: true } },
      creator: { select: { id: true, name: true } },
      query: { select: { id: true, name: true, phone: true, adults: true, children: true } },
    },
    orderBy: [{ serviceType: 'asc' }, { createdAt: 'asc' }],
  });
};

/**
 * Update a booking service (supplier, confirmation, notes, payment)
 */
const updateService = async (id, data) => {
  const updateData = {};
  if (data.supplierId !== undefined) updateData.supplierId = data.supplierId;
  if (data.supplierName !== undefined) updateData.supplierName = data.supplierName;
  if (data.supplierEmail !== undefined) updateData.supplierEmail = data.supplierEmail;
  if (data.supplierPhone !== undefined) updateData.supplierPhone = data.supplierPhone;
  if (data.confirmationNumber !== undefined) updateData.confirmationNumber = data.confirmationNumber;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.checkIn !== undefined) updateData.checkIn = new Date(data.checkIn);
  if (data.checkOut !== undefined) updateData.checkOut = new Date(data.checkOut);
  if (data.serviceDate !== undefined) updateData.serviceDate = new Date(data.serviceDate);
  if (data.ratePerUnit !== undefined) updateData.ratePerUnit = parseFloat(data.ratePerUnit);
  if (data.units !== undefined) updateData.units = parseInt(data.units, 10);

  // Recalculate totals if rate or units changed
  if (data.ratePerUnit !== undefined || data.units !== undefined) {
    const current = await prisma.bookingService.findUnique({ where: { id } });
    const rate = data.ratePerUnit !== undefined ? parseFloat(data.ratePerUnit) : Number(current.ratePerUnit);
    const units = data.units !== undefined ? parseInt(data.units, 10) : current.units;
    updateData.totalCost = rate * units;
    updateData.supplierAmountPending = updateData.totalCost - Number(current.supplierAmountPaid);
  }

  return prisma.bookingService.update({
    where: { id },
    data: updateData,
    include: {
      supplier: { select: { id: true, companyName: true, email: true } },
    },
  });
};

/**
 * Record a supplier payment against a booking service
 */
const recordPayment = async (id, amount) => {
  const service = await prisma.bookingService.findUnique({ where: { id } });
  if (!service) throw new Error('Booking service not found');

  const newPaid = Number(service.supplierAmountPaid) + parseFloat(amount);
  const newPending = Number(service.totalCost) - newPaid;
  const paymentStatus = newPending <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'pending';

  return prisma.bookingService.update({
    where: { id },
    data: {
      supplierAmountPaid: newPaid,
      supplierAmountPending: Math.max(0, newPending),
      paymentStatus,
    },
  });
};

/**
 * Mark mail as sent for a booking service
 */
const markMailSent = async (id) => {
  return prisma.bookingService.update({
    where: { id },
    data: {
      mailStatus: 'sent',
      mailSentAt: new Date(),
    },
  });
};

module.exports = {
  generateFromProposal,
  listByQuery,
  updateService,
  recordPayment,
  markMailSent,
};
