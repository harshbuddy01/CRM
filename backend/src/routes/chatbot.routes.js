const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const { authenticate } = require('../middlewares/authenticate');

// POST /api/v1/chatbot/ask
router.post('/ask', authenticate, chatbotController.askChatbot);

module.exports = router;
