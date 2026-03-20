// ============================================================
// TravelCRM — Query (Leads) Service
// ============================================================

const prisma = require('../config/prisma');
const { BusinessError, NotFoundError } = require('../utils/AppError');
const logger = require('../utils/logger');
const { validateTransition } = require('../utils/statusTransitions');

// Auto-generate query code (e.g., QRY-2024-001)
const generateQueryCode = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.query.count({
    where: { queryCode: { startsWith: `QRY-${year}-` } },
  });
  return `QRY-${year}-${String(count + 1).padStart(3, '0')}`;
};

const MAX_CODE_RETRIES = 3;

const createQuery = async (data) => {
  // Simple duplicate check by phone number
  const existing = await prisma.query.findFirst({
    where: { phone: data.phone, status: { notIn: ['lost', 'invalid'] } },
  });

  if (existing) {
    throw new BusinessError(`Duplicate lead! An active query (${existing.queryCode}) already exists for phone ${data.phone}.`);
  }

  if (data.assignedTo) {
    const agent = await prisma.user.findUnique({ where: { id: data.assignedTo, isActive: true } });
    if (!agent) throw new BusinessError('Assigned user is invalid or inactive');
  }

  // Retry loop to handle race condition on queryCode unique constraint
  for (let attempt = 1; attempt <= MAX_CODE_RETRIES; attempt++) {
    try {
      const queryCode = await generateQueryCode();
      return await prisma.query.create({
        data: {
          ...data,
          queryCode,
          travelDateFrom: data.travelDateFrom ? new Date(data.travelDateFrom) : null,
          travelDateTo: data.travelDateTo ? new Date(data.travelDateTo) : null,
        },
      });
    } catch (error) {
      // Prisma unique constraint violation code = P2002
      if (error.code === 'P2002' && error.meta?.target?.includes('query_code') && attempt < MAX_CODE_RETRIES) {
        logger.warn(`[Query] queryCode collision on attempt ${attempt}, retrying...`);
        continue;
      }
      throw error;
    }
  }
};

const listQueries = async ({ 
  page = 1, limit = 20, status, search, assignedTo, dateFrom, dateTo, userId, canViewAll 
}) => {
  const where = { deletedAt: null };

  // RBAC scope constraint
  if (!canViewAll) {
    // Agent can only see their own assigned queries
    where.assignedTo = userId;
  } else if (assignedTo) {
    // Admin filtering by specific agent
    where.assignedTo = assignedTo;
  }

  // Filters
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { queryCode: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const offset = (page - 1) * limit;
  const queries = await prisma.query.findMany({
    where,
    skip: offset,
    take: parseInt(limit, 10),
    orderBy: { createdAt: 'desc' },
    include: {
      assignedUser: { select: { name: true } },
    },
  });

  const total = await prisma.query.count({ where });

  return { queries, total, page, totalPages: Math.ceil(total / limit) };
};

const getQueryById = async (id, userId, canViewAll) => {
  const query = await prisma.query.findUnique({
    where: { id },
    include: {
      assignedUser: { select: { id: true, name: true } },
      notes: { orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } },
    },
  });

  if (!query || query.deletedAt) throw new NotFoundError('Query');

  if (!canViewAll && query.assignedTo !== userId) {
    throw new BusinessError('You do not have access to view this query');
  }

  return query;
};

const updateQuery = async (id, data, userId, canViewAll, canEditAll) => {
  const existing = await getQueryById(id, userId, canViewAll); // Re-use read access control

  // If cannot edit all, verify assignment
  if (!canEditAll && existing.assignedTo !== userId) {
    throw new BusinessError('You cannot edit a query that is not assigned to you');
  }

  // Sanitize data — don't allow changing core tracking fields randomly
  delete data.id;
  delete data.queryCode;
  if (data.travelDateFrom) data.travelDateFrom = new Date(data.travelDateFrom);
  if (data.travelDateTo) data.travelDateTo = new Date(data.travelDateTo);

  return await prisma.query.update({
    where: { id },
    data,
  });
};

