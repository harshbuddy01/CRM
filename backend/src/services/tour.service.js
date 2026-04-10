// ============================================================
// TravelCRM — Tour Service
// ============================================================

const prisma = require('../config/prisma');
const { BusinessError, NotFoundError } = require('../utils/AppError');

const listTours = async ({ status, filterType, page = 1, limit = 50, opsUserId }) => {
  const where = { deletedAt: null };

  if (status) where.status = status;

  if (filterType === 'ops') {
    // Ops view shows all running or upcoming
    where.status = { in: ['upcoming', 'running'] };
  } else if (filterType === 'field') {
    // Field Agent only sees running tours for today
    where.status = { in: ['running', 'upcoming'] };
    where.startDate = { lte: new Date() };
    where.endDate = { gte: new Date() };
  }

  // If a specific Operations person is logged in and filtering
  if (opsUserId) {
    where.assignedOps = opsUserId;
  }

  const offset = (page - 1) * limit;
  const tours = await prisma.tour.findMany({
    where,
    skip: offset,
    take: parseInt(limit, 10),
    orderBy: { startDate: 'asc' }, // Logistics care about what happens soonest
    include: {
      query: { select: { id: true, name: true, phone: true } },
      assignedOpsUser: { select: { name: true } },
      // Specifically omit heavy financials for lists if ops/field, handled in controller mapping 
    },
  });

  const total = await prisma.tour.count({ where });
  return { tours, total, page, totalPages: Math.ceil(total / limit) };
};

const getTourDetails = async (id) => {
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      query: { select: { id: true, name: true, phone: true, email: true, destination: true } },
      proposal: {
        include: { days: { include: { destination: true, hotel: true } } }
      },
      assignedOpsUser: { select: { name: true } },
      payments: {
        where: { deletedAt: null },
        orderBy: { paymentDate: 'desc' }
      },
      cancellation: true,
    }
  });

  if (!tour || tour.deletedAt) {
    throw new NotFoundError('Tour');
  }

  return tour;
};

const updateTourOps = async (id, data) => {
  const { assignedOps, opsNotes, status } = data;
  const updatedTour = await prisma.tour.update({
    where: { id },
    data: {
      ...(assignedOps !== undefined && { assignedOps }),
      ...(opsNotes !== undefined && { opsNotes }),
      ...(status !== undefined && { status }),
    },
    include: {
      proposal: { select: { itineraryId: true } }
    }
  });

  // Lifecycle cleanup: This is now handled by the 48-hour GC cron job in worker.js
  // to ensure client copies remain visible for 48 hours after the trip is completed.

  return updatedTour;
};

const cancelTour = async (id, userId, reason) => {
  const tour = await getTourDetails(id);
  if (tour.status === 'cancelled') {
    throw new BusinessError('Tour is already cancelled');
  }

  // Business Logic for Refund Calculation (Simplistic Example)
  // Real world depends on days-to-start
  const daysToStart = (tour.startDate - new Date()) / (1000 * 60 * 60 * 24);
  const totalPaid = tour.payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + Number(p.amount), 0);
  
  let refundPct = 0;
  if (daysToStart > 30) refundPct = 0.90;      // 90% refund if > 30 days
  else if (daysToStart > 15) refundPct = 0.50; // 50% refund if > 15 days
  else refundPct = 0;                          // No refund if < 15 days

  const refundAmount = totalPaid * refundPct;

  // Execute cancellation in transaction
  return await prisma.$transaction(async (tx) => {
    await tx.tour.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    const cancellation = await tx.tourCancellation.create({
      data: {
        tourId: id,
        reason,
        refundAmount,
        status: 'pending',
        requestedBy: userId,
      }
    });

    // Option: Auto-mark query as lost/cancelled? Let's leave query as confirmed but tour as cancelled
    return cancellation;
  });
};

const estimateRefund = async (id) => {
  const tour = await getTourDetails(id);
  const daysToStart = (tour.startDate - new Date()) / (1000 * 60 * 60 * 24);
  const totalPaid = tour.payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + Number(p.amount), 0);
  
  let refundPct = 0;
  if (daysToStart > 30) refundPct = 0.90;      
  else if (daysToStart > 15) refundPct = 0.50; 
  else refundPct = 0;                          

  const refundAmount = totalPaid * refundPct;
  return { 
    totalPaid, 
    refundPct, 
    refundAmount, 
    reason: `Cancellation ${Math.round(daysToStart)} days before start.` 
  };
};

module.exports = {
  listTours,
  getTourDetails,
  updateTourOps,
  cancelTour,
  estimateRefund,
};
