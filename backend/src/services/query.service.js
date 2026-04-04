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
  const latestQuery = await prisma.query.findFirst({
    where: { queryCode: { startsWith: `QRY-${year}-` } },
    orderBy: { queryCode: 'desc' },
  });

  if (!latestQuery) return `QRY-${year}-001`;

  // Extract the number part from "QRY-2026-005"
  const parts = latestQuery.queryCode.split('-');
  const lastNumber = parseInt(parts[2], 10);
  
  if (isNaN(lastNumber)) {
    // Fallback if the code format was somehow mangled
    const count = await prisma.query.count({ where: { queryCode: { startsWith: `QRY-${year}-` } } });
    return `QRY-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  return `QRY-${year}-${String(lastNumber + 1).padStart(3, '0')}`;
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
      notes: { 
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }, 
        include: { user: { select: { name: true } } } 
      },
    },
  });

  if (!query || query.deletedAt) throw new NotFoundError('Query');

  if (!canViewAll && query.assignedTo !== userId) {
    throw new BusinessError('You do not have access to view this query');
  }

  // Fetch activity logs separately since they use a polymorphic relation (entityType/entityId) 
  // and are not directly related to the Query model in Prisma.
  const activityLogs = await prisma.activityLog.findMany({
    where: { entityType: 'query', entityId: id },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
    take: 50
  });

  query.activityLogs = activityLogs;

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

  const agent = await prisma.user.findUnique({ 
    where: { id: assignedToUserId, isActive: true },
    include: { role: true }
  });
  if (!agent) throw new BusinessError('Assigned user is invalid or inactive');

  // Workload check — Admins and Owners are immune to lead caps
  const isHighPrivilege = ['admin', 'owner'].includes(agent.role.name);
  
  if (!isHighPrivilege) {
    const activeLeadsCount = await prisma.query.count({
      where: { assignedTo: assignedToUserId, status: { notIn: ['lost', 'invalid', 'confirmed'] } },
    });

    if (activeLeadsCount >= agent.maxLeads) {
      throw new BusinessError(`User ${agent.name} has reached their max lead capacity (${agent.maxLeads}).`);
    }
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
  // Use updateMany to be idempotent (if already deleted or not found, it just does nothing instead of 404)
  await prisma.queryNote.updateMany({
    where: { 
      id: noteId, 
      queryId,
      deletedAt: null // Only update if not already deleted
    },
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
    if (!existing.travelDateFrom) {
      throw new BusinessError('Travel start date is required before confirming a booking to create a Tour.');
    }
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
        startDate: existing.travelDateFrom,
        endDate: existing.travelDateTo || existing.travelDateFrom,
        totalPax: existing.adults + existing.children,
      }
    });
  }

  const updated = await prisma.query.update({
    where: { id },
    data: { status },
  });

  if (status === 'confirmed') {
    const clientService = require('./client.service');
    await clientService.ensureClientFromQuery(id);
  }

  return updated;
};

const sendEmail = async (id, userId, emailData, canViewAll) => {
  const query = await getQueryById(id, userId, canViewAll);
  if (!query.email) {
    throw new BusinessError('Cannot send email: This query does not have an email address associated with it.');
  }

  let finalSubject = emailData.subject;
  let finalBody = emailData.bodyRichText;

  // If a template ID is provided, fetch it and use its content
  if (emailData.templateId) {
    const template = await prisma.emailTemplate.findUnique({ where: { id: emailData.templateId } });
    if (!template) throw new NotFoundError('Email Template');
    finalSubject = template.subject || finalSubject;
    finalBody = template.bodyRichText || finalBody;
  }

  if (!finalSubject || !finalBody) {
    throw new BusinessError('Subject and Body are required to send an email');
  }

  // 1. Variable Substitution
  // We can expand these variables later based on requirements
  const variables = {
    '#{customerName}': query.name,
    '#{queryId}': query.queryCode,
  };

  for (const [key, value] of Object.entries(variables)) {
    const safeValue = value || '';
    // Use regex to replace all occurrences
    const regex = new RegExp(key.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g');
    finalSubject = finalSubject.replace(regex, safeValue);
    finalBody = finalBody.replace(regex, safeValue);
  }

  // Auto-append company signature from OrgSettings
  const orgSettingsService = require('./org-setting.service');
  const signature = await orgSettingsService.getSettingByKey('emailSignature');
  if (signature) {
    // Keep it clean. Assume signature contains its own HTML formatting or just append after <br><br>
    finalBody = `${finalBody}<br><br><div class="email-signature">${signature}</div>`;
  }

  // 2. Queue Email Job via BullMQ
  const queueService = require('./queue.service');
  await queueService.enqueueEmailJob(query.id, query.email, finalSubject, finalBody, emailData.cc);

  // 3. Log Activity
  await prisma.activityLog.create({
    data: {
      userId,
      action: 'query.email_sent',
      entityType: 'query',
      entityId: query.id,
      newValue: { subject: finalSubject, templateId: emailData.templateId },
    }
  });

  return true;
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
  sendEmail,
};
