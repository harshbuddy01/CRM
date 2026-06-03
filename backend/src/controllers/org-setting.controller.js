const orgSettingService = require('../services/org-setting.service');

const getAllSettings = async (req, res, next) => {
  try {
    const settings = await orgSettingService.getAllSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const getSettingByKey = async (req, res, next) => {
  try {
    const value = await orgSettingService.getSettingByKey(req.params.key);
    res.json({ success: true, data: { [req.params.key]: value } });
  } catch (error) {
    next(error);
  }
};

const saveSettings = async (req, res, next) => {
  try {
    const updatedSettings = await orgSettingService.saveSettings(req.body);
    res.json({ success: true, message: 'Settings saved successfully', data: updatedSettings });
  } catch (error) {
    next(error);
  }
};

const uploadAsset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    const result = await orgSettingService.uploadAsset(req.file);
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  saveSettings,
  uploadAsset,
};
