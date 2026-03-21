const masterService = require('../services/master-v2.service');

const getList = (modelName) => async (req, res, next) => {
  try {
    const data = await masterService.getMasters(modelName, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const create = (modelName) => async (req, res, next) => {
  try {
    const item = await masterService.createMaster(modelName, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const update = (modelName) => async (req, res, next) => {
  try {
    const item = await masterService.updateMaster(modelName, req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const remove = (modelName) => async (req, res, next) => {
  try {
    await masterService.deleteMaster(modelName, req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getList,
  create,
  update,
  remove,
};
