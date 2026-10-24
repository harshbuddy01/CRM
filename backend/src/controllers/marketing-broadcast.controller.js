// ============================================================
// TravelCRM — Marketing Broadcast Controller
// ============================================================

const prisma = require('../config/prisma');
const { enqueueEmailJob, enqueueWhatsappJob } = require('../services/queue.service');
const r2Service = require('../services/r2.service');
const logger = require('../utils/logger');

/**
 * POST /broadcasts/upload
 * Upload campaign flyer, PDF, or image to storage
 */
const uploadCampaignAsset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const publicUrl = await r2Service.uploadAsset(req.file, 'campaigns');
    res.json({
      success: true,
      data: {
        url: publicUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /broadcasts/audience?segment=lost|completed
 * Returns deduplicated audience list with phone/email availability.
 */
const getAudience = async (req, res, next) => {
  try {
    const { segment = 'lost', search } = req.query;

    let statusFilter = {};
    if (segment === 'lost') {
      statusFilter = { status: { in: ['lost', 'invalid'] } };
    } else if (segment === 'completed') {
      statusFilter = { status: 'completed' };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid segment. Use "lost" or "completed".' });
    }

    const queries = await prisma.query.findMany({
      where: {
        ...statusFilter,
        deletedAt: null,
      },
      select: {
        id: true,
        queryCode: true,
        name: true,
        phone: true,
        email: true,
        destination: true,
        status: true,
        leadSource: true,
        travelDateFrom: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Deduplicate by phone number (keep the most recent query per unique phone)
    const seenPhones = new Map();
    const deduplicated = [];

    for (const q of queries) {
      const cleanPhone = q.phone?.replace(/\D/g, '') || '';
      if (cleanPhone && seenPhones.has(cleanPhone)) {
        continue; // Skip duplicate phone
      }
      if (cleanPhone) {
        seenPhones.set(cleanPhone, true);
      }
      deduplicated.push({
        queryId: q.id,
        queryCode: q.queryCode,
        name: q.name,
        phone: q.phone || null,
        email: q.email || null,
        destination: q.destination || null,
        status: q.status,
        leadSource: q.leadSource,
        travelDate: q.travelDateFrom,
        createdAt: q.createdAt,
        hasPhone: !!q.phone,
        hasEmail: !!q.email,
      });
    }

    // Optional search filter
    let results = deduplicated;
    if (search) {
      const s = search.toLowerCase();
      results = deduplicated.filter(r =>
        r.name?.toLowerCase().includes(s) ||
        r.phone?.includes(s) ||
        r.email?.toLowerCase().includes(s) ||
        r.destination?.toLowerCase().includes(s)
      );
    }

    res.json({
      success: true,
      data: results,
      meta: {
        total: results.length,
        withPhone: results.filter(r => r.hasPhone).length,
        withEmail: results.filter(r => r.hasEmail).length,
        segment,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /broadcasts/campaigns
 * Create a new broadcast campaign and enqueue all recipients.
 */
const createCampaign = async (req, res, next) => {
  try {
    const {
      name,
      segment,
      channel,           // 'whatsapp', 'email', 'both'
      templateName,      // Meta WhatsApp template name
      emailSubject,
      emailContent,
      attachmentUrl,
      attachmentName,
      recipients,        // Array of { queryId, name, phone, email, destination }
    } = req.body;

    // Validation
    if (!name || !segment || !channel || !recipients?.length) {
      return res.status(400).json({
        success: false,
        message: 'Campaign name, segment, channel, and at least 1 recipient are required.',
      });
    }

    if ((channel === 'whatsapp' || channel === 'both') && !templateName) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp template name is required when channel includes WhatsApp.',
      });
    }

    if ((channel === 'email' || channel === 'both') && (!emailSubject || !emailContent)) {
      return res.status(400).json({
        success: false,
        message: 'Email subject and content are required when channel includes Email.',
      });
    }

    // Build recipient records with channel assignment
    const recipientRecords = [];
    for (const r of recipients) {
      if (channel === 'both') {
        if (r.phone) {
          recipientRecords.push({ ...r, channel: 'whatsapp', status: 'pending' });
        }
        if (r.email) {
          recipientRecords.push({ ...r, channel: 'email', status: 'pending' });
        }
      } else if (channel === 'whatsapp') {
        if (r.phone) {
          recipientRecords.push({ ...r, channel: 'whatsapp', status: 'pending' });
        } else {
          recipientRecords.push({ ...r, channel: 'whatsapp', status: 'skipped', errorMessage: 'No phone number' });
        }
      } else if (channel === 'email') {
        if (r.email) {
          recipientRecords.push({ ...r, channel: 'email', status: 'pending' });
        } else {
          recipientRecords.push({ ...r, channel: 'email', status: 'skipped', errorMessage: 'No email address' });
        }
      }
    }

    const campaign = await prisma.broadcastCampaign.create({
      data: {
        name,
        segment,
        channel,
        templateName: templateName || null,
        emailSubject: emailSubject || null,
        emailContent: emailContent || null,
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
        totalRecipients: recipientRecords.length,
        status: 'draft',
        createdBy: req.user?.id || null,
        recipients: {
          create: recipientRecords.map(r => ({
            queryId: r.queryId || null,
            name: r.name,
            phone: r.phone || null,
            email: r.email || null,
            destination: r.destination || null,
            channel: r.channel,
            status: r.status || 'pending',
            errorMessage: r.errorMessage || null,
          })),
        },
      },
      include: {
        _count: { select: { recipients: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: `Campaign "${name}" created with ${recipientRecords.length} recipients.`,
      data: campaign,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /broadcasts/campaigns/:id/launch
 * Launch a draft campaign — enqueue all pending recipients for dispatch.
 */
const launchCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.broadcastCampaign.findUnique({
      where: { id },
      include: {
        recipients: {
          where: { status: 'pending' },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({ success: false, message: `Campaign is already "${campaign.status}". Only draft campaigns can be launched.` });
    }

    const pendingRecipients = campaign.recipients;

    if (pendingRecipients.length === 0) {
      return res.status(400).json({ success: false, message: 'No pending recipients to send to.' });
    }

    // Mark campaign as sending
    await prisma.broadcastCampaign.update({
      where: { id },
      data: { status: 'sending', launchedAt: new Date() },
    });

    // Enqueue each recipient for dispatch
    let queuedCount = 0;
    for (const recipient of pendingRecipients) {
      try {
        if (recipient.channel === 'whatsapp' && recipient.phone) {
          // Build WhatsApp template components
          const components = [];

          // Add document header if attachment exists
          if (campaign.attachmentUrl) {
            components.push({
              type: 'header',
              parameters: [{
                type: 'document',
                document: {
                  link: campaign.attachmentUrl,
                  filename: campaign.attachmentName || 'Offer.pdf',
                },
              }],
            });
          }

          // Add body parameters (customer name)
          components.push({
            type: 'body',
            parameters: [{ type: 'text', text: recipient.name || 'Valued Customer' }],
          });

          await enqueueWhatsappJob(
            recipient.queryId,
            recipient.phone,
            campaign.templateName,
            components
          );
        } else if (recipient.channel === 'email' && recipient.email) {
          // Build email with optional personalization
          let htmlContent = campaign.emailContent || '';
          htmlContent = htmlContent.replace(/\{\{name\}\}/gi, recipient.name || 'Valued Customer');
          htmlContent = htmlContent.replace(/\{\{destination\}\}/gi, recipient.destination || '');

          const fromHeader = `"Imagica Holidays" <${process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.BREVO_SMTP_USER}>`;

          await enqueueEmailJob(
            recipient.queryId,
            recipient.email,
            campaign.emailSubject,
            htmlContent,
            null,
            fromHeader
          );
        }

        // Mark recipient as queued
        await prisma.broadcastRecipient.update({
          where: { id: recipient.id },
          data: { status: 'queued' },
        });
        queuedCount++;
      } catch (queueErr) {
        logger.error(`[Broadcast] Failed to queue recipient ${recipient.id}: ${queueErr.message}`);
        await prisma.broadcastRecipient.update({
          where: { id: recipient.id },
          data: { status: 'failed', errorMessage: queueErr.message },
        });
      }
    }

    // Update campaign counts
    await prisma.broadcastCampaign.update({
      where: { id },
      data: {
        sentCount: queuedCount,
        failedCount: pendingRecipients.length - queuedCount,
        status: queuedCount > 0 ? 'sending' : 'failed',
        ...(queuedCount === 0 ? { completedAt: new Date() } : {}),
      },
    });

    res.json({
      success: true,
      message: `Broadcast launched! ${queuedCount} messages queued for delivery.`,
      data: { queued: queuedCount, failed: pendingRecipients.length - queuedCount },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /broadcasts/campaigns
 * List all campaigns with summary stats.
 */
const listCampaigns = async (req, res, next) => {
  try {
    const campaigns = await prisma.broadcastCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { recipients: true } },
      },
      take: 50,
    });

    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /broadcasts/campaigns/:id
 * Get campaign detail with all recipients and their statuses.
 */
const getCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.broadcastCampaign.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        recipients: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    res.json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /broadcasts/stats
 * Dashboard summary stats for broadcast module.
 */
const getStats = async (req, res, next) => {
  try {
    const [totalCampaigns, totalSent, totalFailed] = await Promise.all([
      prisma.broadcastCampaign.count(),
      prisma.broadcastRecipient.count({ where: { status: { in: ['sent', 'queued'] } } }),
      prisma.broadcastRecipient.count({ where: { status: 'failed' } }),
    ]);

    // This month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthCampaigns = await prisma.broadcastCampaign.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    res.json({
      success: true,
      data: {
        totalCampaigns,
        thisMonthCampaigns,
        totalSent,
        totalFailed,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAudience,
  createCampaign,
  launchCampaign,
  listCampaigns,
  getCampaign,
  getStats,
  uploadCampaignAsset,
};
