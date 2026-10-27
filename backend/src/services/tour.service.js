// ============================================================
// TravelCRM — Tour Service
// ============================================================

const prisma = require('../config/prisma');
const { BusinessError, NotFoundError } = require('../utils/AppError');

/**
 * Self-healing automatic status reconciliation for tours.
 * Ensures:
 * 1. Tours whose query is 'lost' or 'invalid' are cancelled and excluded from reviews.
 * 2. Ongoing tours (startDate <= today <= endDate) are transitioned to 'running'.
 * 3. Concluded tours (endDate < today) with valid queries are transitioned to 'completed'.
 */
const reconcileTourStatuses = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Any tour with query in ('lost', 'invalid') must be cancelled
    await prisma.tour.updateMany({
      where: {
        query: { status: { in: ['lost', 'invalid'] } },
        status: { not: 'cancelled' }
      },
      data: {
        status: 'cancelled',
        reviewStatus: 'EXCLUDED'
      }
    });

    // 2. Any tour whose startDate <= today <= endDate and status === 'upcoming' -> 'running'
    await prisma.tour.updateMany({
      where: {
        startDate: { lte: today },
        endDate: { gte: today },
        status: 'upcoming',
        query: { status: { notIn: ['lost', 'invalid'] } }
      },
      data: {
        status: 'running'
      }
    });

    // 3. Any tour whose endDate < today and status in ('upcoming', 'running') and query not lost -> 'completed'
    await prisma.tour.updateMany({
      where: {
        endDate: { lt: today },
        status: { in: ['upcoming', 'running'] },
        query: { status: { notIn: ['lost', 'invalid'] } }
      },
      data: {
        status: 'completed'
      }
    });
  } catch (err) {
    console.error('[Tour Reconciliation Error]:', err.message);
  }
};

const listTours = async ({ status, filterType, page = 1, limit = 50, opsUserId }) => {
  // Self-heal and sync tour statuses on list request
  await reconcileTourStatuses();

  const baseWhere = { deletedAt: null };

  // If a specific Operations person is logged in and filtering
  if (opsUserId) {
    baseWhere.assignedOps = opsUserId;
  }

  // Calculate live count summaries for all tabs
  const [totalUpcoming, totalRunning, totalCompleted, totalCancelled] = await Promise.all([
    prisma.tour.count({
      where: {
        ...baseWhere,
        status: 'upcoming',
        query: { status: { notIn: ['lost', 'invalid'] } }
      }
    }),
    prisma.tour.count({
      where: {
        ...baseWhere,
        status: 'running',
        query: { status: { notIn: ['lost', 'invalid'] } }
      }
    }),
    prisma.tour.count({
      where: {
        ...baseWhere,
        status: 'completed',
        query: { status: { notIn: ['lost', 'invalid'] } }
      }
    }),
    prisma.tour.count({
      where: {
        ...baseWhere,
        OR: [
          { status: 'cancelled' },
          { query: { status: { in: ['lost', 'invalid'] } } }
        ]
      }
    })
  ]);

  const statusCounts = {
    all: totalUpcoming + totalRunning + totalCompleted,
    upcoming: totalUpcoming,
    running: totalRunning,
    completed: totalCompleted,
    cancelled: totalCancelled
  };

  const where = { ...baseWhere };

  if (filterType === 'ops') {
    // Ops view shows all running or upcoming
    where.status = { in: ['upcoming', 'running'] };
    where.query = { status: { notIn: ['lost', 'invalid'] } };
  } else if (filterType === 'field') {
    // Field Agent only sees running tours for today
    where.status = { in: ['running', 'upcoming'] };
    where.startDate = { lte: new Date() };
    where.endDate = { gte: new Date() };
    where.query = { status: { notIn: ['lost', 'invalid'] } };
  } else if (status && status !== 'all') {
    if (status === 'cancelled') {
      where.OR = [
        { status: 'cancelled' },
        { query: { status: { in: ['lost', 'invalid'] } } }
      ];
    } else {
      where.status = status;
      where.query = { status: { notIn: ['lost', 'invalid'] } };
    }
  } else {
    // If 'all', default to non-cancelled tours to keep active pipeline clean
    where.status = { in: ['running', 'upcoming', 'completed'] };
    where.query = { status: { notIn: ['lost', 'invalid'] } };
  }

  // Dynamic sorting based on view
  let orderBy = { startDate: 'asc' };
  if (status === 'completed') {
    orderBy = { endDate: 'desc' }; // Most recently completed tours first
  } else if (status === 'running') {
    orderBy = { endDate: 'asc' }; // Concluding soonest first
  } else if (status === 'upcoming') {
    orderBy = { startDate: 'asc' };
  } else if (status === 'cancelled') {
    orderBy = { updatedAt: 'desc' };
  } else {
    orderBy = { startDate: 'desc' };
  }

  const offset = (page - 1) * limit;
  const rawTours = await prisma.tour.findMany({
    where,
    skip: offset,
    take: parseInt(limit, 10),
    orderBy,
    include: {
      query: {
        select: {
          id: true,
          queryCode: true,
          name: true,
          phone: true,
          email: true,
          destination: true,
          adults: true,
          children: true,
          status: true,
        }
      },
      assignedOpsUser: { select: { id: true, name: true, phone: true } },
      proposal: {
        select: {
          id: true,
          sellingPrice: true,
          totalCost: true,
        }
      },
      tourDrivers: {
        include: {
          driver: { select: { id: true, name: true, phone: true, vehicleType: true, vehicleNumber: true } }
        }
      },
      payments: {
        where: { deletedAt: null },
        select: { id: true, amount: true, status: true }
      }
    },
  });

  const tours = rawTours.map(t => {
    const verifiedPaid = (t.payments || [])
      .filter(p => p.status === 'verified')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      ...t,
      passengerCount: t.totalPax || (t.query ? ((t.query.adults || 0) + (t.query.children || 0)) : 1),
      destination: t.query?.destination || 'Destination TBD',
      sellingPrice: t.proposal?.sellingPrice ? Number(t.proposal.sellingPrice) : null,
      totalPaid: verifiedPaid,
      driver: t.tourDrivers?.[0]?.driver || null
    };
  });

  const total = await prisma.tour.count({ where });
  return { tours, total, page, totalPages: Math.ceil(total / limit), statusCounts };
};

const getTourDetails = async (id) => {
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      query: { select: { id: true, name: true, phone: true, email: true, destination: true } },
      proposal: {
        include: { days: { include: { destination: true, hotel: true } } }
      },
      assignedOpsUser: { select: { id: true, name: true } },
      payments: {
        where: { deletedAt: null },
        orderBy: { paymentDate: 'desc' }
      },
      cancellation: true,
      bookingServices: true,
      tourDrivers: {
        include: { driver: true }
      },
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
