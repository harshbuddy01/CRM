const prisma = require('../config/prisma');

const getAllAgents = async (queryFilters = {}) => {
  const { search, page = 1, limit = 10 } = queryFilters;
  const skip = (page - 1) * limit;

  const where = {};
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { contactPerson: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search, mode: 'insensitive' } },
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
      },
      commissions: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  });
};

const createAgent = async (data) => {
  const filteredData = filterAgentData(data);
  return await prisma.b2BAgent.create({ data: filteredData });
};

const updateAgent = async (id, data) => {
  const filteredData = filterAgentData(data);
  return await prisma.b2BAgent.update({
    where: { id },
    data: filteredData
  });
};

const filterAgentData = (data) => {
  const {
    companyName,
    gstNumber,
    mobile,
    mobile2,
    email,
    email2,
    city,
    address,
    dob,
    anniversary,
    isActive,
    contactPerson,
    logoUrl,
    brandColor,
    markupType,
    markupValue,
    panNumber,
    bankName,
    bankAccount,
    bankIfsc,
    creditLimit,
    creditUsed,
    tier,
    notes
  } = data;

  return {
    companyName,
    gstNumber,
    mobile,
    mobile2,
    email,
    email2,
    city,
    address,
    dob,
    anniversary,
    isActive: isActive ?? true,
    contactPerson,
    logoUrl,
    brandColor,
    markupType,
    markupValue,
    panNumber,
    bankName,
    bankAccount,
    bankIfsc,
    creditLimit,
    creditUsed,
    tier,
    notes
  };
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