const assignQuery = async (id, assignedToUserId, currentUserId) => {
  const existingQuery = await prisma.query.findUnique({ where: { id } });
  if (!existingQuery) throw new NotFoundError('Query');

  const agent = await prisma.user.findUnique({ where: { id: assignedToUserId, isActive: true } });
  if (!agent) throw new BusinessError('Assigned user is invalid or inactive');

  // Workload check
  const activeLeadsCount = await prisma.query.count({
    where: { assignedTo: assignedToUserId, status: { notIn: ['lost', 'invalid', 'confirmed'] } },
  });

  if (activeLeadsCount >= agent.maxLeads) {
    throw new BusinessError(`User ${agent.name} has reached their max lead capacity (${agent.maxLeads}).`);
  }

  const updatedEntity = await prisma.query.update({
    where: { id },
    data: { assignedTo: assignedToUserId },
    include: { assignedUser: { select: { name: true } } }
  });

  // Track assignment load balancing
  await prisma.user.update({
    where: { id: assignedToUserId },
    data: { lastAssignedAt: new Date() }
  });

  return updatedEntity;
};

const deleteQuery = async (id) => {
  const existing = await prisma.query.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Query');
  
  // Soft Delete
  return await prisma.query.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'invalid' }
  });
}

const checkDuplicatePhone = async (phone) => {
  const existing = await prisma.query.findFirst({
    where: { phone, status: { notIn: ['lost', 'invalid'] } },
  });
  return !!existing;
};

const addNote = async (queryId, userId, note, followUpAt) => {
  // Verify query exists
  const query = await prisma.query.findUnique({ where: { id: queryId } });
  if (!query || query.deletedAt) throw new NotFoundError('Query');

  const created = await prisma.queryNote.create({
    data: {
      queryId,
      userId,
      note,
      followUpAt: followUpAt ? new Date(followUpAt) : null,
    },
    include: { user: { select: { name: true } } },
  });

  // If a follow-up date was set, update the query's nextFollowupAt
  if (followUpAt) {
    await prisma.query.update({
      where: { id: queryId },
      data: { nextFollowupAt: new Date(followUpAt) },
    });
  }

  return created;
};

const deleteNote = async (queryId, noteId, userId) => {
  const note = await prisma.queryNote.findFirst({
    where: { id: noteId, queryId }
  });
  if (!note) {
    throw new NotFoundError('Note');
  }
  
  await prisma.queryNote.update({
    where: { id: noteId },
    data: { deletedAt: new Date() }
  });
};

const changeQueryStatus = async (id, status, userId, canViewAll, canEditAll) => {
  const existing = await getQueryById(id, userId, canViewAll);
  
  if (!canEditAll && existing.assignedTo !== userId) {
    throw new BusinessError('You cannot change the status of a query that is not assigned to you');
  }

  validateTransition(existing.status, status);

  if (status === 'confirmed' && existing.status !== 'confirmed') {
    // 1. Payment validation — block CONFIRMED if no payment on record
    const paymentCount = await prisma.payment.count({ where: { queryId: id, status: { not: 'failed' } } });
    if (paymentCount === 0) {
      throw new BusinessError('Cannot confirm booking: No verified or pending payment on record.');
    }

    // 2. Auto-create tour on CONFIRMED status
    // Safe generated tour code block
    let tourCode;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const year = new Date().getFullYear();
      const count = await prisma.tour.count({
        where: { tourCode: { startsWith: `TUR-${year}-` } },
      });
      // Added attempt to handle racing offsets
      tourCode = `TUR-${year}-${String(count + attempt).padStart(3, '0')}`;
      
      const exists = await prisma.tour.findUnique({ where: { tourCode } });
      if (!exists) break;
    }

    // Find latest proposal
    const proposal = await prisma.proposal.findFirst({
      where: { queryId: id },
      orderBy: { version: 'desc' }
    });

    await prisma.tour.create({
      data: {
        queryId: id,
        proposalId: proposal ? proposal.id : null,
        tourCode,
        status: 'upcoming',
        startDate: existing.travelDateFrom || new Date(),
        endDate: existing.travelDateTo || new Date(),
        totalPax: existing.adults + existing.children,
      }
    });
  }

  return await prisma.query.update({
    where: { id },
    data: { status },
  });
};

module.exports = {
  createQuery,
  listQueries,
  getQueryById,
  updateQuery,
  assignQuery,
  deleteQuery,
  checkDuplicatePhone,
  changeQueryStatus,
  addNote,
  deleteNote,
};
