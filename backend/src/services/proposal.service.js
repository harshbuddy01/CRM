// ============================================================
// TravelCRM — Proposal Service
// ============================================================

const prisma = require('../config/prisma');
const { NotFoundError, ValidationError } = require('../utils/AppError');
const queueService = require('./queue.service');

const createProposal = async (queryId, userId, data) => {
  // Check if query exists
  const query = await prisma.query.findUnique({ where: { id: queryId } });
  if (!query) throw new NotFoundError('Query');

  // Auto-increment version logic
  const existingProposals = await prisma.proposal.count({
    where: { queryId }
  });
  const version = existingProposals + 1;

  // Calculate totals
  const totalCost = data.days.reduce((acc, day) => acc + (Number(day.dayCost) || 0), 0);
  const markupPct = Number(data.markupPct) || 0;
  const sellingPrice = totalCost + (totalCost * (markupPct / 100));

  // Create Proposal and Days in a single transaction
  const proposal = await prisma.proposal.create({
    data: {
      queryId,
      version,
      totalCost,
      markupPct,
      sellingPrice,
      createdBy: userId,
      pdfStatus: 'pending',
      days: {
        create: data.days.map((day, index) => ({
          dayNumber: index + 1,
          destinationId: day.destinationId || null,
          hotelId: day.hotelId || null,
          activities: day.activities || '',
          description: day.description || null,
          mealsIncluded: day.mealsIncluded || 'BB',
          transport: day.transport || '',
          dayCost: Number(day.dayCost) || 0,
        }))
      }
    },
    include: {
      days: {
        include: {
          destination: { select: { name: true } },
          hotel: { select: { name: true, category: true } }
        }
      },
      user: { select: { name: true } }
    }
  });

  // Enqueue async PDF Generation to avoid blocking the API Response (Railway memory fix setup)
  await queueService.enqueuePdfJob(proposal.id, queryId);

  // Trace Proposal Building to the specific user
  await prisma.activityLog.create({
    data: {
      entityType: 'query', 
      entityId: queryId, 
      action: 'proposal.created',
      userId: userId, 
      newValue: { version, amount: sellingPrice }
    }
  });

  return proposal;
};

const getProposalsByQuery = async (queryId) => {
  return await prisma.proposal.findMany({
    where: { queryId, deletedAt: null },
    orderBy: { version: 'desc' },
    include: {
      user: { select: { name: true } }
    }
  });
};

const getProposalById = async (id, userId = null, canViewAll = false) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      query: { select: { assignedTo: true, name: true, phone: true, email: true, adults: true, children: true, travelDateFrom: true, travelDateTo: true } },
      days: {
        orderBy: { dayNumber: 'asc' },
        include: {
          destination: { select: { name: true } },
          hotel: { select: { name: true, category: true } }
        }
      },
      user: { select: { name: true } }
    }
  });
  if (!proposal || proposal.deletedAt) throw new NotFoundError('Proposal');

  // If a specific userId is provided, enforce access control
  if (userId && !canViewAll) {
    if (proposal.query.assignedTo !== userId) {
      throw new BusinessError('You do not have access to view or modify this proposal');
    }
  }

  return proposal;
};

const listAllProposals = async () => {
  return await prisma.proposal.findMany({
    where: { deletedAt: null },
    include: {
      query: { select: { queryCode: true, name: true, destination: true } },
      user: { select: { name: true } }
    },
    take: 200,
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = {
  createProposal,
  getProposalsByQuery,
  getProposalById,
  listAllProposals,
};
