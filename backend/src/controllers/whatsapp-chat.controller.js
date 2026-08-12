const prisma = require('../config/prisma');
const whatsappService = require('../services/whatsapp.service');
const logger = require('../utils/logger');

/**
 * GET /v1/whatsapp/conversations
 * List recent WhatsApp conversations with last message, unread status, and client details.
 */
const getConversations = async (req, res, next) => {
  try {
    // 1. Fetch recent messages
    const recentMessages = await prisma.whatsappMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // 2. Group by clean phone number
    const conversationsMap = {};
    for (const msg of recentMessages) {
      const cleanPhone = msg.phone.replace(/\D/g, '');
      if (!conversationsMap[cleanPhone]) {
        conversationsMap[cleanPhone] = {
          phone: cleanPhone,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          direction: msg.direction,
          status: msg.status,
          clientName: msg.clientName || null,
          unreadCount: 0
        };
      }
      if (msg.direction === 'INBOUND' && msg.status === 'DELIVERED') {
        conversationsMap[cleanPhone].unreadCount += 1;
      }
    }

    // 3. Match with Client/Query records for client names
    const phoneList = Object.keys(conversationsMap);
    if (phoneList.length > 0) {
      const clients = await prisma.client.findMany({
        where: {
          OR: phoneList.map(p => ({ phone: { contains: p.slice(-10) } }))
        },
        select: { phone: true, name: true }
      });

      for (const client of clients) {
        const cleanClientPhone = client.phone.replace(/\D/g, '');
        for (const phone of phoneList) {
          if (cleanClientPhone.endsWith(phone.slice(-10))) {
            conversationsMap[phone].clientName = client.name;
          }
        }
      }
    }

    const conversations = Object.values(conversationsMap).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /v1/whatsapp/conversations/:phone
 * Get full chat history for a given phone number.
 */
const getChatHistory = async (req, res, next) => {
  try {
    const cleanPhone = req.params.phone.replace(/\D/g, '');
    const searchPattern = cleanPhone.slice(-10);

    const messages = await prisma.whatsappMessage.findMany({
      where: {
        phone: { contains: searchPattern }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark inbound messages as READ
    await prisma.whatsappMessage.updateMany({
      where: {
        phone: { contains: searchPattern },
        direction: 'INBOUND'
      },
      data: { status: 'READ' }
    });

    res.json({ success: true, phone: cleanPhone, messages });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v1/whatsapp/conversations/:phone/send
 * Send an outbound reply message to a phone number.
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message, templateName, components } = req.body;
    const cleanPhone = req.params.phone.replace(/\D/g, '');

    if (!message && !templateName) {
      return res.status(400).json({ success: false, error: 'Message content or templateName is required.' });
    }

    let result;
    let messageContent = message;

    if (templateName) {
      result = await whatsappService.sendTemplateMessage(cleanPhone, templateName, components || []);
      messageContent = `[Template: ${templateName}]`;
    } else {
      result = await whatsappService.sendTextMessage(cleanPhone, message);
    }

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error || 'Failed to dispatch WhatsApp message.' });
    }

    // Save outbound message to DB
    const newMsg = await prisma.whatsappMessage.create({
      data: {
        phone: cleanPhone,
        direction: 'OUTBOUND',
        message: messageContent,
        status: 'SENT'
      }
    });

    res.json({ success: true, message: newMsg });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getChatHistory,
  sendMessage
};
