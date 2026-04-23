// ============================================================
// TravelCRM — Website Content Service
// Manages journeys, itinerary days, and trending destinations
// for the imagicaholidays public website.
// ============================================================

const prisma = require('../config/prisma');

// ─── Helpers ─────────────────────────────────────────────────

/** Safely parse an integer. Returns the parsed int if valid, otherwise the fallback. */
const parseIntSafe = (val, fallback = null) => {
  if (val == null) return fallback;
  const parsed = parseInt(val, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Safely parse a JSON string. Returns parsed value on success, fallback on error. */
const safeJsonParse = (val, fieldName, fallback = []) => {
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    console.warn(`⚠️ Failed to parse JSON for "${fieldName}":`, e.message, '— using fallback');
    return fallback;
  }
};

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

  // Parse numeric fields safely
  if (journeyData.durationNights != null) journeyData.durationNights = parseIntSafe(journeyData.durationNights, 1);
  if (journeyData.durationDays != null) journeyData.durationDays = parseIntSafe(journeyData.durationDays, 2);
  if (journeyData.pricePerGuest != null) journeyData.pricePerGuest = parseIntSafe(journeyData.pricePerGuest, 0);
  if (journeyData.originalPrice != null) journeyData.originalPrice = parseIntSafe(journeyData.originalPrice, 0);
  if (journeyData.ports != null) journeyData.ports = parseIntSafe(journeyData.ports, 2);
  if (journeyData.countries != null) journeyData.countries = parseIntSafe(journeyData.countries, 1);
  if (journeyData.sequence != null) journeyData.sequence = parseIntSafe(journeyData.sequence, 0);

  // Parse JSON string fields with error handling
  journeyData.badges = safeJsonParse(journeyData.badges, 'badges', []);
  journeyData.images = safeJsonParse(journeyData.images, 'images', []);

  // Handle boolean
  if (journeyData.isActive === 'true') journeyData.isActive = true;
  else if (journeyData.isActive === 'false') journeyData.isActive = false;

  return prisma.websiteJourney.create({
    data: {
      ...journeyData,
      days: days?.length
        ? {
            create: days.map((d, i) => ({
              dayNumber: parseIntSafe(d.dayNumber, i + 1),
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

  // Parse numeric fields safely
  if (journeyData.durationNights != null) journeyData.durationNights = parseIntSafe(journeyData.durationNights, 1);
  if (journeyData.durationDays != null) journeyData.durationDays = parseIntSafe(journeyData.durationDays, 2);
  if (journeyData.pricePerGuest != null) journeyData.pricePerGuest = parseIntSafe(journeyData.pricePerGuest, 0);
  if (journeyData.originalPrice != null) journeyData.originalPrice = parseIntSafe(journeyData.originalPrice, 0);
  if (journeyData.ports != null) journeyData.ports = parseIntSafe(journeyData.ports, 2);
  if (journeyData.countries != null) journeyData.countries = parseIntSafe(journeyData.countries, 1);
  if (journeyData.sequence != null) journeyData.sequence = parseIntSafe(journeyData.sequence, 0);

  // Parse JSON string fields with error handling
  if (journeyData.badges !== undefined) journeyData.badges = safeJsonParse(journeyData.badges, 'badges', []);
  if (journeyData.images !== undefined) journeyData.images = safeJsonParse(journeyData.images, 'images', []);

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
  const dayNumber = parseIntSafe(data.dayNumber, 0);
  return prisma.websiteJourneyDay.create({
    data: {
      journeyId,
      dayNumber,
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
  if (data.dayNumber != null) updateData.dayNumber = parseIntSafe(data.dayNumber, 0);
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
  if (data.sequence != null) data.sequence = parseIntSafe(data.sequence, 0);
  if (data.isActive === 'true') data.isActive = true;
  else if (data.isActive === 'false') data.isActive = false;
  return prisma.trendingDestination.create({ data });
};

const updateTrending = (id, data) => {
  if (data.sequence != null) data.sequence = parseIntSafe(data.sequence, 0);
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
