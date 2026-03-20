// ============================================================
// TravelCRM — Report Controller
// ============================================================

const reportService = require('../services/report.service');

const getDashboardData = async (req, res, next) => {
  try {
    const canViewAll = req.user.permissions['query.view_all'];
    const kpis = await reportService.getDashboardKPIs(req.user.id, canViewAll);
    
    res.json({ success: true, data: kpis });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
};
