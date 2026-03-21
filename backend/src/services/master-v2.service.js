const prisma = require('../config/prisma');

const getMasters = async (modelName, queryFilters = {}) => {
  const { search, page = 1, limit = 50 } = queryFilters;
  const skip = (page - 1) * limit;

  const where = { deletedAt: null };
  if (search) {
    if (modelName === 'supplier') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    } else {
      where.name = { contains: search, mode: 'insensitive' };
    }
  }

  // Dynamic sorting field selection
  const sortFieldMapping = {
    'transfer': 'vehicleType',
    'supplier': 'name',
    'activity': 'name',
    'room-type': 'name',
    'meal-plan': 'name',
    'package-theme': 'name'
  };
  const orderByField = sortFieldMapping[modelName] || 'name';

  const [items, total] = await Promise.all([
    prisma[modelName].findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { [orderByField]: 'asc' },
    }),
    prisma[modelName].count({ where })
  ]);

  return { items, total, totalPages: Math.ceil(total / limit) };
};

const createMaster = async (modelName, data) => {
  const filteredData = filterMasterData(modelName, data);
  return await prisma[modelName].create({ data: filteredData });
};

const updateMaster = async (modelName, id, data) => {
  const filteredData = filterMasterData(modelName, data);
  return await prisma[modelName].update({
    where: { id },
    data: filteredData
  });
};

/**
 * Filter sensitive or unknown fields before passing to Prisma
 */
const filterMasterData = (modelName, data) => {
  const { id, createdAt, updatedAt, deletedAt, ...rest } = data;
  const { BadRequestError } = require('../utils/AppError');
  
  if (modelName === 'supplier') {
    const { name, type, contactPerson, email, phone, city, address, isActive } = rest;
    if (!name) throw new BadRequestError('Supplier name is required');
    return { name, type: type || 'hotel', contactPerson, email, phone, city, address, isActive: isActive ?? true };
  }
  
  if (modelName === 'activity') {
    const { name, destinationId, pricePerPerson, description, isActive } = rest;
    if (!name || !destinationId || pricePerPerson === undefined) {
      throw new BadRequestError('Activity name, destination, and price are required');
    }
    return { 
      name, 
      destinationId, 
      pricePerPerson: Number(pricePerPerson), 
      description, 
      isActive: isActive ?? true 
    };
  }

  if (modelName === 'transfer') {
    const { vehicleType, destinationId, price, description, isActive } = rest;
    if (!vehicleType || !destinationId || price === undefined) {
      throw new BadRequestError('Transfer vehicle type, destination, and price are required');
    }
    return { 
      vehicleType, 
      destinationId, 
      price: Number(price), 
      description, 
      isActive: isActive ?? true 
    };
  }

  // Generic for simple masters (RoomType, MealPlan, etc)
  if (!rest.name) throw new BadRequestError(`${modelName} name is required`);
  return { 
    name: rest.name, 
    price: rest.price ? Number(rest.price) : undefined,
    isActive: rest.isActive ?? true 
  };
};

const deleteMaster = async (modelName, id) => {
  return await prisma[modelName].update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};

module.exports = {
  getMasters,
  createMaster,
  updateMaster,
  deleteMaster,
};
