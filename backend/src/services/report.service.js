// ============================================================
// TravelCRM — Report/Dashboard Service
// ============================================================
// Provides all 6 report types:
//   1. Dashboard KPIs (existing)
//   2. Lead Funnel Report
//   3. Sales Report
//   4. Collections Report
//   5. Tours Report
//   6. Marketing Report
// ============================================================

const prisma = require('../config/prisma');

/**
 * Parse date range from query params, defaulting to current month
 */
const parseDateRange = (dateFrom, dateTo) => {
  const now = new Date();
  const from = dateFrom ? new Date(dateFrom) : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = dateTo ? new Date(dateTo) : now;
  // Ensure 'to' covers the full day
  to.setHours(23, 59, 59, 999);
  return { from, to };
};

// ─── 1. Dashboard KPIs ──────────────────────────────────────

const getDashboardKPIs = async (userId, canViewAll) => {
  const whereScope = canViewAll ? {} : { assignedTo: userId };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const activeLeadsCount = await prisma.query.count({
    where: {
      ...whereScope,
      status: { notIn: ['lost', 'invalid', 'confirmed'] },
      deletedAt: null,
    }
  });

  const confirmedSalesCount = await prisma.query.count({
    where: {
      ...whereScope,
      status: 'confirmed',
      updatedAt: { gte: startOfMonth },
    },
  });

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

  const newLeadsMonth = await prisma.query.count({
    where: {
      ...whereScope,
      createdAt: { gte: startOfMonth },
      deletedAt: null,
    }
  });

  const conversionRate = newLeadsMonth > 0 ? ((confirmedSalesCount / newLeadsMonth) * 100).toFixed(1) : 0;

  return {
    activeLeads: activeLeadsCount,
    revenueThisMonth,
    conversionRate: parseFloat(conversionRate),
    newLeadsMonth,
  };
};

// ─── 2. Lead Funnel Report ───────────────────────────────────

const getLeadFunnelReport = async (dateFrom, dateTo) => {
  const { from, to } = parseDateRange(dateFrom, dateTo);

  // Count leads by status
  const statusCounts = await prisma.query.groupBy({
    by: ['status'],
    _count: { id: true },
    where: { createdAt: { gte: from, lte: to }, deletedAt: null },
  });

  // Count leads by assigned agent
  const agentCounts = await prisma.query.groupBy({
    by: ['assignedTo'],
    _count: { id: true },
    where: { createdAt: { gte: from, lte: to }, deletedAt: null, assignedTo: { not: null } },
  });

  // Get agent names
  const agentIds = agentCounts.map(a => a.assignedTo).filter(Boolean);
  const agents = await prisma.user.findMany({
    where: { id: { in: agentIds } },
    select: { id: true, name: true },
  });
  const agentMap = Object.fromEntries(agents.map(a => [a.id, a.name]));

  // Total leads in period
  const totalLeads = statusCounts.reduce((sum, s) => sum + s._count.id, 0);

  return {
    period: { from, to },
    totalLeads,
    byStatus: statusCounts.map(s => ({
      status: s.status,
      count: s._count.id,
      percentage: totalLeads > 0 ? ((s._count.id / totalLeads) * 100).toFixed(1) : 0,
    })),
    byAgent: agentCounts.map(a => ({
      agentId: a.assignedTo,
      agentName: agentMap[a.assignedTo] || 'Unknown',
      count: a._count.id,
    })),
  };
};

// ─── 3. Sales Report ─────────────────────────────────────────

const getSalesReport = async (dateFrom, dateTo) => {
  const { from, to } = parseDateRange(dateFrom, dateTo);

  // Confirmed queries in period
  const confirmedQueries = await prisma.query.findMany({
    where: {
      status: 'confirmed',
      updatedAt: { gte: from, lte: to },
      deletedAt: null,
    },
    include: {
      assignedUser: { select: { id: true, name: true } },
      payments: { where: { status: 'verified', deletedAt: null } },
    },
  });

  // Revenue per agent
  const agentRevenue = {};
  for (const q of confirmedQueries) {
    const agentName = q.assignedUser?.name || 'Unassigned';
    const agentId = q.assignedUser?.id || 'unassigned';
    if (!agentRevenue[agentId]) {
      agentRevenue[agentId] = { agentName, count: 0, revenue: 0 };
    }
    agentRevenue[agentId].count += 1;
    agentRevenue[agentId].revenue += q.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  }

  const totalRevenue = Object.values(agentRevenue).reduce((sum, a) => sum + a.revenue, 0);
  const totalBookings = confirmedQueries.length;

  return {
    period: { from, to },
    totalBookings,
    totalRevenue,
    avgDealSize: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
    byAgent: Object.values(agentRevenue).sort((a, b) => b.revenue - a.revenue),
  };
};

