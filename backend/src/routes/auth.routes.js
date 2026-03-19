// ============================================================
// TravelCRM — Auth Routes
// ============================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

// Public routes
router.post('/login', authValidator.validateLogin, authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/change-password', authenticate, authValidator.validateChangePassword, authController.changePassword);

// Only admins can create new users
router.post('/register', authenticate, can('users.manage'), authValidator.validateRegister, authController.register);

module.exports = router;
