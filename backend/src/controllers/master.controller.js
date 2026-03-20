// ============================================================
// TravelCRM — Master Controller
// ============================================================

const masterService = require('../services/master.service');

// --- DESTINATIONS ---

const getDestinations = async (req, res, next) => {
  try {
    const isActiveOnly = req.query.active === 'true';
    const destinations = await masterService.listDestinations(isActiveOnly);
    res.json({ success: true, data: destinations });
  } catch (error) {
    next(error);
  }
};

const createDestination = async (req, res, next) => {
  try {
    const { name, country, description, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const destination = await masterService.createDestination({ name, country, description, isActive });
    res.status(201).json({ success: true, message: 'Destination created', data: destination });
  } catch (error) {
    next(error);
  }
};

const updateDestination = async (req, res, next) => {
  try {
    const destination = await masterService.updateDestination(req.params.id, req.body);
    res.json({ success: true, message: 'Destination updated', data: destination });
  } catch (error) {
    next(error);
  }
};

const deleteDestination = async (req, res, next) => {
  try {
    await masterService.deleteDestination(req.params.id);
    res.json({ success: true, message: 'Destination deleted' });
  } catch (error) {
    next(error);
  }
};

// --- HOTELS ---

const getHotels = async (req, res, next) => {
  try {
    const destinationId = req.query.destinationId;
    const isActiveOnly = req.query.active === 'true';
    const hotels = await masterService.listHotels(destinationId, isActiveOnly);
    res.json({ success: true, data: hotels });
  } catch (error) {
    next(error);
  }
};

const createHotel = async (req, res, next) => {
  try {
    const { destinationId, name, category, basePrice, isActive } = req.body;
    if (!destinationId || !name) {
      return res.status(400).json({ success: false, message: 'Destination ID and Name are required' });
    }
    const hotel = await masterService.createHotel({ destinationId, name, category, basePrice, isActive });
    res.status(201).json({ success: true, message: 'Hotel created', data: hotel });
  } catch (error) {
    next(error);
  }
};

const updateHotel = async (req, res, next) => {
  try {
    const hotel = await masterService.updateHotel(req.params.id, req.body);
    res.json({ success: true, message: 'Hotel updated', data: hotel });
  } catch (error) {
    next(error);
  }
};

const deleteHotel = async (req, res, next) => {
  try {
    await masterService.deleteHotel(req.params.id);
    res.json({ success: true, message: 'Hotel deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getHotels,
  createHotel,
  updateHotel,
  deleteHotel,
};
