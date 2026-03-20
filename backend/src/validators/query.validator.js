// ============================================================
// TravelCRM — Query (Leads) Validator
// ============================================================

const { ValidationError } = require('../utils/AppError');
const { validateTransition } = require('../utils/statusTransitions');

const validateCreateQuery = (req, res, next) => {
  const { name, phone, leadSource } = req.body;
  if (!name) throw new ValidationError('Customer name is required');
  if (!phone || !/^\+?\d{10,15}$/.test(phone)) throw new ValidationError('Valid phone number (10-15 digits) is required');
  if (!leadSource) throw new ValidationError('Lead source is required');
  
  const validSources = ['website','call','walkin','whatsapp','facebook','google','reference','agent'];
  if (!validSources.includes(leadSource)) {
    throw new ValidationError(`Lead source must be one of: ${validSources.join(', ')}`);
  }
  
  next();
};

const validateAssignQuery = (req, res, next) => {
  const { assignedTo } = req.body;
  if (!assignedTo) throw new ValidationError('User ID (assignedTo) is required for assignment');
  next();
};

const validateStatusChange = (req, res, next) => {
  const { status } = req.body;
  if (!status) throw new ValidationError('Status is required');
  next();
};

module.exports = {
  validateCreateQuery,
  validateAssignQuery,
  validateStatusChange,
};
