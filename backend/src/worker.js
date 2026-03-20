// ============================================================
// TravelCRM — BullMQ Worker
// ============================================================

require('dotenv').config();
const { Worker } = require('bullmq');
const config = require('./config');
const prisma = require('./config/prisma');

console.log('👷 BullMQ Worker service initialized.');
console.log(`📡 Connecting to Redis at ${config.redisUrl.replace(/:[^:]*@/, ':***@')}`);

const connection = { url: config.redisUrl };

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

// --- Email Worker ---
const emailWorker = new Worker('email-sending', async job => {
  const { queryId, to, subject, htmlContent } = job.data;
  console.log(`[Email] Sending to ${to}`);
  
  try {
    // Mock SendGrid Integration
    // sgMail.send({ to, from: config.emailFrom, subject, html: htmlContent });
    
    await prisma.integrationLog.create({
      data: {
        type: 'email',
        direction: 'outbound',
        status: 'success',
        payload: { provider: 'sendgrid', to, subject },
        relatedId: queryId,
      }
    });
  } catch (error) {
    console.error('[Email Worker Error]', error);
    await prisma.integrationLog.create({
      data: {
        type: 'email',
        direction: 'outbound',
        status: 'failed',
        payload: { provider: 'sendgrid', to, subject },
        errorMessage: error.message,
        relatedId: queryId,
      }
    });
    throw error;
  }
}, { connection });

// --- WhatsApp Worker ---
const whatsappWorker = new Worker('whatsapp-sending', async job => {
  const { queryId, phone, templateName, components } = job.data;
  console.log(`[WhatsApp] Sending template ${templateName} to ${phone}`);
  
  try {
    const companyName = process.env.COMPANY_NAME || 'TravelCRM';
    const fakeMessageBody = `
${companyName}
Hi ${components[0]?.parameters[0]?.text || 'Traveler'},
Please find your proposal attached.
    `.trim();

    // Mock Interakt Integration Request 
    
    await prisma.integrationLog.create({
      data: {
        type: 'whatsapp',
        direction: 'outbound',
        status: 'success',
        payload: { provider: 'interakt', phone, templateName, body: fakeMessageBody },
        relatedId: queryId,
      }
    });
  } catch (error) {
    console.error('[WhatsApp Worker Error]', error);
    await prisma.integrationLog.create({
      data: {
        type: 'whatsapp',
        direction: 'outbound',
        status: 'failed',
        payload: { provider: 'interakt', phone, templateName },
        errorMessage: error.message,
        relatedId: queryId,
      }
    });
    throw error;
  }
}, { connection });

// Graceful Shutdown — handle both SIGINT (Ctrl+C) and SIGTERM (Railway/Docker)
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down workers gracefully...`);
  await pdfWorker.close();
  await emailWorker.close();
  await whatsappWorker.close();
  console.log('✅ All workers closed. Exiting.');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
