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
      days: {
        include: {
          hotel: true,
          destination: true,
        },
        orderBy: { dayNumber: 'asc' },
      },
    },
  });

  if (!proposal) throw new BusinessError('No proposal found for this query');

  // Check if booking services already exist with payments. If so, don't auto-regenerate.
  const paymentsRecorded = await prisma.bookingService.count({
    where: { queryId, supplierAmountPaid: { gt: 0 } }
  });
  if (paymentsRecorded > 0) {
    throw new BusinessError('Cannot regenerate: Some booking services already have payments recorded. Please edit details manually.');
  }

  // Delete existing booking services to allow fresh generation/updates
  await prisma.bookingService.deleteMany({ where: { queryId } });

  const services = [];

  // Group consecutive days at the same hotel
  const hotelStays = {};
  for (const day of proposal.days) {
    if (day.hotelId && day.hotel) {
      const key = day.hotelId;
      if (!hotelStays[key]) {
        hotelStays[key] = {
          hotel: day.hotel,
          destination: day.destination,
          days: [],
          proposalDayId: day.id,
        };
      }
      hotelStays[key].days.push(day);
    }
  }

  // Create hotel booking services with actual check-in/out dates
  for (const [, stay] of Object.entries(hotelStays)) {
    const nights = stay.days.length;
    const ratePerUnit = Number(stay.hotel.basePrice || 0);
    const totalCost = ratePerUnit * nights;

    let checkIn = null;
    let checkOut = null;
    if (proposal.travelDateFrom && stay.days.length > 0) {
      const sortedDays = [...stay.days].sort((a, b) => a.dayNumber - b.dayNumber);
      const firstDay = sortedDays[0];
      const lastDay = sortedDays[sortedDays.length - 1];
      
      const start = new Date(proposal.travelDateFrom);
      checkIn = new Date(start);
      checkIn.setDate(start.getDate() + (firstDay.dayNumber - 1));
      
      checkOut = new Date(start);
      checkOut.setDate(start.getDate() + lastDay.dayNumber);
    }

    services.push({
      queryId,
      proposalDayId: stay.proposalDayId,
      serviceType: 'hotel',
      serviceName: stay.hotel.name,
      ratePerUnit,
      units: nights,
      totalCost,
      supplierAmountPaid: 0,
      supplierAmountPending: totalCost,
      createdBy: userId,
      checkIn,
      checkOut,
    });
  }

  // Create transport booking services from proposal days that have transport, with service dates
  for (const day of proposal.days) {
    if (day.transport && day.transport.trim()) {
      let serviceDate = null;
      if (proposal.travelDateFrom) {
        const start = new Date(proposal.travelDateFrom);
        serviceDate = new Date(start);
        serviceDate.setDate(start.getDate() + (day.dayNumber - 1));
      }

      services.push({
        queryId,
        proposalDayId: day.id,
        serviceType: 'transport',
        serviceName: day.transport,
        ratePerUnit: Number(day.dayCost || 0),
        units: 1,
        totalCost: Number(day.dayCost || 0),
        supplierAmountPaid: 0,
        supplierAmountPending: Number(day.dayCost || 0),
        createdBy: userId,
        serviceDate,
      });
    }
  }

  if (services.length === 0) {
    return { message: 'No hotel/transport entries found in proposal', count: 0 };
  }

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
