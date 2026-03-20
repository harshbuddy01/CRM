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
        queryId,
        provider: 'sendgrid',
        type: 'email_sent',
        status: 'success',
        requestPayload: { to, subject },
        responsePayload: { message: 'Email delivered safely.' }
      }
    });
  } catch (error) {
    console.error('[Email Worker Error]', error);
    await prisma.integrationLog.create({
      data: {
        queryId,
        provider: 'sendgrid',
        type: 'email_failed',
        status: 'error',
        requestPayload: { to, subject },
        responsePayload: { error: error.message }
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
        queryId,
        provider: 'interakt',
        type: 'whatsapp_sent',
        status: 'success',
        requestPayload: { phone, templateName, body: fakeMessageBody },
        responsePayload: { message: 'WhatsApp message queued and accepted by provider.' }
      }
    });
  } catch (error) {
    console.error('[WhatsApp Worker Error]', error);
    await prisma.integrationLog.create({
      data: {
        queryId,
        provider: 'interakt',
        type: 'whatsapp_failed',
        status: 'error',
        requestPayload: { phone, templateName },
        responsePayload: { error: error.message }
      }
    });
    throw error;
  }
}, { connection });

// Graceful Shutdown
process.on('SIGINT', async () => {
  await pdfWorker.close();
  await emailWorker.close();
  await whatsappWorker.close();
  process.exit(0);
});
