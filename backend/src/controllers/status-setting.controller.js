const statusSettingService = require('../services/status-setting.service');

const getAllStatuses = async (req, res, next) => {
  try {
    const statuses = await statusSettingService.getAllStatuses();
    res.json({ success: true, data: statuses });
  } catch (error) {
    next(error);
  }
};

const updateStatusSetting = async (req, res, next) => {
  try {
    const { code } = req.params;
    const updated = await statusSettingService.updateStatusSetting(code, req.body);
    res.json({ success: true, message: 'Status setting updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

const seedStatuses = async (req, res, next) => {
  try {
    await statusSettingService.seedDefaultStatuses();
    res.json({ success: true, message: 'Default statuses seeded successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStatuses,
  updateStatusSetting,
  seedStatuses,
};