// ─── 4. Collections Report ───────────────────────────────────

const getCollectionsReport = async (dateFrom, dateTo) => {
  const { from, to } = parseDateRange(dateFrom, dateTo);

  // Payments by status
  const statusAgg = await prisma.payment.groupBy({
    by: ['status'],
    _sum: { amount: true },
    _count: { id: true },
    where: { paymentDate: { gte: from, lte: to }, deletedAt: null },
  });

  // Payments by mode
  const modeAgg = await prisma.payment.groupBy({
    by: ['mode'],
    _sum: { amount: true },
    _count: { id: true },
    where: { paymentDate: { gte: from, lte: to }, deletedAt: null },
  });

  const totalCollected = statusAgg
    .filter(s => s.status === 'verified' || s.status === 'banked')
    .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

  const totalPending = statusAgg
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

  return {
    period: { from, to },
    totalCollected,
    totalPending,
    byStatus: statusAgg.map(s => ({
      status: s.status,
      count: s._count.id,
      amount: Number(s._sum.amount || 0),
    })),
    byMode: modeAgg.map(m => ({
      mode: m.mode,
      count: m._count.id,
      amount: Number(m._sum.amount || 0),
    })),
  };
};

// ─── 5. Tours Report ─────────────────────────────────────────

const getToursReport = async (dateFrom, dateTo) => {
  const { from, to } = parseDateRange(dateFrom, dateTo);

  // Tours by status
  const statusCounts = await prisma.tour.groupBy({
    by: ['status'],
    _count: { id: true },
    where: { startDate: { gte: from, lte: to }, deletedAt: null },
  });

  // Upcoming tours in next 7 days
  const now = new Date();
  const next7 = new Date();
  next7.setDate(now.getDate() + 7);

  const upcomingTours = await prisma.tour.findMany({
    where: {
      status: 'upcoming',
      startDate: { gte: now, lte: next7 },
      deletedAt: null,
    },
    include: {
      query: { select: { name: true, queryCode: true, phone: true } },
      assignedOpsUser: { select: { name: true } },
    },
    orderBy: { startDate: 'asc' },
  });

  // Cancellation stats
  const cancellations = await prisma.tourCancellation.count({
    where: { createdAt: { gte: from, lte: to } },
  });

  return {
    period: { from, to },
    byStatus: statusCounts.map(s => ({
      status: s.status,
      count: s._count.id,
    })),
    upcomingNext7Days: upcomingTours.map(t => ({
      tourCode: t.tourCode,
      startDate: t.startDate,
      endDate: t.endDate,
      customerName: t.query?.name,
      queryCode: t.query?.queryCode,
      opsUser: t.assignedOpsUser?.name || 'Unassigned',
    })),
    cancellations,
  };
};

// ─── 6. Marketing Report ─────────────────────────────────────

const getMarketingReport = async (dateFrom, dateTo) => {
  const { from, to } = parseDateRange(dateFrom, dateTo);

  // Leads by source
  const sourceCounts = await prisma.query.groupBy({
    by: ['leadSource'],
    _count: { id: true },
    where: { createdAt: { gte: from, lte: to }, deletedAt: null },
  });

  // Conversion by source (confirmed leads by source)
  const confirmedBySource = await prisma.query.groupBy({
    by: ['leadSource'],
    _count: { id: true },
    where: {
      status: 'confirmed',
      createdAt: { gte: from, lte: to },
      deletedAt: null,
    },
  });

  const confirmedMap = Object.fromEntries(
    confirmedBySource.map(s => [s.leadSource, s._count.id])
  );

  // Campaign performance
  const campaignCounts = await prisma.query.groupBy({
    by: ['campaignName'],
    _count: { id: true },
    where: {
      campaignName: { not: null },
      createdAt: { gte: from, lte: to },
      deletedAt: null,
    },
  });

  const totalLeads = sourceCounts.reduce((sum, s) => sum + s._count.id, 0);

  return {
    period: { from, to },
    totalLeads,
    bySource: sourceCounts.map(s => ({
      source: s.leadSource,
      count: s._count.id,
      confirmed: confirmedMap[s.leadSource] || 0,
      conversionRate: s._count.id > 0
        ? (((confirmedMap[s.leadSource] || 0) / s._count.id) * 100).toFixed(1)
        : '0.0',
    })),
    byCampaign: campaignCounts.map(c => ({
      campaign: c.campaignName,
      count: c._count.id,
    })),
  };
};

module.exports = {
  getDashboardKPIs,
  getLeadFunnelReport,
  getSalesReport,
  getCollectionsReport,
  getToursReport,
  getMarketingReport,
};
