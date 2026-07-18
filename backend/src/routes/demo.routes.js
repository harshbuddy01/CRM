const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demo.controller');
const rateLimit = require('express-rate-limit');
// Authentication for demo logout is handled by the inline decodeUser middleware below

// 5 signups per IP per 10 minutes
const signupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 5,
  message: { success: false, message: 'Too many demo signups from this IP, please try again after 10 minutes' }
});

router.post('/signup', signupLimiter, demoController.signup);
router.post('/verify-otp', demoController.verifyOtp);

// We need to decode user to delete their data
const jwt = require('jsonwebtoken');
const config = require('../config');
const { UnauthorizedError } = require('../utils/AppError');

const decodeUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            req.user = decoded;
            return next();
        } catch (err) {
            // Ignore
        }
    }
    next(new UnauthorizedError('Not authenticated'));
};

router.post('/logout', decodeUser, demoController.logout);

module.exports = router;
