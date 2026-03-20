// ============================================================
// TravelCRM — Tour Controller
// ============================================================

const tourService = require('../services/tour.service');
const { BusinessError } = require('../utils/AppError');

const list = async (req, res, next) => {
  try {
    const result = await tourService.listTours({
      ...req.query,
      filterType: req.query.filterType, // 'ops', 'field', 'all'
      opsUserId: req.query.filterType === 'field' ? req.user.id : req.query.opsUserId,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const tour = await tourService.getTourDetails(req.params.id);
    res.json({ success: true, data: tour });
  } catch (error) {
    next(error);
  }
};

const updateOps = async (req, res, next) => {
  try {
    // Only Ops, Admins, or Field Agents assigned can update
    const tour = await tourService.updateTourOps(req.params.id, req.body);
    res.json({ success: true, message: 'Tour updated', data: tour });
  } catch (error) {
    next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      throw new BusinessError('Cancellation reason is required');
    }
    const cancellation = await tourService.cancelTour(req.params.id, req.user.id, reason);
    res.json({ success: true, message: 'Tour cancelled, refund calculated', data: cancellation });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  getById,
  updateOps,
  cancel,
  refundEstimate,
};
