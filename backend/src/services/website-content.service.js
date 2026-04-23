// ============================================================
// TravelCRM — Website Content Service
// Manages journeys, itinerary days, and trending destinations
// for the imagicaholidays public website.
// ============================================================

const prisma = require('../config/prisma');

// ─── Journeys ────────────────────────────────────────────────

const listJourneys = () =>
  prisma.websiteJourney.findMany({
    include: { days: { orderBy: { dayNumber: 'asc' } } },
    orderBy: [{ sequence: 'asc' }, { createdAt: 'desc' }],
  });

const getJourney = (id) =>
  prisma.websiteJourney.findUnique({
    where: { id },
    include: { days: { orderBy: { dayNumber: 'asc' } } },
  });

const createJourney = async (data) => {
  const { days, ...journeyData } = data;

  // Parse numeric fields from string inputs
  if (journeyData.durationNights) journeyData.durationNights = parseInt(journeyData.durationNights, 10);
  if (journeyData.durationDays) journeyData.durationDays = parseInt(journeyData.durationDays, 10);
  if (journeyData.pricePerGuest) journeyData.pricePerGuest = parseInt(journeyData.pricePerGuest, 10);
  if (journeyData.originalPrice) journeyData.originalPrice = parseInt(journeyData.originalPrice, 10);
  if (journeyData.ports) journeyData.ports = parseInt(journeyData.ports, 10);
  if (journeyData.countries) journeyData.countries = parseInt(journeyData.countries, 10);
  if (journeyData.sequence != null) journeyData.sequence = parseInt(journeyData.sequence, 10);

  // Parse JSON string fields
  if (typeof journeyData.badges === 'string') journeyData.badges = JSON.parse(journeyData.badges);
  if (typeof journeyData.images === 'string') journeyData.images = JSON.parse(journeyData.images);

  // Handle boolean
  if (journeyData.isActive === 'true') journeyData.isActive = true;
  else if (journeyData.isActive === 'false') journeyData.isActive = false;

  return prisma.websiteJourney.create({
    data: {
      ...journeyData,
      days: days?.length
        ? {
            create: days.map((d, i) => ({
              dayNumber: d.dayNumber || i + 1,
              title: d.title,
              date: d.date,
              time: d.time,
              description: d.description || null,
              image: d.image || null,
            })),
          }
        : undefined,
    },
    include: { days: { orderBy: { dayNumber: 'asc' } } },
  });
};

const updateJourney = async (id, data) => {
  const { days, ...journeyData } = data;

  // Parse numeric fields
  if (journeyData.durationNights != null) journeyData.durationNights = parseInt(journeyData.durationNights, 10);
  if (journeyData.durationDays != null) journeyData.durationDays = parseInt(journeyData.durationDays, 10);
  if (journeyData.pricePerGuest != null) journeyData.pricePerGuest = parseInt(journeyData.pricePerGuest, 10);
  if (journeyData.originalPrice != null) journeyData.originalPrice = parseInt(journeyData.originalPrice, 10);
  if (journeyData.ports != null) journeyData.ports = parseInt(journeyData.ports, 10);
  if (journeyData.countries != null) journeyData.countries = parseInt(journeyData.countries, 10);
  if (journeyData.sequence != null) journeyData.sequence = parseInt(journeyData.sequence, 10);

  // Parse JSON string fields
  if (typeof journeyData.badges === 'string') journeyData.badges = JSON.parse(journeyData.badges);
  if (typeof journeyData.images === 'string') journeyData.images = JSON.parse(journeyData.images);

  // Handle boolean
  if (journeyData.isActive === 'true') journeyData.isActive = true;
  else if (journeyData.isActive === 'false') journeyData.isActive = false;

  return prisma.websiteJourney.update({
    where: { id },
    data: journeyData,
    include: { days: { orderBy: { dayNumber: 'asc' } } },
  });
};

const deleteJourney = (id) =>
  prisma.websiteJourney.delete({ where: { id } });

// ─── Journey Days ────────────────────────────────────────────

const addJourneyDay = (journeyId, data) => {
  return prisma.websiteJourneyDay.create({
    data: {
      journeyId,
      dayNumber: parseInt(data.dayNumber, 10),
      title: data.title,
      date: data.date,
      time: data.time,
      description: data.description || null,
      image: data.image || null,
    },
  });
};

const updateJourneyDay = (dayId, data) => {
  const updateData = {};
  if (data.dayNumber != null) updateData.dayNumber = parseInt(data.dayNumber, 10);
  if (data.title != null) updateData.title = data.title;
  if (data.date != null) updateData.date = data.date;
  if (data.time != null) updateData.time = data.time;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.image !== undefined) updateData.image = data.image || null;

  return prisma.websiteJourneyDay.update({
    where: { id: dayId },
    data: updateData,
  });
};

const removeJourneyDay = (dayId) =>
  prisma.websiteJourneyDay.delete({ where: { id: dayId } });

// ─── Trending Destinations ──────────────────────────────────

const listTrending = () =>
  prisma.trendingDestination.findMany({
    orderBy: [{ sequence: 'asc' }],
  });

const createTrending = (data) => {
  if (data.sequence != null) data.sequence = parseInt(data.sequence, 10);
  if (data.isActive === 'true') data.isActive = true;
  else if (data.isActive === 'false') data.isActive = false;
  return prisma.trendingDestination.create({ data });
};

const updateTrending = (id, data) => {
  if (data.sequence != null) data.sequence = parseInt(data.sequence, 10);
  if (data.isActive === 'true') data.isActive = true;
  else if (data.isActive === 'false') data.isActive = false;
  return prisma.trendingDestination.update({ where: { id }, data });
};

const deleteTrending = (id) =>
  prisma.trendingDestination.delete({ where: { id } });

// ─── Public Endpoints (for website) ─────────────────────────

const getPublicJourneys = () =>
  prisma.websiteJourney.findMany({
    where: { isActive: true },
    include: { days: { orderBy: { dayNumber: 'asc' } } },
    orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }],
  });

const getPublicTrending = () =>
  prisma.trendingDestination.findMany({
    where: { isActive: true },
    orderBy: [{ sequence: 'asc' }],
  });

module.exports = {
  listJourneys, getJourney, createJourney, updateJourney, deleteJourney,
  addJourneyDay, updateJourneyDay, removeJourneyDay,
  listTrending, createTrending, updateTrending, deleteTrending,
  getPublicJourneys, getPublicTrending,
};
