const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMasters = async (modelName, queryFilters = {}) => {
  const { search, page = 1, limit = 50 } = queryFilters;
  const skip = (page - 1) * limit;

  const where = { deletedAt: null };
  if (search) {
    if (modelName === 'supplier') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
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
  return await prisma[modelName].create({ data });
};

const updateMaster = async (modelName, id, data) => {
  return await prisma[modelName].update({
    where: { id },
    data
  });
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
