// ============================================================
// TravelCRM — Proposal Controller
// ============================================================

const proposalService = require('../services/proposal.service');
const pdfService = require('../services/pdf.service');
const queueService = require('../services/queue.service');
const prisma = require('../config/prisma');
const config = require('../config');

// Constants for input validation
const ALLOWED_EVENTS = ['viewed', 'whatsapp_opened', 'email_opened', 'downloaded'];
const MAX_EVENT_LENGTH = 50;

const createProposal = async (req, res, next) => {
  try {
    const queryId = req.params.id; // query id
    const userId = req.user.id;
    const { days, markupPct } = req.body;

    if (!days || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ success: false, message: 'Proposal must have at least one day' });
    }

    const proposal = await proposalService.createProposal(queryId, userId, { days, markupPct });
    res.status(201).json({ success: true, message: 'Proposal created', data: proposal });
  } catch (error) {
    next(error);
  }
};

const getProposalsByQuery = async (req, res, next) => {
  try {
    const proposals = await proposalService.getProposalsByQuery(req.params.id);
    res.json({ success: true, data: proposals });
  } catch (error) {
    next(error);
  }
};

const getProposalById = async (req, res, next) => {
  try {
    const canViewAll = req.user.permissions['query.view_all'];
    const proposal = await proposalService.getProposalById(req.params.id, req.user.id, canViewAll);
    res.json({ success: true, data: proposal });
  } catch (error) {
    next(error);
  }
};

