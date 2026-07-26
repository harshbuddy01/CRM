const express = require('express');
const emailCampaignController = require('../controllers/email-campaign.controller');
const { authenticate } = require('../middlewares/authenticate');

const router = express.Router();

// Bulk email campaigns routes
router.get('/smtp-status', authenticate, emailCampaignController.getSmtpStatus);
router.post('/send', authenticate, emailCampaignController.sendCampaign);

module.exports = router;
