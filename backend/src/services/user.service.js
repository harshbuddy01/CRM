// ============================================================
// TravelCRM — User Service
// ============================================================

const prisma = require('../config/prisma');

const listActiveAgents = async () => {
  return await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: {
        select: {
          name: true,
        }
      },
      maxLeads: true,
      queries: {
        where: { status: { notIn: ['lost', 'invalid', 'confirmed'] } }
      }
    },
    orderBy: { name: 'asc' }
  });
};

module.exports = {
  listActiveAgents,
};
