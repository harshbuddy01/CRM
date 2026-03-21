const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllAgents = async (queryFilters = {}) => {
  const { search, page = 1, limit = 10 } = queryFilters;
  const skip = (page - 1) * limit;

  const where = {};
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { contactPerson: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [agents, total] = await Promise.all([
    prisma.b2BAgent.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { queries: true } }
      }
    }),
    prisma.b2BAgent.count({ where })
  ]);

  return {
    agents,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getAgentById = async (id) => {
  return await prisma.b2BAgent.findUnique({
    where: { id },
    include: {
      queries: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });
};

const createAgent = async (data) => {
  return await prisma.b2BAgent.create({ data });
};

const updateAgent = async (id, data) => {
  return await prisma.b2BAgent.update({
    where: { id },
    data
  });
};

const deleteAgent = async (id) => {
  return await prisma.b2BAgent.delete({ where: { id } });
};

module.exports = {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
};
