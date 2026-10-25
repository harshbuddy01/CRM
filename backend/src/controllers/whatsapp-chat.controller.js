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
      take: 300
    });

    // 2. Group by normalized clean phone number (E.164 with 91 default)
    const conversationsMap = {};
    for (const msg of recentMessages) {
      let cleanPhone = msg.phone.replace(/\D/g, '');
      if (cleanPhone.length === 10) {
        cleanPhone = `91${cleanPhone}`;
      }
      if (!conversationsMap[cleanPhone]) {
        conversationsMap[cleanPhone] = {
          phone: cleanPhone,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          direction: msg.direction,
          status: msg.status,
          clientName: msg.clientName || null,
          unreadCount: 0,
          lastInboundAt: null,
          isWindowOpen: false,
          windowExpiresAt: null,
          remainingMinutes: 0,
          queryCode: null,
          destination: null,
          queryStatus: null,
          queryId: null
        };
      }
      if (msg.direction === 'INBOUND' && !conversationsMap[cleanPhone].lastInboundAt) {
        conversationsMap[cleanPhone].lastInboundAt = msg.createdAt;
      }
      if (msg.direction === 'INBOUND' && msg.status === 'DELIVERED') {
        conversationsMap[cleanPhone].unreadCount += 1;
      }
    }

    // Calculate 24-hour window status for each conversation
    const now = Date.now();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    for (const phone in conversationsMap) {
      const conv = conversationsMap[phone];
      if (conv.lastInboundAt) {
        const inboundTime = new Date(conv.lastInboundAt).getTime();
        const diff = now - inboundTime;
        if (diff < twentyFourHoursMs) {
          conv.isWindowOpen = true;
          const expiresAt = new Date(inboundTime + twentyFourHoursMs);
          conv.windowExpiresAt = expiresAt.toISOString();
          conv.remainingMinutes = Math.max(0, Math.floor((expiresAt.getTime() - now) / 60000));
        }
      }
    }

    // 3. Match with Client & Query records for client names & query details
    const phoneList = Object.keys(conversationsMap);
    if (phoneList.length > 0) {
      const searchPatterns = phoneList.map(p => p.slice(-10));
      const [clients, queries] = await Promise.all([
        prisma.client.findMany({
          where: {
            OR: searchPatterns.map(sp => ({ phone: { contains: sp } }))
          },
          select: { phone: true, name: true }
        }),
        prisma.query.findMany({
          where: {
            OR: searchPatterns.map(sp => ({ phone: { contains: sp } })),
            deletedAt: null
          },
          select: { id: true, phone: true, name: true, queryCode: true, destination: true, status: true },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      const nameMap = {};
      const queryMap = {};
      for (const q of queries) {
        const last10 = q.phone.replace(/\D/g, '').slice(-10);
        if (last10 && !queryMap[last10]) {
          queryMap[last10] = q;
        }
        if (last10 && q.name) nameMap[last10] = q.name;
      }
      for (const c of clients) {
        const last10 = c.phone.replace(/\D/g, '').slice(-10);
        if (last10 && c.name && !nameMap[last10]) nameMap[last10] = c.name;
      }

      for (const phone of phoneList) {
        const last10 = phone.slice(-10);
        if (nameMap[last10] && !conversationsMap[phone].clientName) {
          conversationsMap[phone].clientName = nameMap[last10];
        }
        if (queryMap[last10]) {
          const q = queryMap[last10];
          conversationsMap[phone].queryId = q.id;
          conversationsMap[phone].queryCode = q.queryCode;
          conversationsMap[phone].destination = q.destination;
          conversationsMap[phone].queryStatus = q.status;
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
 * GET /v1/whatsapp-chat/leads
 * Returns recent active leads from Query table (new, quoted, negotiation, in_progress)
 * deduplicated by phone number, ready to start or continue a WhatsApp chat.
 * Also checks if the customer has replied with an inbound message.
 */
const getLeads = async (req, res, next) => {
  try {
    const { search, limit = 100 } = req.query;
    const where = {
      deletedAt: null,
      phone: { not: '' }
    };

    if (search) {
      const s = String(search).trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s } },
        { queryCode: { contains: s, mode: 'insensitive' } },
        { destination: { contains: s, mode: 'insensitive' } }
      ];
    }

    const queries = await prisma.query.findMany({
      where,
      select: {
        id: true,
        queryCode: true,
        name: true,
        phone: true,
        email: true,
        destination: true,
        status: true,
        budget: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    // Deduplicate by clean phone
    const seen = new Set();
    const leads = [];
    for (const q of queries) {
      const clean = q.phone?.replace(/\D/g, '') || '';
      if (!clean) continue;
      const key = clean.slice(-10);
      if (seen.has(key)) continue;
      seen.add(key);

      let fullPhone = clean;
      if (fullPhone.length === 10) fullPhone = `91${fullPhone}`;

      leads.push({
        id: q.id,
        queryCode: q.queryCode,
        name: q.name,
        phone: fullPhone,
        rawPhone: q.phone,
        email: q.email,
        destination: q.destination,
        status: q.status,
        budget: q.budget,
        createdAt: q.createdAt,
        hasReplied: false,
        lastReply: null,
        lastReplyAt: null,
        isWindowOpen: false,
        remainingMinutes: 0
      });
    }

    // Match with inbound WhatsApp messages to detect replies
    if (leads.length > 0) {
      const phoneKeys = Array.from(seen);
      const inboundMsgs = await prisma.whatsappMessage.findMany({
        where: {
          direction: 'INBOUND',
          OR: phoneKeys.map(k => ({ phone: { contains: k } }))
        },
        orderBy: { createdAt: 'desc' },
        take: 300
      });

      const replyMap = {};
      const now = Date.now();
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;

      for (const m of inboundMsgs) {
        const k = m.phone.replace(/\D/g, '').slice(-10);
        if (!replyMap[k]) {
          const inboundTime = new Date(m.createdAt).getTime();
          const diff = now - inboundTime;
          const isWindowOpen = diff < twentyFourHoursMs;
          const remainingMinutes = isWindowOpen ? Math.max(0, Math.floor((inboundTime + twentyFourHoursMs - now) / 60000)) : 0;

          replyMap[k] = {
            lastReply: m.message,
            lastReplyAt: m.createdAt,
            hasReplied: true,
            isWindowOpen,
            remainingMinutes
          };
        }
      }

      for (const lead of leads) {
        const k = lead.phone.slice(-10);
        if (replyMap[k]) {
          lead.hasReplied = true;
          lead.lastReply = replyMap[k].lastReply;
          lead.lastReplyAt = replyMap[k].lastReplyAt;
          lead.isWindowOpen = replyMap[k].isWindowOpen;
          lead.remainingMinutes = replyMap[k].remainingMinutes;
        }
      }
    }

    res.json({ success: true, leads });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v1/whatsapp-chat/bulk-send-template
 * Send an approved Meta template to multiple selected leads in one action.
 */
const bulkSendTemplate = async (req, res, next) => {
  try {
    const { recipients, templateName } = req.body;
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'Recipients array is required.' });
    }
    if (!templateName) {
      return res.status(400).json({ success: false, message: 'templateName is required.' });
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const r of recipients) {
      const cleanPhone = (r.phone || '').replace(/\D/g, '');
      if (!cleanPhone) continue;

      const recipientName = r.name || 'Valued Traveler';
      const components = buildTemplateComponents(templateName, recipientName, r);

      const result = await whatsappService.sendTemplateMessage(cleanPhone, templateName, components);
      if (result.success) {
        successCount++;
        await prisma.whatsappMessage.create({
          data: {
            phone: cleanPhone,
            direction: 'OUTBOUND',
            message: `[Template: ${templateName}] (Bulk sent to ${recipientName})`,
            status: 'SENT'
          }
        }).catch(() => {});
      } else {
        failCount++;
        errors.push({ phone: cleanPhone, error: result.error });
      }
    }

    res.json({
      success: true,
      data: {
        total: recipients.length,
        successCount,
        failCount,
        errors
      }
    });
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
 * Helper: Build exact Meta parameter structure for approved templates
 */
const buildTemplateComponents = (templateName, recipientName, query) => {
  const name = recipientName || 'Valued Traveler';
  const queryCode = query?.queryCode || 'QRY-2026';
  const destination = query?.destination || 'Bespoke Package';
  const budget = query?.budget ? `₹${Number(query.budget).toLocaleString('en-IN')}` : '₹45,000';

  if (templateName === 'diwali_festive_poster') {
    return [
      {
        type: 'header',
        parameters: [{ type: 'image', image: { link: 'https://media.imagicaholidays.com/campaigns/diwali-festive-poster-2026.jpg' } }]
      },
      {
        type: 'body',
        parameters: [{ type: 'text', text: name }]
      }
    ];
  }

  if (['festive_exclusive_offer', 'holiday_trip_inquiry', 'travel_connect_checkin'].includes(templateName)) {
    return [
      {
        type: 'body',
        parameters: [{ type: 'text', text: name }]
      }
    ];
  }

  if (templateName === 'proposal_ready') {
    return [
      {
        type: 'header',
        parameters: [{
          type: 'document',
          document: {
            link: 'https://media.imagicaholidays.com/campaigns/Imagica_Holidays_Luxury_Brochure.pdf',
            filename: `${queryCode}-Itinerary-Proposal.pdf`
          }
        }]
      },
      {
        type: 'body',
        parameters: [{ type: 'text', text: name }]
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [{ type: 'text', text: 'destinations' }]
      }
    ];
  }

  if (templateName === 'client_invoice_ready') {
    return [
      {
        type: 'header',
        parameters: [{
          type: 'document',
          document: {
            link: 'https://media.imagicaholidays.com/campaigns/Imagica_Holidays_Luxury_Brochure.pdf',
            filename: `${queryCode}-Invoice.pdf`
          }
        }]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: name },
          { type: 'text', text: queryCode },
          { type: 'text', text: budget }
        ]
      }
    ];
  }

  if (templateName === 'guest_voucher_ready') {
    return [
      {
        type: 'header',
        parameters: [{
          type: 'document',
          document: {
            link: 'https://media.imagicaholidays.com/campaigns/Imagica_Holidays_Luxury_Brochure.pdf',
            filename: `${queryCode}-Booking-Voucher.pdf`
          }
        }]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: name },
          { type: 'text', text: queryCode },
          { type: 'text', text: destination }
        ]
      }
    ];
  }

  return [{ type: 'body', parameters: [{ type: 'text', text: name }] }];
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
      // Find query or client details for accurate personalization
      const last10 = cleanPhone.slice(-10);
      const query = await prisma.query.findFirst({
        where: { phone: { contains: last10 }, deletedAt: null },
        orderBy: { createdAt: 'desc' }
      });
      const client = !query ? await prisma.client.findFirst({
        where: { phone: { contains: last10 } }
      }) : null;

      const recipientName = query?.name || client?.name || 'Valued Traveler';
      
      // If components is not complete for the template, build the exact schema
      const finalComponents = (components && components.length > 0 && !['client_invoice_ready', 'proposal_ready', 'guest_voucher_ready'].includes(templateName))
        ? components
        : buildTemplateComponents(templateName, recipientName, query);

      result = await whatsappService.sendTemplateMessage(cleanPhone, templateName, finalComponents);
      
      if (templateName === 'holiday_trip_inquiry') {
        messageContent = `[🌴 Holiday Trip Inquiry (Quick Reply) sent to ${recipientName}]`;
      } else if (templateName === 'travel_connect_checkin') {
        messageContent = `[✈️ Concierge Check-in (Quick Reply) sent to ${recipientName}]`;
      } else if (templateName === 'diwali_festive_poster') {
        messageContent = `[🪔 Diwali Festive Offer Poster sent to ${recipientName}]`;
      } else if (templateName === 'festive_exclusive_offer') {
        messageContent = `[✨ Festive Exclusive Offer sent to ${recipientName}]`;
      } else if (templateName === 'proposal_ready') {
        messageContent = `[📄 Itinerary Proposal sent to ${recipientName}]`;
      } else if (templateName === 'client_invoice_ready') {
        messageContent = `[🧾 Travel Invoice sent to ${recipientName}]`;
      } else if (templateName === 'guest_voucher_ready') {
        messageContent = `[🎟️ Travel Voucher sent to ${recipientName}]`;
      } else {
        messageContent = `[Template: ${templateName}]`;
      }
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
  getLeads,
  bulkSendTemplate,
  getChatHistory,
  sendMessage
};
