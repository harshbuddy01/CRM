// ============================================================
// TravelCRM — Master Service (Destinations & Hotels)
// ============================================================

const prisma = require('../config/prisma');
const { NotFoundError, ValidationError } = require('../utils/AppError');

// --- DESTINATIONS ---

const listDestinations = async (isActiveOnly = false) => {
  const where = isActiveOnly ? { isActive: true } : {};
  return await prisma.destination.findMany({
    where,
    orderBy: { name: 'asc' },
  });
};

const createDestination = async (data) => {
  return await prisma.destination.create({
    data: {
      name: data.name,
      country: data.country,
      description: data.description,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
};

const updateDestination = async (id, data) => {
  const existing = await prisma.destination.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Destination');

  return await prisma.destination.update({
    where: { id },
    data: {
      name: data.name,
      country: data.country,
      description: data.description,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
    },
  });
};

const deleteDestination = async (id) => {
  const existing = await prisma.destination.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Destination');
  await prisma.destination.delete({ where: { id } });
  return true;
};

// --- HOTELS ---

const listHotels = async (destinationId = null, isActiveOnly = false) => {
  const where = {};
  if (isActiveOnly) where.isActive = true;
  if (destinationId) where.destinationId = destinationId;

  return await prisma.hotel.findMany({
    where,
    include: { destination: { select: { name: true } } },
    orderBy: [{ destination: { name: 'asc' } }, { name: 'asc' }],
  });
};

const createHotel = async (data) => {
  if (!data.destinationId) throw new ValidationError('Destination ID is required');
  
  const dest = await prisma.destination.findUnique({ where: { id: data.destinationId } });
  if (!dest) throw new NotFoundError('Destination');

  return await prisma.hotel.create({
    data: {
      destinationId: data.destinationId,
      name: data.name,
      category: data.category,
      basePrice: data.basePrice,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
    include: { destination: { select: { name: true } } },
  });
};

const updateHotel = async (id, data) => {
  const existing = await prisma.hotel.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Hotel');

  if (data.destinationId) {
    const dest = await prisma.destination.findUnique({ where: { id: data.destinationId } });
    if (!dest) throw new NotFoundError('Destination');
  }

  return await prisma.hotel.update({
    where: { id },
    data: {
      destinationId: data.destinationId || existing.destinationId,
      name: data.name || existing.name,
      category: data.category !== undefined ? data.category : existing.category,
      basePrice: data.basePrice !== undefined ? data.basePrice : existing.basePrice,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
    },
    include: { destination: { select: { name: true } } },
  });
};

const deleteHotel = async (id) => {
  const existing = await prisma.hotel.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Hotel');
  await prisma.hotel.delete({ where: { id } });
  return true;
};

module.exports = {
  listDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  listHotels,
  createHotel,
  updateHotel,
  deleteHotel,
};
