const emailTemplateService = require('../services/email-template.service');

const createTemplate = async (req, res, next) => {
  try {
    const template = await emailTemplateService.createTemplate(req.body);
    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

const getTemplates = async (req, res, next) => {
  try {
    const templates = await emailTemplateService.getTemplates();
    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

const getActiveTemplates = async (req, res, next) => {
  try {
    const templates = await emailTemplateService.getActiveTemplates();
    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

const getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const template = await emailTemplateService.getTemplateById(id);
    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const template = await emailTemplateService.updateTemplate(id, req.body);
    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    await emailTemplateService.deleteTemplate(id);
    res.status(200).json({
      success: true,
      message: 'Email template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  getActiveTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};