// TODO: Consider moving PDF generation to BullMQ worker for better scalability.
//       This would change the flow to async: API returns a job ID, frontend polls for result.
//       For now, synchronous generation is kept for simpler UX (instant download).
const downloadPdf = async (req, res, next) => {
  try {
    const proposal = await proposalService.getProposalById(req.params.id);
    
    // Quick, clean proposal HTML template
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            h1 { color: #1e3a8a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8fafc; color: #475569; }
          </style>
        </head>
        <body>
          <h1>Proposal for ${proposal.query.name}</h1>
          <p><strong>Query ID:</strong> ${proposal.query.queryCode}</p>
          <p><strong>Selling Price:</strong> ₹${Number(proposal.sellingPrice).toLocaleString()}</p>
          <h2>Itinerary (${proposal.days.length} Days)</h2>
          <table>
            <tr>
              <th>Day</th>
              <th>Destination</th>
              <th>Hotel</th>
              <th>Meals</th>
              <th>Transport</th>
              <th>Activities</th>
            </tr>
            ${proposal.days.map(d => `
              <tr>
                <td>Day ${d.dayNumber}</td>
                <td>${d.destination?.name || '-'}</td>
                <td>${d.hotel?.name || '-'}</td>
                <td>${d.mealsIncluded || '-'}</td>
                <td>${d.transport || '-'}</td>
                <td>${d.activities || '-'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    const pdfBuffer = await pdfService.generatePdfFromHtml(htmlContent);
    const buffer = Buffer.from(pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename=Proposal-v${proposal.version}-${proposal.query.queryCode}.pdf`);
    res.end(buffer);
  } catch (error) {
    console.error('PDF Generation Controller Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.stack
    });
  }
};

const sendWhatsapp = async (req, res, next) => {
  try {
    const canViewAll = req.user.permissions['query.view_all'];
    const proposal = await proposalService.getProposalById(req.params.id, req.user.id, canViewAll);
    const now = new Date();
    
    // Idempotency Check
    if (proposal.lastSentAt && (now - proposal.lastSentAt) < 30000) {
      return res.status(429).json({ success: false, message: 'Please wait 30 seconds before sending again' });
    }

    // Update lastSentAt immediately
    await prisma.proposal.update({ where: { id: proposal.id }, data: { lastSentAt: now } });

    // Enqueue Job
    const phone = proposal.query.phone;

    if (config.whatsapp.mode === 'manual') {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const baseUrl = (config.apiUrl || `${protocol}://${req.get('host')}/api/v1`).replace(/\/$/, '');
      const pdfUrl = `${baseUrl}/proposals/${proposal.id}/pdf`;
      
      // Normalize phone: strip all non-digits, ensuring it starts with a country code
      // If no country code found (length 10), default to 91 (India)
      let normalizedPhone = '';
      if (phone && typeof phone === 'string') {
        normalizedPhone = phone.replace(/\D/g, '');
        if (normalizedPhone.length === 10) {
          normalizedPhone = `91${normalizedPhone}`;
        }
      }
      
      const msg = encodeURIComponent(`Hi ${proposal.query.name}, your proposal: ${pdfUrl}`);
      return res.json({ mode: 'manual', waLink: `https://wa.me/${normalizedPhone}?text=${msg}` });
    }

    const components = [{ type: 'body', parameters: [{ type: 'text', text: proposal.query.name }] }];
    await queueService.enqueueWhatsappJob(proposal.queryId, phone, 'proposal_ready', components);

    res.json({ success: true, message: 'WhatsApp notification queued securely.' });
  } catch (error) {
    next(error);
  }
};

const sendEmail = async (req, res, next) => {
  try {
    const { sendMail } = require('../config/mailer');
    const brevoConfigured = process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS;
    if (!brevoConfigured) {
      return res.status(500).json({ success: false, message: 'Brevo SMTP is not configured on the server.' });
    }

    const canViewAll = req.user.permissions['query.view_all'];
    const proposal = await proposalService.getProposalById(req.params.id, req.user.id, canViewAll);
    const now = new Date();
    
    // Idempotency Check
    if (proposal.lastSentAt && (now - proposal.lastSentAt) < 30000) {
      return res.status(429).json({ success: false, message: 'Please wait 30 seconds before sending again' });
    }

    const { to, cc, subject, body } = req.body;
    const finalTo = to || proposal.query.email;
    if (!finalTo) {
      return res.status(400).json({ success: false, message: 'No recipient email provided.' });
    }

    // Generate Proposal PDF Buffer
    const proposalHtmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            h1 { color: #1e3a8a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8fafc; color: #475569; }
          </style>
        </head>
        <body>
          <h1>Proposal for ${proposal.query.name}</h1>
          <p><strong>Query ID:</strong> ${proposal.query.queryCode}</p>
          <p><strong>Selling Price:</strong> ₹${Number(proposal.sellingPrice).toLocaleString()}</p>
          <h2>Itinerary (${proposal.days.length} Days)</h2>
          <table>
            <tr>
              <th>Day</th>
              <th>Destination</th>
              <th>Hotel</th>
              <th>Meals</th>
              <th>Transport</th>
              <th>Activities</th>
            </tr>
            ${proposal.days.map(d => `
              <tr>
                <td>Day ${d.dayNumber}</td>
                <td>${d.destination?.name || '-'}</td>
                <td>${d.hotel?.name || '-'}</td>
                <td>${d.mealsIncluded || '-'}</td>
                <td>${d.transport || '-'}</td>
                <td>${d.activities || '-'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
    const generatedPdfBuffer = await pdfService.generatePdfFromHtml(proposalHtmlContent);
    const pdfBuffer = Buffer.from(generatedPdfBuffer);

    // Prepare Attachments for Nodemailer
    const attachments = [
      {
        filename: `Proposal-v${proposal.version}-${proposal.query.queryCode}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ];

    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: req.file.mimetype
      });
    }

    const finalSubject = subject || 'Your Travel Proposal is Ready!';
    const htmlContent = body || `<p>Hi ${proposal.query.name}, your travel proposal is ready.</p>`;

    // Prepare Nodemailer Message
    const msg = {
      to: finalTo,
      subject: finalSubject,
      html: htmlContent,
      attachments
    };
    
    if (cc) {
      msg.cc = cc.split(',').map(e => e.trim()).filter(Boolean).join(',');
    }

    // Send Email Synchronously
    await sendMail(msg);

    // Update lastSentAt
    await prisma.proposal.update({ where: { id: proposal.id }, data: { lastSentAt: now } });
    
    // Log Activity
    await prisma.integrationLog.create({
      data: {
        type: 'email',
        direction: 'outbound',
        status: 'success',
        payload: { provider: 'brevo_smtp', to: finalTo, subject: finalSubject, withCustomAttachment: !!req.file },
        relatedId: proposal.queryId,
      }
    });

    res.json({ success: true, message: 'Email sent successfully with proposal attached.' });
  } catch (error) {
    if (error.response && error.response.body) {
      console.error('SendGrid Error:', error.response.body);
    }
    next(error);
  }
};

const logEvent = async (req, res, next) => {
  try {
    const { id, event } = req.params;

    // Validation: Check if event is whitelisted and within length constraints
    if (!ALLOWED_EVENTS.includes(event) || (event && event.length > MAX_EVENT_LENGTH)) {
      return res.status(400).json({ success: false, message: 'Invalid or unauthorized event type' });
    }

    const proposal = await proposalService.getProposalById(id);
    
    await prisma.integrationLog.create({
      data: {
        type: 'tracking',
        direction: 'inbound',
        status: 'success',
        payload: { event },
        relatedId: proposal.queryId,
      }
    });

    res.json({ success: true, message: `Event logged: ${event}` });
  } catch (error) {
    next(error);
  }
};

const listAllProposals = async (req, res, next) => {
  try {
    const proposals = await proposalService.listAllProposals();
    res.json({ success: true, data: proposals });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProposal,
  getProposalsByQuery,
  getProposalById,
  downloadPdf,
  sendWhatsapp,
  sendEmail,
  logEvent,
  listAllProposals,
};
