// ============================================================
// TravelCRM — Meta CAPI & Google Ads Conversion Routes
// ============================================================
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const queryService = require('../services/query.service');
const googleAdsService = require('../services/google-ads.service');
const metaCapiService = require('../services/meta-capi.service');
const config = require('../config');
const logger = require('../utils/logger');
const { authenticate } = require('../middlewares/authenticate');

// Webhook API Key guard
const webhookApiKeyGuard = (req, res, next) => {
  const apiKey = config.webhookApiKey;
  if (!apiKey) {
    if (config.nodeEnv === 'production') {
      return res.status(500).json({ success: false, message: 'Webhook is not configured' });
    }
    return next();
  }
  
  const providedKey = req.headers['x-api-key'];
  if (!providedKey || providedKey !== apiKey) {
    return res.status(401).json({ success: false, message: 'Invalid or missing API key' });
  }
  next();
};

/**
 * Public Endpoint for AI Agent Booking
 * Body parameters:
 *   - name (string)
 *   - phone (string)
 *   - email (string, optional)
 *   - destination (string, optional)
 *   - budget (number, optional)
 *   - adults (number, optional)
 *   - children (number, optional)
 *   - travelDateFrom (string, optional)
 *   - travelDateTo (string, optional)
 *   - fbp (string, optional)
 *   - fbc (string, optional)
 *   - gclid (string, optional)
 *   - gbraid (string, optional)
 *   - wbraid (string, optional)
 */
router.post('/public/meta-capi/ai-booking', webhookApiKeyGuard, async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      destination,
      budget,
      adults = 1,
      children = 0,
      travelDateFrom,
      travelDateTo,
      fbp,
      fbc,
      gclid,
      gbraid,
      wbraid
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone are required' });
    }

    // Build client info
    const clientInfo = {
      gclid: gclid || req.query.gclid || null,
      gbraid: gbraid || req.query.gbraid || null,
      wbraid: wbraid || req.query.wbraid || null,
      fbp: fbp || req.cookies?.['_fbp'] || null,
      fbc: fbc || req.cookies?.['_fbc'] || req.query.fbclid || null,
      clientIp: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
      userAgent: req.headers['user-agent'] || null,
    };

    // Check for duplicate active lead by phone
    const existingQuery = await prisma.query.findFirst({
      where: { phone, status: { notIn: ['lost', 'invalid'] }, deletedAt: null },
    });

    if (existingQuery) {
      // 1. If duplicate exists, transition its status to 'negotiation'
      logger.info(`[AIBooking] Duplicate lead found for phone ${phone}. Updating status of ${existingQuery.queryCode} to negotiation.`);
      
      const updated = await queryService.changeQueryStatus(
        existingQuery.id,
        'negotiation',
        null, // bypass assignedTo checks for system automated updates
        true, // canViewAll
        true  // canEditAll
      );

      // Save tracking details
      await prisma.integrationLog.create({
        data: {
          type: 'lead_tracking',
          direction: 'inbound',
          status: 'success',
          payload: clientInfo,
          relatedId: updated.id,
        }
      }).catch(() => {});

      // Fire Schedule/QualifiedLead event explicitly to ensure deduplication event_id matches
      await metaCapiService.sendEvent('Schedule', updated, clientInfo).catch(() => {});
      await googleAdsService.uploadConversion('QualifiedLead', updated, clientInfo).catch(() => {});

      return res.status(200).json({
        success: true,
        message: 'Existing lead found and moved to negotiation/schedule status',
        queryId: updated.id,
        queryCode: updated.queryCode,
        isNew: false
      });
    }

    // 2. Create a new query if no duplicate exists
    logger.info(`[AIBooking] Creating new lead for phone ${phone}.`);
    const newQuery = await queryService.createQuery({
      name,
      phone,
      email,
      destination,
      budget,
      adults: parseInt(adults, 10),
      children: parseInt(children, 10),
      travelDateFrom,
      travelDateTo,
      leadSource: 'website',
      clientInfo
    });

    // Fire events (createQuery already fires Lead event, let's also fire Schedule event because booking a call counts as Schedule!)
    await metaCapiService.sendEvent('Schedule', newQuery, clientInfo).catch(() => {});
    await googleAdsService.uploadConversion('QualifiedLead', newQuery, clientInfo).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'New lead and call booking created successfully',
      queryId: newQuery.id,
      queryCode: newQuery.queryCode,
      isNew: true
    });

  } catch (error) {
    logger.error('[AIBooking] Webhook error:', error.message);
    next(error);
  }
});

/**
 * Admin Test Endpoint to manually trigger Conversion Uploads
 */
router.post('/meta-capi/test-event', authenticate, async (req, res, next) => {
  try {
    const { queryId, eventName, clientInfo = {} } = req.body;
    if (!queryId || !eventName) {
      return res.status(400).json({ success: false, message: 'queryId and eventName are required' });
    }

    const query = await prisma.query.findUnique({ where: { id: queryId } });
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    let metaResult = null;
    let googleAdsResult = null;

    if (eventName === 'Lead') {
      metaResult = await metaCapiService.sendEvent('Lead', query, clientInfo);
      googleAdsResult = await googleAdsService.uploadConversion('Lead', query, clientInfo);
    } else if (eventName === 'Schedule' || eventName === 'QualifiedLead') {
      metaResult = await metaCapiService.sendEvent('Schedule', query, clientInfo);
      googleAdsResult = await googleAdsService.uploadConversion('QualifiedLead', query, clientInfo);
    } else if (eventName === 'Purchase' || eventName === 'ConvertedLead') {
      metaResult = await metaCapiService.sendEvent('Purchase', query, clientInfo);
      googleAdsResult = await googleAdsService.uploadConversion('ConvertedLead', query, clientInfo);
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported event name' });
    }

    return res.json({
      success: true,
      message: 'Test conversion upload executed',
      metaResult,
      googleAdsResult
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
