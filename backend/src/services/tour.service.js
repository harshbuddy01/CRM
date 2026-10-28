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

    // 4. Auto-link any payments where queryId has an active tour and tourId is null
    const unlinkedPayments = await prisma.payment.findMany({
      where: { tourId: null, queryId: { not: null }, deletedAt: null },
      select: { id: true, queryId: true }
    });
    for (const p of unlinkedPayments) {
      const tour = await prisma.tour.findFirst({
        where: { queryId: p.queryId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });
      if (tour) {
        await prisma.payment.update({
          where: { id: p.id },
          data: { tourId: tour.id }
        });
      }
    }
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

  if (status && status !== 'all') {
    if (status === 'cancelled') {
      where.OR = [
        { status: 'cancelled' },
        { query: { status: { in: ['lost', 'invalid'] } } }
      ];
    } else {
      where.status = status;
      where.query = { status: { notIn: ['lost', 'invalid'] } };
    }
  } else if (filterType === 'ops') {
    // Ops view shows all running or upcoming
    where.status = { in: ['upcoming', 'running'] };
    where.query = { status: { notIn: ['lost', 'invalid'] } };
  } else if (filterType === 'field') {
    // Field Agent only sees running tours for today
    where.status = { in: ['running', 'upcoming'] };
    where.startDate = { lte: new Date() };
    where.endDate = { gte: new Date() };
    where.query = { status: { notIn: ['lost', 'invalid'] } };
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
          payments: {
            where: { deletedAt: null },
            select: { id: true, amount: true, status: true }
          }
        }
      },
      assignedOpsUser: { select: { id: true, name: true, mobile: true } },
      proposal: {
        select: {
          id: true,
          sellingPrice: true,
          totalCost: true,
        }
      },
      tourDrivers: {
        include: {
          driver: { select: { id: true, name: true, phone: true, vehicleName: true, vehicleNo: true } }
        }
      },
      payments: {
        where: { deletedAt: null },
        select: { id: true, amount: true, status: true }
      }
    },
  });

  const tours = rawTours.map(t => {
    const paymentMap = new Map();
    (t.payments || []).forEach(p => paymentMap.set(p.id, p));
    (t.query?.payments || []).forEach(p => paymentMap.set(p.id, p));
    const allUniquePayments = Array.from(paymentMap.values());

    const verifiedPaid = allUniquePayments
      .filter(p => p.status === 'verified')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      ...t,
      passengerCount: t.totalPax || (t.query ? ((t.query.adults || 0) + (t.query.children || 0)) : 1),
      destination: t.query?.destination || 'Destination TBD',
      sellingPrice: t.proposal?.sellingPrice ? Number(t.proposal.sellingPrice) : null,
      totalPaid: verifiedPaid,
      driver: t.tourDrivers?.[0]?.driver ? {
        name: t.tourDrivers[0].driver.name,
        phone: t.tourDrivers[0].driver.phone,
        vehicleName: t.tourDrivers[0].driver.vehicleName,
        vehicleNo: t.tourDrivers[0].driver.vehicleNo
      } : null
    };
  });

  const total = await prisma.tour.count({ where });
  return { tours, total, page, totalPages: Math.ceil(total / limit), statusCounts };
};

const getTourDetails = async (id) => {
  const tour = await prisma.tour.findUnique({
    where: { id },
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
          status: true
        }
      },
      proposal: {
        include: {
          days: { include: { destination: true, hotel: true } },
          itinerary: {
            include: {
              days: {
                include: { destination: true, events: true },
                orderBy: { dayNumber: 'asc' }
              }
            }
          }
        }
      },
      assignedOpsUser: { select: { id: true, name: true, mobile: true } },
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

  // Fetch all payments associated with this tour or its query, including collector details
  const payments = await prisma.payment.findMany({
    where: {
      deletedAt: null,
      OR: [
        { tourId: id },
        ...(tour.queryId ? [{ queryId: tour.queryId }] : [])
      ]
    },
    orderBy: { paymentDate: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, mobile: true, role: true } }
    }
  });

  // Self-heal: ensure tourId is populated in DB for any query payments that lacked tourId
  const missingTourPayments = payments.filter(p => !p.tourId);
  if (missingTourPayments.length > 0) {
    await prisma.payment.updateMany({
      where: { id: { in: missingTourPayments.map(p => p.id) } },
      data: { tourId: id }
    });
  }

  // De-duplicate unique payments by ID
  const paymentMap = new Map();
  payments.forEach(p => paymentMap.set(p.id, p));
  const finalPayments = Array.from(paymentMap.values()).map(p => ({
    ...p,
    amount: Number(p.amount),
    collector: p.user ? {
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
      mobile: p.user.mobile,
      role: typeof p.user.role === 'object' ? (p.user.role?.label || p.user.role?.name || 'Staff') : (p.user.role || 'Staff')
    } : null
  }));

  const passengerCount = tour.totalPax || (tour.query ? ((tour.query.adults || 0) + (tour.query.children || 0)) : 1);

  // Normalize proposal days: if proposal.days is empty, extract from linked itinerary.days
  let days = tour.proposal?.days || [];
  if ((!days || days.length === 0) && tour.proposal?.itinerary?.days) {
    days = tour.proposal.itinerary.days.map(d => ({
      id: d.id,
      dayNumber: d.dayNumber,
      title: d.title,
      description: d.description,
      activities: d.events?.map(e => e.title || e.name).join(', ') || null,
      destination: d.destination,
      hotel: null
    }));
  }

  return {
    ...tour,
    passengerCount,
    proposal: tour.proposal ? {
      ...tour.proposal,
      days
    } : null,
    payments: finalPayments
  };
};

const updateTourOps = async (id, data) => {
  const { assignedOps, opsNotes, status } = data;
  const updatedTour = await prisma.tour.update({
    where: { id },
    data: {
      ...(assignedOps !== undefined && { assignedOps }),
      ...(opsNotes !== undefined && { opsNotes }),
      ...(status !== undefined && { status }),
      ...(status === 'completed' && { reviewStatus: 'PENDING' }),
    },
    include: {
      proposal: { select: { itineraryId: true } }
    }
  });

  // When a tour is completed, also sync the associated Inquiry/Query status
  if (status === 'completed') {
    const tourWithQuery = await prisma.tour.findUnique({
      where: { id },
      select: { queryId: true, query: { select: { status: true } } }
    });
    if (tourWithQuery?.queryId && !['completed', 'lost', 'invalid'].includes(tourWithQuery.query?.status)) {
      await prisma.query.update({
        where: { id: tourWithQuery.queryId },
        data: { status: 'completed' }
      });
    }
  }

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
