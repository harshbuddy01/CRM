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

  const [items, total] = await Promise.all([
    prisma[modelName].findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { name: 'asc' },
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
  
  // Specific model field whitelists if needed
  if (modelName === 'supplier') {
    const { name, type, contactPerson, email, phone, city, address, isActive } = rest;
    return { name, type, contactPerson, email, phone, city, address, isActive: isActive ?? true };
  }
  
  if (modelName === 'activity') {
    const { name, destinationId, pricePerPerson, description, isActive } = rest;
    return { name, destinationId, pricePerPerson, description, isActive: isActive ?? true };
  }

  if (modelName === 'transfer') {
    const { vehicleType, destinationId, price, description, isActive } = rest;
    return { vehicleType, destinationId, price, description, isActive: isActive ?? true };
  }

  // Generic for simple masters (RoomType, MealPlan, etc)
  return { 
    name: rest.name, 
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
