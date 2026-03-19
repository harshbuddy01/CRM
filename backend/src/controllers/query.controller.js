// ============================================================
// TravelCRM — Query Controller
// ============================================================

const queryService = require('../services/query.service');

const create = async (req, res, next) => {
  try {
    const query = await queryService.createQuery(req.body);
    res.status(201).json({ success: true, message: 'Query created successfully', data: query });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const canViewAll = req.user.permissions['query.view_all'];
    const result = await queryService.listQueries({
      ...req.query,
      userId: req.user.id,
      canViewAll,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const canViewAll = req.user.permissions['query.view_all'];
    const query = await queryService.getQueryById(req.params.id, req.user.id, canViewAll);
    res.json({ success: true, data: query });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const canViewAll = req.user.permissions['query.view_all'];
    const canEditAll = req.user.permissions['query.edit_all'];
    const query = await queryService.updateQuery(req.params.id, req.body, req.user.id, canViewAll, canEditAll);
    res.json({ success: true, message: 'Query updated successfully', data: query });
  } catch (error) {
    next(error);
  }
};

const assign = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const query = await queryService.assignQuery(req.params.id, assignedTo, req.user.id);
    res.json({ success: true, message: `Query assigned to ${query.assignedUser.name}`, data: query });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await queryService.deleteQuery(req.params.id);
    res.json({ success: true, message: 'Query soft-deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  assign,
  remove,
};
