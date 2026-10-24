// ============================================================
// TravelCRM — BullMQ Worker
// ============================================================

require('dotenv').config();
const { Worker } = require('bullmq');
const cron = require('node-cron');
const runSnapshot = require('./scripts/backup-db');
const config = require('./config');

const prisma = require('./config/prisma');
const whatsappService = require('./services/whatsapp.service');

console.log('👷 BullMQ Worker service initialized.');
console.log(`📡 Connecting to Redis at ${config.redisUrl.replace(/:[^:]*@/, ':***@')}`);

const { URL: NodeURL } = require("url");
function parseRedisUrl(u) {
  try {
    const r = new NodeURL(u);
    return { host: r.hostname, port: parseInt(r.port,10)||6379, password: r.password||undefined, tls: r.protocol==="rediss:"?{}:undefined };
  } catch(e) { return { host: "127.0.0.1", port: 6379 }; }
}
const connection = parseRedisUrl(config.redisUrl);

// --- PDF Worker ---
const pdfWorker = new Worker('pdf-generation', async job => {
  const { proposalId, queryId } = job.data;
  console.log(`[PDF] Processing proposal ${proposalId}`);
  
  try {
    // In a real scenario, this would generate the PDF and upload to AWS/Cloudinary.
    // Since we fixed the dynamic memory issue via @sparticuz/chromium and stream directly
    // on the API route, this background job simply marks the PDF as 'ready' instantly.
    await prisma.proposal.update({
      where: { id: proposalId },
      data: { pdfStatus: 'ready' }
    });
  } catch (error) {
    console.error('[PDF Worker Error]', error);
    await prisma.proposal.update({
      where: { id: proposalId },
      data: { pdfStatus: 'failed' }
    });
    throw error;
  }
}, { connection });

// Helper to update campaign progress after each broadcast dispatch
async function updateCampaignProgress(campaignId) {
  if (!campaignId) return;
  try {
    const pendingOrQueued = await prisma.broadcastRecipient.count({
      where: { campaignId, status: { in: ['pending', 'queued'] } }
    });

    const sentCount = await prisma.broadcastRecipient.count({
      where: { campaignId, status: 'sent' }
    });

    const failedCount = await prisma.broadcastRecipient.count({
      where: { campaignId, status: { in: ['failed', 'skipped'] } }
    });

    const isFinished = pendingOrQueued === 0;

    let status = 'sending';
    if (isFinished) {
      status = sentCount > 0 ? 'completed' : 'failed';
    }

    await prisma.broadcastCampaign.update({
      where: { id: campaignId },
      data: {
        sentCount,
        failedCount,
        status,
        ...(isFinished ? { completedAt: new Date() } : {})
      }
    });
    console.log(`[Broadcast Progress] Campaign ${campaignId}: sent=${sentCount}, failed=${failedCount}, status=${status}`);
  } catch (err) {
    console.error('[updateCampaignProgress Error]', err.message);
  }
}

// --- Email Worker ---
let emailWorker = null;

const emailConfigured = (process.env.SMTP_USER && process.env.SMTP_PASS) || (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS);
if (emailConfigured) {
  emailWorker = new Worker('email-sending', async job => {
    const { queryId, to, subject, htmlContent, cc, from, recipientId, campaignId } = job.data;
    console.log(`[Email] Sending to ${to}${from ? ` (From: ${from})` : ''}`);
  
  try {
    // Nodemailer / Brevo Integration
    const { sendMail } = require('./config/mailer');
    const msg = { to, subject, html: htmlContent, from };
    if (cc) {
      // Split by comma if multiple CCs provided
      msg.cc = cc.split(',').map(e => e.trim()).filter(Boolean).join(',');
    }
    await sendMail(msg);
    
    if (queryId) {
      await prisma.integrationLog.create({
        data: {
          type: 'email',
          direction: 'outbound',
          status: 'success',
          payload: { provider: 'brevo_smtp', to, subject },
          relatedId: queryId,
        }
      });
    }

    if (recipientId) {
      await prisma.broadcastRecipient.update({
        where: { id: recipientId },
        data: { status: 'sent', sentAt: new Date() },
      }).catch(err => console.error('[Broadcast Update Error]', err.message));
    }

    if (campaignId) {
      await updateCampaignProgress(campaignId);
    }
  } catch (error) {
    console.error('[Email Worker Error]', error);
    if (queryId) {
      await prisma.integrationLog.create({
        data: {
          type: 'email',
          direction: 'outbound',
          status: 'failed',
          payload: { provider: 'brevo_smtp', to, subject },
          errorMessage: error.message,
          relatedId: queryId,
        }
      });
    }

    if (recipientId) {
      await prisma.broadcastRecipient.update({
        where: { id: recipientId },
        data: { status: 'failed', errorMessage: error.message },
      }).catch(err => console.error('[Broadcast Update Error]', err.message));
    }

    if (campaignId) {
      await updateCampaignProgress(campaignId);
    }

    throw error;
  }
}, { connection });
} else {
  console.warn('⚠️ SMTP credentials missing — Email Worker NOT started.');
}

