// ============================================================
// TravelCRM — Auth Validator
// ============================================================

const { ValidationError } = require('../utils/AppError');

const validateRegister = (req, res, next) => {
  const { name, email, password, roleId } = req.body;
  if (!name || typeof name !== 'string') throw new ValidationError('Name is required');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new ValidationError('Valid email is required');
  if (!password || password.length < 6) throw new ValidationError('Password must be at least 6 characters');
  if (!roleId) throw new ValidationError('Role ID is required');
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new ValidationError('Valid email is required');
  if (!password) throw new ValidationError('Password is required');
  next();
};

const validateChangePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword) throw new ValidationError('Old password is required');
  if (!newPassword || newPassword.length < 6) throw new ValidationError('New password must be at least 6 characters');
  if (oldPassword === newPassword) throw new ValidationError('New password must be different from old password');
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
};
