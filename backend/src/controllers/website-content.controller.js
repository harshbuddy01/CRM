// ============================================================
// TravelCRM — Website Content Controller
// ============================================================

const svc = require('../services/website-content.service');

// ─── Journeys ────────────────────────────────────────────────

const listJourneys = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.listJourneys() }); }
  catch (e) { next(e); }
};

const getJourney = async (req, res, next) => {
  try {
    const journey = await svc.getJourney(req.params.id);
    if (!journey) return res.status(404).json({ success: false, message: 'Journey not found' });
    res.json({ success: true, data: journey });
  } catch (e) { next(e); }
};

const createJourney = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.createJourney(req.body) }); }
  catch (e) { next(e); }
};

const updateJourney = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.updateJourney(req.params.id, req.body) }); }
  catch (e) { next(e); }
};

const deleteJourney = async (req, res, next) => {
  try { await svc.deleteJourney(req.params.id); res.json({ success: true, message: 'Journey deleted' }); }
  catch (e) { next(e); }
};

// ─── Journey Days ────────────────────────────────────────────

const addJourneyDay = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.addJourneyDay(req.params.id, req.body) }); }
  catch (e) { next(e); }
};

const updateJourneyDay = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.updateJourneyDay(req.params.dayId, req.body) }); }
  catch (e) { next(e); }
};

const removeJourneyDay = async (req, res, next) => {
  try { await svc.removeJourneyDay(req.params.dayId); res.json({ success: true, message: 'Day removed' }); }
  catch (e) { next(e); }
};

// ─── Trending Destinations ──────────────────────────────────

const listTrending = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.listTrending() }); }
  catch (e) { next(e); }
};

const createTrending = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await svc.createTrending(req.body) }); }
  catch (e) { next(e); }
};

const updateTrending = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.updateTrending(req.params.id, req.body) }); }
  catch (e) { next(e); }
};

const deleteTrending = async (req, res, next) => {
  try { await svc.deleteTrending(req.params.id); res.json({ success: true, message: 'Trending item deleted' }); }
  catch (e) { next(e); }
};

// ─── Public (no auth) ────────────────────────────────────────

const getPublicJourneys = async (req, res, next) => {
  try {
    const data = await svc.getPublicJourneys();
    // Transform to match the format constants.ts uses on the website
    const formatted = data.map(j => ({
      id: j.slug,
      title: j.title,
      regions: j.regions,
      durationNights: j.durationNights,
      durationDays: j.durationDays,
      pricePerGuest: j.pricePerGuest,
      originalPrice: j.originalPrice,
      departurePort: j.departurePort,
      returnPort: j.returnPort,
      departureDate: j.departureDate,
      returnDate: j.returnDate,
      ports: j.ports,
      countries: j.countries,
      vehicle: j.vehicle,
      badges: j.badges,
      images: j.images,
      mapImage: j.mapImage,
      overview: j.overview,
      itinerary: (Array.isArray(j.days) ? j.days : []).map(d => ({
        day: `Day ${d.dayNumber}`,
        title: d.title,
        date: d.date,
        time: d.time,
        description: d.description,
        image: d.image,
      })),
    }));
    res.json({ success: true, data: formatted });
  } catch (e) { next(e); }
};

const getPublicTrending = async (req, res, next) => {
  try {
    const data = await svc.getPublicTrending();
    // Transform to match the TRENDING_COLLECTION format
    const formatted = data.map((t, i) => ({
      id: i + 1,
      region: t.region,
      title: t.title,
      tagline: t.tagline,
      image: t.image,
      lastUpdated: t.lastUpdated,
      link: t.link,
    }));
    res.json({ success: true, data: formatted });
  } catch (e) { next(e); }
};

module.exports = {
  listJourneys, getJourney, createJourney, updateJourney, deleteJourney,
  addJourneyDay, updateJourneyDay, removeJourneyDay,
  listTrending, createTrending, updateTrending, deleteTrending,
  getPublicJourneys, getPublicTrending,
};
