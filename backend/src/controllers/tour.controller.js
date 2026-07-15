// ============================================================
// TravelCRM — Tour Controller
// ============================================================

const tourService = require('../services/tour.service');
const { BusinessError } = require('../utils/AppError');

const list = async (req, res, next) => {
  try {
    const filterType = req.query.filterType || req.query.view || 'all';
    const result = await tourService.listTours({
      ...req.query,
      filterType, // 'ops', 'field', 'all'
      opsUserId: filterType === 'field' ? req.user.id : req.query.opsUserId,
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
    const tourId = req.params.id;
    const tourDetails = await tourService.getTourDetails(tourId);

    // Check role-based permission bypass
    const userEmail = req.user?.email?.toLowerCase().trim();
    const { immortalEmails } = require('../config');
    const isAdminOrOps = ['admin', 'system_owner', 'ops'].includes(req.user?.role) || 
                         immortalEmails.some(e => e.toLowerCase() === userEmail) ||
                         req.user?.permissions?.['tour.edit_all'];

    if (!isAdminOrOps) {
      // If not admin/ops, must be the assigned agent to update status/notes
      if (tourDetails.assignedOps !== req.user.id) {
        throw new BusinessError('You are not assigned to manage this tour');
      }
    }

    const tour = await tourService.updateTourOps(tourId, req.body);
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

const refundEstimate = async (req, res, next) => {
  try {
    const estimate = await tourService.estimateRefund(req.params.id);
    res.json({ success: true, data: estimate });
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
