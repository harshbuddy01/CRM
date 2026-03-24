// ============================================================
// TravelCRM — Report Controller
// ============================================================

const reportService = require('../services/report.service');

const getDashboardData = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const canViewAll = isAdmin || req.user.permissions['query.view_all'];
    const kpis = await reportService.getDashboardKPIs(req.user.id, canViewAll);
    res.json({ success: true, data: kpis });
  } catch (error) {
    next(error);
  }
};

const getLeadFunnel = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const data = await reportService.getLeadFunnelReport(dateFrom, dateTo);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getSales = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const data = await reportService.getSalesReport(dateFrom, dateTo);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getCollections = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const data = await reportService.getCollectionsReport(dateFrom, dateTo);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getTours = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const data = await reportService.getToursReport(dateFrom, dateTo);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMarketing = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const data = await reportService.getMarketingReport(dateFrom, dateTo);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * CSV Export — Generic endpoint for any report type
 * GET /reports/:type/csv?dateFrom=...&dateTo=...
 */
const exportCsv = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { dateFrom, dateTo } = req.query;
    let data;
    let csvContent;
    let filename;

    switch (type) {
      case 'lead-funnel': {
        data = await reportService.getLeadFunnelReport(dateFrom, dateTo);
        csvContent = 'Status,Count,Percentage\n' +
          data.byStatus.map(s => `${s.status},${s.count},${s.percentage}%`).join('\n');
        filename = 'lead-funnel-report.csv';
        break;
      }
      case 'sales': {
        data = await reportService.getSalesReport(dateFrom, dateTo);
        csvContent = 'Agent,Bookings,Revenue\n' +
          data.byAgent.map(a => `${a.agentName},${a.count},${a.revenue}`).join('\n');
        filename = 'sales-report.csv';
        break;
      }
      case 'collections': {
        data = await reportService.getCollectionsReport(dateFrom, dateTo);
        csvContent = 'Payment Mode,Count,Amount\n' +
          data.byMode.map(m => `${m.mode},${m.count},${m.amount}`).join('\n');
        filename = 'collections-report.csv';
        break;
      }
      case 'tours': {
        data = await reportService.getToursReport(dateFrom, dateTo);
        csvContent = 'Status,Count\n' +
          data.byStatus.map(s => `${s.status},${s.count}`).join('\n');
        filename = 'tours-report.csv';
        break;
      }
      case 'marketing': {
        data = await reportService.getMarketingReport(dateFrom, dateTo);
        csvContent = 'Source,Leads,Confirmed,Conversion Rate\n' +
          data.bySource.map(s => `${s.source},${s.count},${s.confirmed},${s.conversionRate}%`).join('\n');
        filename = 'marketing-report.csv';
        break;
      }
      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getLeadFunnel,
  getSales,
  getCollections,
  getTours,
  getMarketing,
  exportCsv,
};
