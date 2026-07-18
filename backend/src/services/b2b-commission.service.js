const prisma = require('../config/prisma');

const getCommissionsByAgent = async (agentId, filters = {}) => {
  const { page = 1, limit = 20, status } = filters;
  const skip = (page - 1) * limit;

  const where = { agentId };
  if (status) {
    where.status = status;
  }

  const [commissions, total] = await Promise.all([
    prisma.b2BCommission.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        query: {
          select: { queryCode: true, name: true, status: true }
        }
      }
    }),
    prisma.b2BCommission.count({ where })
  ]);

  return {
    commissions,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const createCommission = async (data) => {
  const { agentId, queryId, description, amount, type, status, paidAt } = data;
  return await prisma.b2BCommission.create({
    data: {
      agentId,
      queryId,
      description,
      amount: parseFloat(amount) || 0,
      type: type || 'earned',
      status: status || 'pending',
      paidAt: paidAt ? new Date(paidAt) : null
    }
  });
};

const updateCommission = async (id, data) => {
  const { description, amount, type, status, paidAt } = data;
  
  const updateData = {};
  if (description !== undefined) updateData.description = description;
  if (amount !== undefined) updateData.amount = parseFloat(amount);
  if (type !== undefined) updateData.type = type;
  if (status !== undefined) updateData.status = status;
  if (paidAt !== undefined) updateData.paidAt = paidAt ? new Date(paidAt) : null;

  return await prisma.b2BCommission.update({
    where: { id },
    data: updateData
  });
};

const getCommissionSummary = async (agentId) => {
  const result = await prisma.b2BCommission.groupBy({
    by: ['status', 'type'],
    where: { agentId },
    _sum: {
      amount: true
    }
  });
  
  // Transform to a friendlier summary object
  const summary = {
    totalEarned: 0,
    totalPaid: 0,
    totalPending: 0
  };

  result.forEach(group => {
    const amt = group._sum.amount || 0;
    if (group.type === 'earned') {
      summary.totalEarned += amt;
    }
    
    if (group.status === 'paid') {
      summary.totalPaid += amt;
    } else if (group.status === 'pending') {
      summary.totalPending += amt;
    }
  });

  return summary;
};

module.exports = {
  getCommissionsByAgent,
  createCommission,
  updateCommission,
  getCommissionSummary
};
