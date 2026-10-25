const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');
const chatController = require('../controllers/whatsapp-chat.controller');

// All chat routes require authentication
router.use(authenticate);

// GET /v1/whatsapp-chat/conversations — List active chats
router.get('/conversations', chatController.getConversations);

// GET /v1/whatsapp-chat/leads — List CRM leads ready for WhatsApp messaging
router.get('/leads', chatController.getLeads);

// POST /v1/whatsapp-chat/bulk-send-template — Send approved Meta template to multiple selected leads
router.post('/bulk-send-template', chatController.bulkSendTemplate);

// GET /v1/whatsapp-chat/conversations/:phone — Fetch chat history for phone number
router.get('/conversations/:phone', chatController.getChatHistory);

// POST /v1/whatsapp-chat/conversations/:phone/send — Send live agent reply
router.post('/conversations/:phone/send', chatController.sendMessage);

module.exports = router;
