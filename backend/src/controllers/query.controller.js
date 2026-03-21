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

const createFromWebhook = async (req, res, next) => {
  try {
    // For external forms (e.g. Hostinger landing pages)
    const queryData = {
      ...req.body,
      leadSource: req.body.leadSource || 'website',
      status: 'new', 
    };
    
    const isDuplicate = await queryService.checkDuplicatePhone(queryData.phone);
    if (isDuplicate) {
       return res.status(409).json({ success: false, message: 'Lead already exists' });
    }

    const query = await queryService.createQuery(queryData);
    res.status(201).json({ success: true, message: 'Lead captured successfully', queryId: query.id });
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

const changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    if (status === 'confirmed' && req.user.role !== 'admin') {
      const { ForbiddenError } = require('../utils/AppError');
      throw new ForbiddenError('Only Administrators can confirm a booking.');
    }

    const canViewAll = req.user.permissions['query.view_all'];
    const canEditAll = req.user.permissions['query.edit_all'];
    const query = await queryService.changeQueryStatus(req.params.id, status, req.user.id, canViewAll, canEditAll);
    res.json({ success: true, message: `Query status updated to ${status}`, data: query });
  } catch (error) {
    next(error);
  }
};

const duplicateCheck = async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const isDuplicate = await queryService.checkDuplicatePhone(phone);
    res.json({ success: true, data: { isDuplicate } });
  } catch (error) {
    next(error);
  }
};

const addNote = async (req, res, next) => {
  try {
    const { note, followUpAt } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }
    const created = await queryService.addNote(req.params.id, req.user.id, note, followUpAt);
    res.status(201).json({ success: true, message: 'Note added', data: created });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    await queryService.deleteNote(req.params.id, req.params.noteId, req.user.id);
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};

const sendEmail = async (req, res, next) => {
  try {
    const { templateId, subject, body, cc } = req.body;
    const queryId = req.params.id;

    // Use emailTemplateService to handle the logic
    const emailTemplateService = require('../services/email-template.service');
    // Note: We'll need to implement sendQueryEmail in the service to handle variable interpolation and SendGrid
    const result = await emailTemplateService.sendQueryEmail({
      queryId,
      templateId,
      subject,
      body,
      cc,
      sentBy: req.user.id,
    });

    res.json({ success: true, message: 'Email queued for sending', data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  createFromWebhook,
  list,
  getById,
  update,
  assign,
  remove,
  changeStatus,
  duplicateCheck,
  addNote,
  deleteNote,
  sendEmail,
};
