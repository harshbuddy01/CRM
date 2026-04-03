// ============================================================
// TravelCRM — Proposal Service
// ============================================================

const prisma = require('../config/prisma');
const { NotFoundError, ValidationError, BusinessError } = require('../utils/AppError');
const queueService = require('./queue.service');
const itineraryService = require('./itinerary.service');

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
      itineraryId: data.itineraryId || null,
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

const createProposalFromItinerary = async (queryId, userId, itineraryId) => {
  // Check if query exists
  const query = await prisma.query.findUnique({ where: { id: queryId } });
  if (!query) throw new NotFoundError('Query');

  // 1. Duplicate the Itinerary
  const newItinerary = await itineraryService.duplicate(itineraryId, userId);

  // 2. Auto-increment version logic
  const existingProposalsCount = await prisma.proposal.count({
    where: { queryId }
  });
  const version = existingProposalsCount + 1;

  // 3. Create Proposal linked to this new itinerary
  // Note: sellingPrice should reflect total package cost, not just per-person
  const perPerson = Number(newItinerary.perPersonCost) || 0;
  const adults = Number(newItinerary.adults) || 1;
  const children = Number(newItinerary.children) || 0;
  const calculatedTotal = perPerson > 0
    ? (adults * perPerson) + (children * perPerson * 0.5)
    : Number(newItinerary.totalCost) || 0;

  const proposal = await prisma.proposal.create({
    data: {
      queryId,
      itineraryId: newItinerary.id,
      version,
      totalCost: newItinerary.totalCost || 0,
      markupPct: newItinerary.markupPct || 0,
      sellingPrice: calculatedTotal,
      createdBy: userId,
      pdfStatus: 'pending',
    },
    include: {
      user: { select: { name: true } },
      itinerary: { select: { id: true, title: true, coverPhotoUrl: true } }
    }
  });

  // Trace Activity
  await prisma.activityLog.create({
    data: {
      entityType: 'query', 
      entityId: queryId, 
      action: 'proposal.created',
      userId: userId, 
      newValue: { version, fromItinerary: itineraryId, newItinerary: newItinerary.id }
    }
  });

  return proposal;
};

const createProposalWithNewItinerary = async (queryId, userId, title) => {
  // Check if query exists
  const query = await prisma.query.findUnique({ where: { id: queryId } });
  if (!query) throw new NotFoundError('Query');

  // 1. Create a blank Itinerary
  const itinerary = await itineraryService.create(userId, {
    title: title || `Itinerary for ${query.name}`,
    days: [{ title: 'Day 1', description: 'Arrival' }] // Start with 1 day
  });

  // 2. Auto-increment version
  const existingProposalsCount = await prisma.proposal.count({
    where: { queryId }
  });
  const version = existingProposalsCount + 1;

  // 3. Create Proposal
  const proposal = await prisma.proposal.create({
    data: {
      queryId,
      itineraryId: itinerary.id,
      version,
      totalCost: 0,
      markupPct: 0,
      sellingPrice: 0,
      createdBy: userId,
      pdfStatus: 'pending',
    },
    include: {
      user: { select: { name: true } },
      itinerary: { select: { id: true, title: true, coverPhotoUrl: true } }
    }
  });

  return proposal;
};

const getProposalsByQuery = async (queryId) => {
  return await prisma.proposal.findMany({
    where: { queryId, deletedAt: null },
    orderBy: { version: 'desc' },
    include: {
      user: { select: { name: true } },
      itinerary: {
        select: {
          id: true,
          title: true,
          coverPhotoUrl: true,
          days: {
            orderBy: { dayNumber: 'asc' },
            include: {
              events: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
    }
  });
};

const getProposalById = async (id, userId = null, canViewAll = false) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      query: { select: { queryCode: true, assignedTo: true, name: true, phone: true, email: true, adults: true, children: true, travelDateFrom: true, travelDateTo: true } },
      itinerary: true,
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

const removeProposal = async (id, userId, canViewAll = false) => {
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { query: { select: { assignedTo: true } } }
  });

  if (!proposal || proposal.deletedAt) throw new NotFoundError('Proposal');

  // Authorization: Only assigned user or admin
  if (userId && !canViewAll) {
    if (proposal.query.assignedTo !== userId) {
      throw new BusinessError('You do not have access to delete this proposal');
    }
  }

  return await prisma.proposal.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};

module.exports = {
  createProposal,
  createProposalFromItinerary,
  createProposalWithNewItinerary,
  getProposalsByQuery,
  getProposalById,
  listAllProposals,
  removeProposal,
};
