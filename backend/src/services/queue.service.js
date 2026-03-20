// ============================================================
// TravelCRM — Queue Service (BullMQ)
// ============================================================

const { Queue } = require('bullmq');
const config = require('../config');

const connection = {
  url: config.redisUrl,
};

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
const enqueueEmailJob = async (queryId, to, subject, htmlContent) => {
  await emailQueue.add('send-email', { queryId, to, subject, htmlContent }, {
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
