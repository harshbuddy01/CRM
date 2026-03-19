// ============================================================
// TravelCRM — Auth Controller
// ============================================================

const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const user = await authService.register({
      ...req.body,
      createdBy: req.user.id, // Only admins/managers can create users
    });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      // Return 400 if missing here, to avoid importing AppError unnecessarily
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }
    const tokens = await authService.refreshToken(refreshToken);
    res.json({
      success: true,
      message: 'Token refreshed',
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, oldPassword, newPassword);
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  refresh,
  changePassword,
};
