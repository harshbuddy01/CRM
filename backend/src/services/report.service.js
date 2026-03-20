// ============================================================
// TravelCRM — Report/Dashboard Service
// ============================================================

const prisma = require('../config/prisma');

const getDashboardKPIs = async (userId, canViewAll) => {
  const whereScope = canViewAll ? {} : { assignedTo: userId };

  // Calculate current month start
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Active Leads (not lost, invalid, or confirmed)
  const activeLeadsCount = await prisma.query.count({
    where: {
      ...whereScope,
      status: { notIn: ['lost', 'invalid', 'confirmed'] },
      deletedAt: null,
    }
  });

  // Confirmed Sales this month
  const confirmedQueries = await prisma.query.findMany({
    where: {
      ...whereScope,
      status: 'confirmed',
      updatedAt: { gte: startOfMonth },
    },
    select: { budget: true }
  });

  const confirmedSalesCount = confirmedQueries.length;
  const revenueThisMonth = confirmedQueries.reduce((sum, q) => sum + (q.budget || 0), 0);

  // New Leads this month
  const newLeadsMonth = await prisma.query.count({
    where: {
      ...whereScope,
      createdAt: { gte: startOfMonth },
      deletedAt: null,
    }
  });

  // Simple Conversion Rate (Confirmed / Total Created this month)
  const conversionRate = newLeadsMonth > 0 ? ((confirmedSalesCount / newLeadsMonth) * 100).toFixed(1) : 0;

  return {
    activeLeads: activeLeadsCount,
    revenueThisMonth,
    conversionRate: parseFloat(conversionRate),
    newLeadsMonth,
  };
};

module.exports = {
  getDashboardKPIs,
};
