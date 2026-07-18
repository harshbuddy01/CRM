const commissionService = require('../services/b2b-commission.service');

const getCommissionsByAgent = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const result = await commissionService.getCommissionsByAgent(agentId, req.query);
    res.json({
      status: 'success',
      data: result.commissions,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const createCommission = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const data = { ...req.body, agentId };
    const newCommission = await commissionService.createCommission(data);
    res.status(201).json({
      status: 'success',
      data: newCommission
    });
  } catch (error) {
    next(error);
  }
};

const updateCommission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await commissionService.updateCommission(id, req.body);
    res.json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const getCommissionSummary = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const summary = await commissionService.getCommissionSummary(agentId);
    res.json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommissionsByAgent,
  createCommission,
  updateCommission,
  getCommissionSummary
};
