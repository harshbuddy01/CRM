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

const ICONS = {
  destination: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  hotel: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M10 22v-5a2 2 0 0 1 4 0v5"/><path d="M2 22h20"/><path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18"/><path d="M9 7h1"/><path d="M9 11h1"/><path d="M14 7h1"/><path d="M14 11h1"/></svg>`,
  meals: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  transport: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
  activity: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
};

const generateProposalHtml = (proposal) => {
  return `
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 0; margin: 0; background-color: #f1f5f9; }
          .container { max-width: 800px; margin: 0 auto; background: white; min-height: 100vh; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); padding: 40px; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header h1 { color: #1e3a8a; margin: 0; font-size: 28px; font-weight: 700; }
          .header-meta { text-align: right; font-size: 14px; color: #64748b; }
          .price-tag { background: #eff6ff; color: #1e40af; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600; font-size: 18px; border: 1px solid #bfdbfe; }
          .day-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; overflow: hidden; }
          .day-header { background: #f8fafc; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
          .day-header h3 { margin: 0; font-size: 18px; color: #1e3a8a; font-weight: 600; }
          .day-body { padding: 20px; }
          .day-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
          .item { display: flex; align-items: flex-start; font-size: 14px; }
          .item-icon { margin-top: 2px; flex-shrink: 0; }
          .item-content { margin-left: 2px; }
          .item-label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 2px; }
          .description { background: #fdfdfd; border-top: 1px dashed #e2e8f0; padding: 16px 20px; font-size: 14px; color: #334155; line-height: 1.6; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>${proposal.query.name}</h1>
              <div style="margin-top: 4px; color: #64748b;">Exclusive Holiday Proposal</div>
            </div>
            <div class="header-meta">
              <div>Ref: ${proposal.query.queryCode}</div>
              <div>Version: ${proposal.version}</div>
            </div>
          </div>

          <div class="price-tag">
            Total Package Price: ₹${Number(proposal.sellingPrice).toLocaleString()}
          </div>

          <h2 style="font-size: 20px; margin: 30px 0 20px 0; color: #1e293b;">Itinerary Overview (${proposal.days.length} Days)</h2>

          ${proposal.days.map(d => `
            <div class="day-card">
              <div class="day-header">
                <h3>Day ${d.dayNumber}: ${d.destination?.name || 'Destination'}</h3>
              </div>
              <div class="day-body">
                <div class="day-grid">
                  <div class="item">
                    <div class="item-icon">${ICONS.hotel}</div>
                    <div class="item-content">
                      <div class="item-label">Accommodation</div>
                      <div>${d.hotel?.name || 'Self Arrangement'}</div>
                    </div>
                  </div>
                  <div class="item">
                    <div class="item-icon">${ICONS.meals}</div>
                    <div class="item-content">
                      <div class="item-label">Meals</div>
                      <div>${d.mealsIncluded || 'No Meals'}</div>
                    </div>
                  </div>
                  <div class="item">
                    <div class="item-icon">${ICONS.transport}</div>
                    <div class="item-content">
                      <div class="item-label">Transport</div>
                      <div>${d.transport || 'Internal Transfers'}</div>
                    </div>
                  </div>
                  <div class="item">
                    <div class="item-icon">${ICONS.activity}</div>
                    <div class="item-content">
                      <div class="item-label">Sightseeing</div>
                      <div>${d.activities || 'At Leisure'}</div>
                    </div>
                  </div>
                </div>
              </div>
              ${d.description ? `
                <div class="description">
                  <div class="item-label" style="margin-bottom: 8px;">Detailed Itinerary</div>
                  ${d.description.replace(/\n/g, '<br/>')}
                </div>
              ` : ''}
            </div>
          `).join('')}

          <div class="footer">
            Generated with TravelCRM • Thank you for choosing us!
          </div>
        </div>
      </body>
    </html>
  `;
};

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
    
    // Use the premium HTML generator
    const htmlContent = generateProposalHtml(proposal);

    const pdfBuffer = await pdfService.generatePdfFromHtml(htmlContent);
    const buffer = Buffer.from(pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename=Proposal-v${proposal.version}-${proposal.query.queryCode}.pdf`);
    
    // Log Activity (Non-blocking)
    prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'proposal.pdf_downloaded',
        entityType: 'query',
        entityId: proposal.queryId,
        newValue: { version: proposal.version }
      }
    }).catch(() => {});        newValue: { version: proposal.version }
      }
    }).catch(err => console.error('History Log Error:', err));

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

    // Use the premium HTML generator
    const proposalHtmlContent = generateProposalHtml(proposal);
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
