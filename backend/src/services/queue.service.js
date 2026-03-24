// ============================================================
// TravelCRM — Queue Service (BullMQ)
// ============================================================

const { Queue } = require('bullmq');
const { URL } = require('url');
const config = require('../config');

// BullMQ v5 requires explicit host/port/password — not a url string.
// Parse the Redis URL from Railway into individual connection params.
function parseRedisUrl(redisUrl) {
  try {
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 6379,
      password: url.password || undefined,
      username: url.username || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
    };
  } catch (e) {
    // Fallback to localhost if parsing fails
    return { host: '127.0.0.1', port: 6379 };
  }
}

const connection = parseRedisUrl(config.redisUrl);

const pdfQueue = new Queue('pdf-generation', { connection });
const emailQueue = new Queue('email-sending', { connection });
const whatsappQueue = new Queue('whatsapp-sending', { connection });

/**
 * PDF Generation Queue
 */
const enqueuePdfJob = async (proposalId, queryId) => {
  await pdfQueue.add('generate-pdf', { proposalId, queryId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
};

/**
 * Email Sending Queue
 */
const enqueueEmailJob = async (queryId, to, subject, htmlContent, cc = null, from = null) => {
  await emailQueue.add('send-email', { queryId, to, subject, htmlContent, cc, from }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
};

/**
 * WhatsApp Notification Queue
 */
const enqueueWhatsappJob = async (queryId, phone, templateName, components) => {
  await whatsappQueue.add('send-whatsapp', { queryId, phone, templateName, components }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
  });
};

module.exports = {
  pdfQueue,
  emailQueue,
  whatsappQueue,
  enqueuePdfJob,
  enqueueEmailJob,
  enqueueWhatsappJob,
};
