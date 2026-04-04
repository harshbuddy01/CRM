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
  const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  
  const getSafeImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('//')) return `https:${url}`;
    return url;
  };

  const itinerary = proposal.itinerary;
  const days = itinerary?.days || proposal.days || [];
  const totalDays = days.length;
  const destinations = [...new Set(days.map(d => d.destination?.name).filter(Boolean))].join(', ') || proposal.query?.destination || 'Your Journey';

  const EVENT_ICONS = {
    accommodation: '🏨', sightseeing: '🗻', activity: '🧭', transport: '🚗',
    flight: '✈️', meal: '🍴', checkin: '🔑', checkout: '👋', freeTime: '☀️',
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Travel Proposal - ${escapeHtml(proposal.query?.name || 'Customer')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet" />
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; color: #334155; background: #f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { width: 100%; max-width: 900px; margin: 0 auto; background: #ffffff; overflow: hidden; }
          h1, h2, h3 { font-family: 'Playfair Display', serif; color: #0f172a; margin: 0; }
          .hero { position: relative; height: 500px; width: 100%; background: #1e293b; overflow: hidden; }
          .hero img { width: 100%; height: 100%; object-fit: cover; opacity: 0.85; mix-blend-mode: multiply; }
          .hero-overlay { position: absolute; bottom: 0; left: 0; width: 100%; padding: 60px 40px; background: linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.95) 100%); color: white; }
          .hero-badge { display: inline-block; padding: 6px 14px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; border: 1px solid rgba(255, 255, 255, 0.3); }
          .hero h1 { color: #ffffff; font-size: 48px; font-weight: 800; line-height: 1.1; margin-bottom: 16px; text-shadow: 0 4px 12px rgba(0,0,0,0.3); }
          .hero-meta { display: flex; gap: 20px; font-size: 14px; font-weight: 500; opacity: 0.9; }
          .info-bar { display: flex; justify-content: space-between; padding: 25px 40px; background: #ffffff; border-bottom: 1px solid #e2e8f0; }
          .info-item { display: flex; flex-direction: column; gap: 4px; }
          .info-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
          .info-value { font-size: 14px; font-weight: 700; color: #0f172a; }
          .section-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; text-align: center; margin: 40px 0 10px; color: #0f172a; }
          .section-line { width: 60px; height: 3px; background: #3b82f6; margin: 0 auto 40px; border-radius: 2px; }
          .day-card { margin: 0 30px 30px; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; break-inside: avoid; }
          .day-header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
          .day-header h3 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin: 0; }
          .day-dest { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; }
          .day-body { padding: 20px 24px; }
          .day-desc { color: #475569; font-size: 14px; line-height: 1.7; margin-bottom: 16px; }
          .event-row { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px dashed #f1f5f9; }
          .event-row:last-child { border-bottom: none; }
          .event-icon { width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
          .event-details { flex: 1; }
          .event-title { font-size: 14px; font-weight: 700; color: #1e293b; }
          .event-sub { font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 2px; }
          .event-desc { font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.5; }
          .event-img { width: 100%; max-height: 250px; object-fit: cover; border-radius: 12px; margin-bottom: 16px; }
          .price-section { margin: 30px; padding: 30px; background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%); border-radius: 16px; border: 1px solid #bfdbfe; text-align: center; }
          .price-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3b82f6; margin-bottom: 4px; }
          .price-amount { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; color: #1e40af; }
          .policy-section { margin: 0 30px 30px; }
          .policy-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; }
          .policy-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b; margin-bottom: 10px; }
          .policy-content { font-size: 13px; color: #475569; line-height: 1.7; }
          .policy-content ul { padding-left: 18px; }
          .policy-content li { margin-bottom: 4px; }
          .footer { text-align: center; padding: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="hero">
            ${itinerary?.coverPhotoUrl ? `<img src="${getSafeImageUrl(itinerary.coverPhotoUrl)}" alt="Cover" />` : ''}
            <div class="hero-overlay">
              <div class="hero-badge">${escapeHtml(destinations)}</div>
              <h1>${escapeHtml(itinerary?.title || proposal.query?.name || 'Proposal')}</h1>
              <div class="hero-meta">
                <span>${totalDays} Days</span>
                <span>•</span>
                <span>Ref: ${escapeHtml(proposal.query?.queryCode || 'QRY')}</span>
                <span>•</span>
                <span>Version ${proposal.version}</span>
              </div>
            </div>
          </div>

          <div class="info-bar">
            <div class="info-item">
              <div class="info-label">Customer</div>
              <div class="info-value">${escapeHtml(proposal.query?.name || 'Customer')}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Travelers</div>
              <div class="info-value">${proposal.query?.adults || 0} Adults${proposal.query?.children ? `, ${proposal.query.children} Children` : ''}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Travel Dates</div>
              <div class="info-value">${proposal.query?.travelDateFrom ? new Date(proposal.query.travelDateFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Destinations</div>
              <div class="info-value">${escapeHtml(destinations)}</div>
            </div>
          </div>

          <div class="section-title">Your Journey</div>
          <div class="section-line"></div>

          ${days.map(day => {
            const events = day.events || [];
            const dayImage = day.imageUrl || events.find(e => e.imageUrl)?.imageUrl;
            
            return `
            <div class="day-card">
              <div class="day-header">
                <h3>Day ${day.dayNumber}: ${escapeHtml(day.title || 'Exploration Day')}</h3>
                <div class="day-dest">${escapeHtml(day.destination?.name || '')}</div>
              </div>
              <div class="day-body">
                ${dayImage ? `<img class="event-img" src="${getSafeImageUrl(dayImage)}" alt="Day ${day.dayNumber}" />` : ''}
                ${day.description ? `<div class="day-desc">${escapeHtml(day.description).replace(/\n/g, '<br/>')}</div>` : ''}
                
                ${events.length > 0 ? events.map(ev => `
                  <div class="event-row">
                    <div class="event-icon">${EVENT_ICONS[ev.type] || '📍'}</div>
                    <div class="event-details">
                      <div class="event-title">${escapeHtml(ev.title)}</div>
                      ${ev.startTime ? `<div class="event-sub">⏰ ${escapeHtml(ev.startTime)}${ev.endTime ? ' - ' + escapeHtml(ev.endTime) : ''}</div>` : ''}
                      ${ev.type === 'accommodation' && ev.metadata?.hotelName ? `<div class="event-sub">🏨 ${escapeHtml(ev.metadata.hotelName)} ${ev.metadata?.roomType ? '• ' + escapeHtml(ev.metadata.roomType) : ''}</div>` : ''}
                      ${ev.description ? `<div class="event-desc">${escapeHtml(ev.description).replace(/\n/g, '<br/>')}</div>` : ''}
                    </div>
                  </div>
                `).join('') : '<div class="day-desc">A day reserved for unique experiences and discovery.</div>'}
              </div>
            </div>
            `;
          }).join('')}

          <div class="price-section">
            <div class="price-label">Total Package Price</div>
            <div class="price-amount">₹${Number(proposal.sellingPrice || itinerary?.sellingPrice || itinerary?.totalCost || 0).toLocaleString('en-IN')}</div>
            ${itinerary?.perPersonCost ? `<div style="font-size: 14px; color: #64748b; margin-top: 8px; font-weight: 500;">₹${Number(itinerary.perPersonCost).toLocaleString('en-IN')} per person</div>` : ''}
          </div>

          ${(itinerary?.inclusionsHtml || itinerary?.exclusionsHtml || itinerary?.paymentPolicyHtml || itinerary?.cancellationPolicyHtml || itinerary?.termsHtml) ? `
          <div class="section-title">Terms & Conditions</div>
          <div class="section-line"></div>
          <div class="policy-section">
            ${itinerary?.inclusionsHtml ? `<div class="policy-box"><div class="policy-title">✅ Inclusions</div><div class="policy-content">${itinerary.inclusionsHtml}</div></div>` : ''}
            ${itinerary?.exclusionsHtml ? `<div class="policy-box"><div class="policy-title">❌ Exclusions</div><div class="policy-content">${itinerary.exclusionsHtml}</div></div>` : ''}
            ${itinerary?.paymentPolicyHtml ? `<div class="policy-box"><div class="policy-title">💳 Payment Policy</div><div class="policy-content">${itinerary.paymentPolicyHtml}</div></div>` : ''}
            ${itinerary?.cancellationPolicyHtml ? `<div class="policy-box"><div class="policy-title">🔄 Cancellation Policy</div><div class="policy-content">${itinerary.cancellationPolicyHtml}</div></div>` : ''}
            ${itinerary?.termsHtml ? `<div class="policy-box"><div class="policy-title">📋 Terms</div><div class="policy-content">${itinerary.termsHtml}</div></div>` : ''}
          </div>
          ` : ''}

          <div class="footer">IMAGICA HOLIDAYS • CRAFTED WITH CARE</div>
        </div>
      </body>
    </html>
  `;
};

const createProposal = async (req, res, next) => {
  try {
    const queryId = req.params.id; // query id
    const userId = req.user.id;
    const { days, markupPct, itineraryId } = req.body;

    // If itineraryId is provided, we might want to link it, 
    // but the new "Insert" flow will use a dedicated endpoint.
    // Keeping this for backward compatibility or simple linking.
    const proposal = await proposalService.createProposal(queryId, userId, { days, markupPct, itineraryId });
    res.status(201).json({ success: true, message: 'Proposal created', data: proposal });
  } catch (error) {
    next(error);
  }
};

const insertFromItinerary = async (req, res, next) => {
  try {
    const queryId = req.params.id;
    const { itineraryId } = req.body;
    const userId = req.user.id;

    if (!itineraryId) {
      return res.status(400).json({ success: false, message: 'itineraryId is required' });
    }

    const proposal = await proposalService.createProposalFromItinerary(queryId, userId, itineraryId);
    res.status(201).json({ success: true, message: 'Proposal created from itinerary', data: proposal });
  } catch (err) {
    next(err);
  }
};

const createWithNewItinerary = async (req, res, next) => {
  try {
    const queryId = req.params.id;
    const { title } = req.body;
    const userId = req.user.id;

    const proposal = await proposalService.createProposalWithNewItinerary(queryId, userId, title);
    res.status(201).json({ success: true, message: 'Proposal created with new itinerary', data: proposal });
  } catch (err) {
    next(err);
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

const confirmProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const canViewAll = req.user.permissions['query.view_all'];
    
    // 1. Get proposal with query details for tour data
    const proposal = await proposalService.getProposalById(id, req.user.id, canViewAll);

    // Validate status
    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only a 'pending' proposal can be confirmed. Current status is '${proposal.status}'.`
      });
    }

    // Validate travel dates — auto-fix travelDateTo if only travelDateFrom is set
    if (!proposal.query.travelDateFrom) {
      return res.status(400).json({
        success: false,
        message: 'Cannot confirm proposal: The associated lead (query) must have a valid travel start date. Please edit the lead and set the Travel Date From.'
      });
    }

    // Auto-calculate travelDateTo if missing
    let travelDateTo = proposal.query.travelDateTo;
    if (!travelDateTo) {
      // Try to determine trip length from the linked itinerary
      const daysCount = proposal.itinerary?.days?.length || 7; // Default 7 days
      const from = new Date(proposal.query.travelDateFrom);
      travelDateTo = new Date(from);
      travelDateTo.setDate(travelDateTo.getDate() + daysCount - 1);
      // Persist the auto-calculated date on the query
      await prisma.query.update({
        where: { id: proposal.queryId },
        data: { travelDateTo }
      });
    }

    // 2. Perform transaction to ensure atomic consistency
    const result = await prisma.$transaction(async (tx) => {
      // A. Mark this proposal as confirmed
      const confirmedProposal = await tx.proposal.update({
        where: { id },
        data: { status: 'confirmed' }
      });

      // B. Mark all other proposals for this same query as rejected
      await tx.proposal.updateMany({
        where: { 
          queryId: proposal.queryId,
          id: { not: id },
          status: 'pending' // Only reject pending ones to avoid overwriting existing rejections
        },
        data: { status: 'rejected' }
      });

      // C. Move the query to confirmed status
      const updatedQuery = await tx.query.update({
        where: { id: proposal.queryId },
        data: { status: 'confirmed' }
      });

      // D. Create or link a Tour record (Ops Phase starts)
      // Robust tour code generation with collision retry
      const crypto = require('crypto');
      let tourCode;
      let tourCodeFound = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const baseCode = (proposal.query.queryCode && proposal.query.queryCode.trim() !== '')
          ? proposal.query.queryCode.split('-').pop()
          : crypto.randomUUID().substring(0, 8).toUpperCase();
        const suffix = attempt > 0 ? `-${crypto.randomUUID().substring(0, 4).toUpperCase()}` : '';
        tourCode = `TUR-${new Date().getFullYear()}-${baseCode}${suffix}`;
        const exists = await tx.tour.findUnique({ where: { tourCode } });
        if (!exists) {
          tourCodeFound = true;
          break;
        }
      }

      if (!tourCodeFound) {
        throw new Error('Failed to generate a unique tourCode after 3 attempts. Please try again.');
      }
      
      // Check if tour already exists for this query
      const existingTour = await tx.tour.findFirst({
        where: { queryId: proposal.queryId }
      });

      const startDate = updatedQuery.travelDateFrom;
      const endDate = updatedQuery.travelDateTo;
      const totalPax = (updatedQuery.adults || 0) + (updatedQuery.children || 0);

      let tour;
      if (existingTour) {
        tour = await tx.tour.update({
          where: { id: existingTour.id },
          data: {
            proposalId: id,
            status: 'upcoming',
            startDate,
            endDate,
            totalPax,
          }
        });
      } else {
        tour = await tx.tour.create({
          data: {
            queryId: proposal.queryId,
            proposalId: id,
            tourCode: tourCode,
            status: 'upcoming',
            startDate,
            endDate,
            totalPax,
          }
        });
      }

      // E. Automate Operations Fulfillment — Create BookingServices from Itinerary
      // Fetch full itinerary with days and events
      if (proposal.itineraryId) {
        const fullItinerary = await tx.itinerary.findUnique({
          where: { id: proposal.itineraryId },
          include: {
            days: {
              orderBy: { dayNumber: 'asc' },
              include: { events: { orderBy: { sortOrder: 'asc' } } }
            }
          }
        });

        if (fullItinerary && fullItinerary.days) {
          const adults = updatedQuery.adults || 0;
          const children = updatedQuery.children || 0;
          const totalPaxCount = adults + children;

          for (const day of fullItinerary.days) {
            // Calculate actual date for this day
            const serviceDate = new Date(startDate);
            serviceDate.setDate(serviceDate.getDate() + (day.dayNumber - 1));

            for (const event of (day.events || [])) {
              let serviceType = null;
              if (event.type === 'accommodation') serviceType = 'hotel';
              else if (['transport', 'activity', 'sightseeing'].includes(event.type)) serviceType = 'transport';

              if (serviceType) {
                // Determine check-in/out for hotels
                let checkIn = null;
                let checkOut = null;
                if (serviceType === 'hotel') {
                  checkIn = serviceDate;
                  checkOut = new Date(serviceDate);
                  checkOut.setDate(checkOut.getDate() + 1); 
                  // Note: In real scenarios, check-out might be multiple days later if it's a multi-night stay event
                  // But itineraries usually list events per day.
                }

                await tx.bookingService.create({
                  data: {
                    queryId: proposal.queryId,
                    proposalDayId: null, // Could link to a ProposalDay if they existed
                    serviceType,
                    serviceName: event.title || 'Untitled Service',
                    serviceDate: serviceType === 'transport' ? serviceDate : null,
                    checkIn,
                    checkOut,
                    totalCost: event.cost ? Number(event.cost) : 0,
                    units: totalPaxCount || 1,
                    createdBy: req.user.id,
                    notes: event.description || null,
                    mailStatus: 'not_sent',
                    paymentStatus: 'pending',
                  }
                });
              }
            }
          }
        }
      }

      // F. Log Activity for audit trail
      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'proposal.confirmed',
          entityType: 'query',
          entityId: proposal.queryId,
          newValue: { version: proposal.version, tourId: tour.id, tourCode: tour.tourCode }
        }
      });

      return { confirmedProposal, tour };
    });

    res.json({ 
      success: true, 
      message: 'Proposal confirmed! Query and Tour successfully transitioned to Operations.', 
      data: result 
    });
  } catch (error) {
    console.error('Confirm Proposal Error:', error);
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

const deleteProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;
    const canViewAll = role === 'admin' || role === 'system_owner';

    await proposalService.removeProposal(id, userId, canViewAll);

    res.json({
      success: true,
      message: 'Proposal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProposal,
  insertFromItinerary,
  createWithNewItinerary,
  getProposalsByQuery,
  getProposalById,
  downloadPdf,
  sendWhatsapp,
  sendEmail,
  confirmProposal,
  logEvent,
  listAllProposals,
  deleteProposal,
};
