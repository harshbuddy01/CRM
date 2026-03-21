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
      await prisma.queryNote.create({
        data: {
          queryId: existing.id,
          userId: existing.assignedTo || (await getSystemUserId()),
          note: `[WhatsApp] ${notes || 'New message received'}`,
        }
      });

      return res.json({ success: true, message: 'Existing lead updated with note', queryId: existing.id });
    }

    // Create new lead
    const query = await queryService.createQuery({
      name,
      phone,
      leadSource: 'whatsapp',
      destination: notes || null,
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

module.exports = {
  createFromWhatsapp,
  createFromFacebook,
  createFromGoogle,
};
