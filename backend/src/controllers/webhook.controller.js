// ============================================================
// TravelCRM — Webhook Controller (External Lead Sources)
// ============================================================
// Handles incoming leads from:
//   - Interakt (WhatsApp)
//   - Facebook Lead Ads
//   - Google Lead Form
// All webhooks create a Query (lead) with the appropriate leadSource.
// ============================================================

const queryService = require('../services/query.service');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

/**
 * Interakt WhatsApp Webhook
 * Payload shape (simplified):
 * {
 *   "data": {
 *     "customer": { "phone_number": "919876543210", "name": "John" },
 *     "message": { "text": "I want to book Goa trip" }
 *   }
 * }
 */
const createFromWhatsapp = async (req, res, next) => {
  try {
    const payload = req.body;
    
    // Extract fields from Interakt payload
    const customer = payload?.data?.customer || payload?.customer || {};
    const message = payload?.data?.message || payload?.message || {};
    
    const phone = customer.phone_number || customer.phone || '';
    const name = customer.name || customer.contact_name || 'WhatsApp Lead';
    const notes = message.text || message.body || '';

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Missing phone number in webhook payload' });
    }

    // Log the incoming integration event
    await prisma.integrationLog.create({
      data: {
        type: 'whatsapp',
        direction: 'inbound',
        status: 'success',
        payload: payload,
        relatedId: null,
      }
    });

    // Check for existing lead with this phone
    const existing = await prisma.query.findFirst({
      where: { phone, status: { notIn: ['lost', 'invalid'] }, deletedAt: null },
    });

    if (existing) {
      // Append as a note instead of creating duplicate
      const adminUserId = await getSystemUserId();
      const noteUserId = existing.assignedTo || adminUserId || null;

      // Only provide userId if we actually found one, since schema might require it 
      // or if it's optional, we can just pass what we have
      const noteData = {
        queryId: existing.id,
        note: `[WhatsApp] ${notes || 'New message received'}`,
      };
      
      if (noteUserId) {
        noteData.userId = noteUserId;
      }

      await prisma.queryNote.create({
        data: noteData
      });

      return res.json({ success: true, message: 'Existing lead updated with note', queryId: existing.id });
    }

    // Create new lead
    const query = await queryService.createQuery({
      name,
      phone,
      leadSource: 'whatsapp',
      destination: notes || null,
      clientInfo: {
        clientIp: req.ip || req.headers?.['x-forwarded-for'] || null,
        userAgent: req.headers?.['user-agent'] || null
      }
    });

    logger.info(`[Webhook] WhatsApp lead created: ${query.queryCode}`);
    res.status(201).json({ success: true, message: 'Lead created from WhatsApp', queryCode: query.queryCode });
  } catch (error) {
    // Log integration failure
    await prisma.integrationLog.create({
      data: {
        type: 'whatsapp',
        direction: 'inbound',
        status: 'failed',
        payload: req.body,
        errorMessage: error.message,
      }
    }).catch(() => {}); // Don't let logging failure mask the real error

    next(error);
  }
};

/**
 * Facebook Lead Ad Webhook
 * Payload shape (simplified from Facebook's Leadgen webhook):
 * {
 *   "entry": [{
 *     "changes": [{
 *       "value": {
 *         "leadgen_id": "...",
 *         "field_data": [
 *           { "name": "full_name", "values": ["John Doe"] },
 *           { "name": "phone_number", "values": ["+919876543210"] },
 *           { "name": "email", "values": ["john@example.com"] }
 *         ]
 *       }
 *     }]
 *   }]
 * }
 */
const createFromFacebook = async (req, res, next) => {
  try {
    const payload = req.body;

    // Facebook sends a verification challenge on subscription setup
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token']) {
      const expectedToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
      if (expectedToken && req.query['hub.verify_token'] !== expectedToken) {
        logger.warn('[Webhook] Facebook verification failed — invalid token');
        return res.status(403).json({ success: false, message: 'Invalid verify token' });
      }
      return res.send(req.query['hub.challenge']);
    }

    // Parse the lead data from Facebook's nested structure
    const entry = payload?.entry?.[0];
    const changes = entry?.changes?.[0];
    const fieldData = changes?.value?.field_data || [];
    const campaignName = changes?.value?.ad_name || changes?.value?.campaign_name || null;

    const getField = (name) => {
      const field = fieldData.find(f => f.name === name);
      return field?.values?.[0] || '';
    };

    const phone = getField('phone_number')?.replace(/[^0-9]/g, '') || '';
    const name = getField('full_name') || getField('first_name') || 'Facebook Lead';
    const email = getField('email') || null;

    if (!phone) {
      logger.warn('[Webhook] Facebook lead missing phone number');
      return res.status(400).json({ success: false, message: 'Missing phone number' });
    }

    // Log the incoming event
    await prisma.integrationLog.create({
      data: {
        type: 'facebook',
        direction: 'inbound',
        status: 'success',
        payload: payload,
        relatedId: null,
      }
    });

    // Duplicate check
    const existing = await prisma.query.findFirst({
      where: { phone, status: { notIn: ['lost', 'invalid'] }, deletedAt: null },
    });

    if (existing) {
      return res.json({ success: true, message: 'Duplicate lead — already exists', queryId: existing.id });
    }

    const query = await queryService.createQuery({
      name,
      phone,
      email,
      leadSource: 'facebook',
      campaignName,
      clientInfo: {
        clientIp: req.ip || req.headers?.['x-forwarded-for'] || null,
        userAgent: req.headers?.['user-agent'] || null
      }
    });

    logger.info(`[Webhook] Facebook lead created: ${query.queryCode}`);
    res.status(201).json({ success: true, message: 'Lead created from Facebook', queryCode: query.queryCode });
  } catch (error) {
    await prisma.integrationLog.create({
      data: {
        type: 'facebook',
        direction: 'inbound',
        status: 'failed',
        payload: req.body,
        errorMessage: error.message,
      }
    }).catch(() => {});

    next(error);
  }
};