// --- WhatsApp Worker ---
const whatsappWorker = new Worker('whatsapp-sending', async job => {
  const { queryId, phone, templateName, components, recipientId, campaignId } = job.data;
  console.log(`[WhatsApp] Processing job: template ${templateName} to ${phone}`);
  
  try {
    const result = await whatsappService.sendTemplateMessage(phone, templateName, components);
    
    if (!result.success) {
      throw new Error(result.error || 'Meta API returned success = false');
    }

    await prisma.integrationLog.create({
      data: {
        type: 'whatsapp',
        direction: 'outbound',
        status: 'success',
        payload: { provider: 'meta', phone, templateName, components, messageId: result.messageId, mock: result.mock },
        relatedId: queryId || null,
      }
    });

    if (recipientId) {
      await prisma.broadcastRecipient.update({
        where: { id: recipientId },
        data: { status: 'sent', sentAt: new Date() },
      }).catch(err => console.error('[Broadcast Update Error]', err.message));
    }

    if (campaignId) {
      await updateCampaignProgress(campaignId);
    }
  } catch (error) {
    console.error(`[WhatsApp Worker Error] template ${templateName} to ${phone}:`, error.message);
    await prisma.integrationLog.create({
      data: {
        type: 'whatsapp',
        direction: 'outbound',
        status: 'failed',
        payload: { provider: 'meta', phone, templateName, components },
        errorMessage: error.message,
        relatedId: queryId || null,
      }
    }).catch(() => {});

    if (recipientId) {
      await prisma.broadcastRecipient.update({
        where: { id: recipientId },
        data: { status: 'failed', errorMessage: error.message },
      }).catch(err => console.error('[Broadcast Update Error]', err.message));
    }

    if (campaignId) {
      await updateCampaignProgress(campaignId);
    }

    throw error;
  }
}, { connection });

// --- Backup Vault Cron (3 AM Daily) ---
cron.schedule('0 3 * * *', async () => {
  console.log('⏰ [Cron] Triggering Daily Safety Vault Snapshot...');
  try {
    await runSnapshot();
    console.log('✅ [Cron] Daily Snapshot successfully locked in Vault.');
  } catch (err) {
    console.error('❌ [CronError] Daily Snapshot failed:', err.message);
  }
});

// --- Itinerary GC Cron (4 AM Daily) ---
// Deletes client working copies from the Itinerary Builder if their
// linked tour has been 'completed' for more than 48 hours.
cron.schedule('0 4 * * *', async () => {
  console.log('⏰ [Cron] Triggering 48-hour GC for completed client working copies...');
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    // Find tours that are completed AND were updated more than 48 hr ago
    const completedTours = await prisma.tour.findMany({
      where: {
        status: 'completed',
        updatedAt: { lte: fortyEightHoursAgo },
        proposal: { itineraryId: { not: null } }
      },
      include: { proposal: { select: { itineraryId: true } } }
    });

    let gcCount = 0;
    for (const tour of completedTours) {
      if (!tour.proposal?.itineraryId) continue;
      
      const itineraryId = tour.proposal.itineraryId;
      const itinerary = await prisma.itinerary.findUnique({
        where: { id: itineraryId },
        select: { id: true, isTemplate: true, deletedAt: true }
      });

      if (itinerary && !itinerary.isTemplate && !itinerary.deletedAt) {
        await prisma.itinerary.update({
          where: { id: itinerary.id },
          data: { deletedAt: new Date() }
        });
        gcCount++;
      }
    }
    console.log(`✅ [Cron] 48-hour GC completed. Cleaned up ${gcCount} old client drafts.`);
  } catch (err) {
    console.error('❌ [CronError] 48-hour GC failed:', err.message);
  }
});

// Graceful Shutdown — handle both SIGINT (Ctrl+C) and SIGTERM (Railway/Docker)

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down workers gracefully...`);
  if (pdfWorker) await pdfWorker.close();
  if (emailWorker) await emailWorker.close();
  if (whatsappWorker) await whatsappWorker.close();
  console.log('✅ All workers closed. Exiting.');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
