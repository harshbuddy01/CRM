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
  const confirmedSalesCount = await prisma.query.count({
    where: {
      ...whereScope,
      status: 'confirmed',
      updatedAt: { gte: startOfMonth },
    },
  });

  // Revenue this month — from actual verified payments, not budget estimates
  const revenueAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: 'verified',
      paymentDate: { gte: startOfMonth },
      deletedAt: null,
      ...(canViewAll ? {} : { query: { assignedTo: userId } }),
    },
  });
  const revenueThisMonth = Number(revenueAgg._sum.amount || 0);

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