/**
 * Google Lead Form Webhook
 * Payload shape (simplified):
 * {
 *   "lead_id": "...",
 *   "user_column_data": [
 *     { "column_id": "FULL_NAME", "string_value": "John Doe" },
 *     { "column_id": "PHONE_NUMBER", "string_value": "+919876543210" },
 *     { "column_id": "EMAIL", "string_value": "john@example.com" }
 *   ],
 *   "campaign_id": "...",
 *   "campaign_name": "Summer Campaign"
 * }
 */
const createFromGoogle = async (req, res, next) => {
  try {
    const payload = req.body;
    const columns = payload?.user_column_data || [];
    const campaignName = payload?.campaign_name || null;

    const getCol = (id) => {
      const col = columns.find(c => c.column_id === id);
      return col?.string_value || '';
    };

    const phone = getCol('PHONE_NUMBER')?.replace(/[^0-9]/g, '') || '';
    const name = getCol('FULL_NAME') || 'Google Lead';
    const email = getCol('EMAIL') || null;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Missing phone number' });
    }

    // Log the incoming event
    await prisma.integrationLog.create({
      data: {
        type: 'google',
        direction: 'inbound',
        status: 'success',
        payload: payload,
        relatedId: null,
      }
    });

    // Duplicate check
    const existing = await prisma.query.findFirst({
      where: { phone, status: { notIn: ['lost', 'invalid'] }, deletedAt: null },
    });

    if (existing) {
      return res.json({ success: true, message: 'Duplicate lead — already exists', queryId: existing.id });
    }

    const query = await queryService.createQuery({
      name,
      phone,
      email,
      leadSource: 'google',
      campaignName,
      clientInfo: {
        clientIp: req.ip || req.headers?.['x-forwarded-for'] || null,
        userAgent: req.headers?.['user-agent'] || null
      }
    });

    logger.info(`[Webhook] Google lead created: ${query.queryCode}`);
    res.status(201).json({ success: true, message: 'Lead created from Google', queryCode: query.queryCode });
  } catch (error) {
    await prisma.integrationLog.create({
      data: {
        type: 'google',
        direction: 'inbound',
        status: 'failed',
        payload: req.body,
        errorMessage: error.message,
      }
    }).catch(() => {});

    next(error);
  }
};

/**
 * Helper: get a system user ID for auto-generated notes
 */
const getSystemUserId = async () => {
  const admin = await prisma.user.findFirst({
    where: { role: { name: 'admin' }, isActive: true },
    select: { id: true },
  });
  return admin?.id || null;
};

/**
 * Meta Cloud API WhatsApp Webhook Handler (GET & POST)
 */
const handleMetaWhatsappWebhook = async (req, res, next) => {
  try {
    // 1. Meta Webhook Verification Challenge (GET)
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'imagica_whatsapp_verify_token_2026';

      if (mode === 'subscribe' && token === verifyToken) {
        logger.info('[Webhook] Meta WhatsApp subscription challenge verified!');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ success: false, message: 'Invalid verify token' });
      }
    }

    // 2. Incoming Messages & Status Updates (POST)
    const body = req.body;
    if (body?.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages && value.messages.length > 0) {
        const msg = value.messages[0];
        const contact = value.contacts?.[0];
        const senderPhone = msg.from; // e.g. "918235337180"
        const senderName = contact?.profile?.name || 'WhatsApp Contact';
        const msgText = msg.text?.body || msg.button?.text || '[Media/Interactive Message]';

        logger.info(`[Webhook] Incoming WhatsApp from ${senderName} (${senderPhone}): ${msgText}`);

        // Store message in database for Live Chat UI
        await prisma.whatsappMessage.create({
          data: {
            phone: senderPhone,
            direction: 'INBOUND',
            message: msgText,
            clientName: senderName,
            status: 'DELIVERED'
          }
        }).catch(e => logger.error('[Webhook] Failed to store whatsapp message:', e.message));
      }

      return res.status(200).send('EVENT_RECEIVED');
    }

    // Fallback if not whatsapp_business_account
    return res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    logger.error('[Webhook Error in Meta WhatsApp]', error);
    res.status(200).send('EVENT_RECEIVED'); // Always return 200 to Meta
  }
};

module.exports = {
  createFromWhatsapp,
  createFromFacebook,
  createFromGoogle,
  handleMetaWhatsappWebhook
};

