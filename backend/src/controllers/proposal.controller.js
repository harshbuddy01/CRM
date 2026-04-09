// ============================================================
// TravelCRM — Proposal Controller
// ============================================================

const proposalService = require('../services/proposal.service');
const pdfService = require('../services/pdf.service');
const queueService = require('../services/queue.service');
const prisma = require('../config/prisma');
const config = require('../config');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

// ── PDF Cache Helpers ──────────────────────────────────────────
const { uploadPdfToVault, getPdfStreamFromVault } = require('../utils/vault');
const { getArtisanalEmailFrame } = require('../templates/artisanalEmail.template');


/**
 * Generate PDF for a proposal, cache it in MinIO Vault, and return the buffer.
 * If a cached PDF exists (pdfUrl is set), skip regeneration.
 */
const getOrGeneratePdf = async (proposal) => {
  // Use cached PDF if available
  if (proposal.pdfUrl && proposal.pdfStatus === 'ready' && proposal.pdfUrl.startsWith('minio://')) {
    try {
      // Extract filename from 'minio://bucket-name/pdfs/filename.pdf'
      const parts = proposal.pdfUrl.split('/');
      const filename = parts[parts.length - 1];
      
      const stream = await getPdfStreamFromVault(filename);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      return Buffer.concat(chunks);
    } catch (err) {
      logger.warn(`[PDF Cache] Failed to fetch cached PDF for ${proposal.id} from Vault, regenerating...`);
    }
  }

  // Generate fresh PDF
  const htmlContent = generateProposalHtml(proposal);
  const pdfBuffer = await pdfService.generatePdfFromHtml(htmlContent);
  const buffer = Buffer.from(pdfBuffer);
  const filename = `proposal-${proposal.id}.pdf`;

  // Cache to MinIO (non-blocking — don't hold up the response)
  uploadPdfToVault(filename, buffer)
    .then((url) => {
      prisma.proposal.update({
        where: { id: proposal.id },
        data: { pdfUrl: url, pdfStatus: 'ready' }
      }).catch(e => logger.error('[PDF Cache] DB update failed:', e.message));
    })
    .catch(e => logger.error('[PDF Cache] Vault upload failed:', e.message));

  return buffer;
};

// Constants for input validation
const ALLOWED_EVENTS = ['viewed', 'whatsapp_opened', 'email_opened', 'downloaded'];
const MAX_EVENT_LENGTH = 50;

// Note: Legacy ICONS constant was removed (dead code). PREMIUM_ICONS inside generateProposalHtml is used instead.

const generateProposalHtml = (proposal) => {
  const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  
  const getSafeImageUrl = (url) => {
    if (!url) return '';
    let processedUrl = url.startsWith('//') ? `https:${url}` : url;
    if (processedUrl.includes('res.cloudinary.com')) {
      processedUrl = processedUrl.replace('/upload/', '/upload/q_auto,f_auto,w_900/');
    }
    return processedUrl;
  };

  const itinerary = proposal.itinerary;
  const days = itinerary?.days || proposal.days || [];
  const totalDays = days.length;
  const destinations = [...new Set(days.map(d => d.destination?.name).filter(Boolean))].join(', ') || proposal.query?.destination || 'TBD';
  const gallery = itinerary?.galleryImages || [];

  const fromDate = proposal.travelDateFrom || proposal.query?.travelDateFrom;
  const toDate = proposal.travelDateTo || proposal.query?.travelDateTo;
  
  let dateString = 'Season TBD';
  if (fromDate && toDate) {
    const fromStr = new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const toStr = new Date(toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    dateString = `${fromStr} - ${toStr}`;
  } else if (fromDate) {
    dateString = new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Cover image fallback
  const coverImageUrl = itinerary?.coverPhotoUrl 
    ? getSafeImageUrl(itinerary.coverPhotoUrl) 
    : 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2674&auto=format&fit=crop';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Travel Proposal - ${escapeHtml(proposal.query?.name || 'Customer')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Dancing+Script:wght@700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          @page { margin: 0; size: A4; }
          body { 
            margin: 0; padding: 0; 
            font-family: 'Montserrat', sans-serif; 
            color: #2c2c2c; 
            background: #ffffff; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
            font-size: 11px; /* Scaled down to prevent bleeding/overlapping of long texts */
          }
          
          h1, h2, h3 { font-family: 'Playfair Display', serif; color: #1a1a1a; margin: 0; }
          .handwritten { font-family: 'Dancing Script', cursive; color: #8b6e4b; font-size: 24px; }

          /* COVER PAGE */
          .cover-page { 
            width: 100%; height: 100vh; position: relative; overflow: hidden;
            page-break-after: always;
            display: flex;
            flex-direction: column;
          }
          .cover-image-wrapper {
            height: 60vh;
            width: 100%;
            position: relative;
            background: #e2dfd8;
          }
          .cover-image-wrapper.has-bg {
            background-image: url('${coverImageUrl}');
            background-size: cover;
            background-position: center;
          }
          .cover-title-box {
            position: absolute;
            top: 50%; left: 50%; transform: translate(-50%, -50%);
            text-align: center;
            padding: 24px 48px;
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            border: 2px solid #222;
          }
          .cover-title-box h1 {
            font-size: 40px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #000;
          }
          .cover-title-box .subtitle {
            font-size: 13px;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #555;
            margin-top: 10px;
            display: block;
          }
          
          /* Cover Info Block - Two Sections Design */
          .cover-details-container {
            padding: 40px 60px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .cover-metrics {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
          }
          .metric-block {
            width: 45%;
            margin-bottom: 30px;
          }
          .metric-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #888;
            margin-bottom: 8px;
            display: block;
          }
          .metric-val {
            font-size: 18px;
            font-weight: 700;
            color: #111;
            font-family: 'Playfair Display', serif;
            border-bottom: 2px solid #eaeaea;
            padding-bottom: 8px;
            display: block;
          }

          /* PAGE CONTENT WRAPPER */
          .content-page { padding: 40px 60px; }
          
          /* DAY LAYOUT (FLEXBOX LEFT/RIGHT) */
          .day-entry {
            margin-bottom: 60px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 40px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .day-left {
            width: 35%;
            padding-right: 30px;
          }
          .arch-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 120px 120px 0 0;
            box-shadow: 0 15px 30px rgba(0,0,0,0.08);
            border: 4px solid #fff;
          }
          
          .day-right {
            width: 65%;
            display: flex;
            flex-direction: column;
          }
          
          .day-header {
            display: flex;
            align-items: baseline;
            gap: 15px;
            text-transform: uppercase;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .day-header h3 { font-size: 18px; font-weight: 700; letter-spacing: 2px; color: #222; }
          
          .day-description {
            font-size: 12px;
            line-height: 1.6;
            color: #444;
            text-align: justify;
            margin-bottom: 15px;
          }
          
          .events-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }
          
          /* ACCOMMODATION / TRANSPORT BLOCKS */
          .highlight-block {
            background: #fdfaf5;
            border-left: 3px solid #d4af37;
            padding: 12px 18px;
            margin-bottom: 10px;
            border-radius: 0 4px 4px 0;
            box-shadow: 0 1px 5px rgba(0,0,0,0.02);
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .highlight-title { font-weight: 700; color: #8b6e4b; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
          .highlight-body { font-size: 12px; color: #222; line-height: 1.5; }
          .highlight-body strong { font-family: 'Playfair Display', serif; font-size: 15px; display: block; margin-bottom: 3px; color: #000; }
          
          .event-item { font-size: 12px; color: #444; line-height: 1.5; }

          /* PRICING */
          .price-box { margin-top: 50px; padding: 40px; text-align: center; background: #faf9f5; border-radius: 8px; border: 1px dashed #d4af37; break-inside: avoid; page-break-inside: avoid; }
          .price-box h3 { font-size: 24px; margin-bottom: 15px; color: #8b6e4b; font-style: italic; }
          .price-amount { font-size: 42px; font-weight: 700; color: #1a1a1a; font-family: 'Playfair Display', serif; }
          
          /* GALLERY */
          .gallery-header { margin-top: 60px; text-align: center; margin-bottom: 30px; page-break-before: always; }
          .gallery-grid { display: flex; flex-wrap: wrap; gap: 15px; justify-content: space-between; }
          .gallery-item { width: 31%; height: 200px; border-radius: 6px; overflow: hidden; margin-bottom: 15px; }
          .gallery-item img { width: 100%; height: 100%; object-fit: cover; }
          
          .summary-grid {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            gap: 40px;
            page-break-inside: avoid;
          }
          .summary-col { width: 48%; }
          .summary-col h4 { color: #d4af37; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 14px; margin-bottom: 10px; }
          .summary-col-body { font-size: 11px; line-height: 1.5; color: #555; }

          .footer { text-align: center; padding: 30px; color: #888; font-size: 10px; margin-top: 40px; border-top: 1px solid #eee; page-break-inside: avoid; }
        </style>
      </head>
      <body>

        <!-- COVER PAGE -->
        <div class="cover-page">
          <div class="cover-image-wrapper has-bg">
            <div class="cover-title-box">
              <h1>TRAVEL<br/>ITINERARY</h1>
              <span class="subtitle">Custom Crafted Journey</span>
            </div>
          </div>
          
          <div class="cover-details-container">
            <div class="cover-metrics">
              <div class="metric-block">
                <span class="metric-label">Departure</span>
                <span class="metric-val">${escapeHtml(proposal.query?.pickupLocation || proposal.query?.leadSource || 'Your Origin')}</span>
              </div>
              <div class="metric-block">
                <span class="metric-label">Destination</span>
                <span class="metric-val">${escapeHtml(destinations)}</span>
              </div>
              <div class="metric-block">
                <span class="metric-label">Date</span>
                <span class="metric-val">${escapeHtml(dateString)}</span>
              </div>
              <div class="metric-block">
                <span class="metric-label">Travelers</span>
                <span class="metric-val">${proposal.query?.adults || 0} Adults${proposal.query?.children ? `, ${proposal.query.children} Kids` : ''}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ITINERARY DAYS -->
        <div class="content-page">
          ${days.map(day => {
            const events = day.events || [];
            
            // Arch Image Selection
            let archImageUrl = day.imageUrl;
            if (!archImageUrl) {
              const eventWithImage = events.find(e => e.imageUrl);
              if (eventWithImage) archImageUrl = eventWithImage.imageUrl;
            }
            archImageUrl = archImageUrl ? getSafeImageUrl(archImageUrl) : 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=800&auto=format&fit=crop';
            
            // Categorize events
            const hotels = events.filter(e => e.type === 'accommodation');
            const transports = events.filter(e => e.type === 'transport');
            const others = events.filter(e => e.type !== 'accommodation' && e.type !== 'transport');

            return `
            <div class="day-entry">
              <div class="day-left">
                <img class="arch-image" src="${archImageUrl}" alt="Day Visual" />
              </div>
              <div class="day-right">
                <div class="day-header">
                  <h3>DAY ${day.dayNumber} : ${escapeHtml(day.title || destinations)}</h3>
                </div>
                
                ${day.description ? `<div class="day-description">${escapeHtml(day.description).replace(/\n/g, '<br/>')}</div>` : ''}
                
                ${others.length > 0 ? `
                  <div class="events-grid">
                    ${others.map(ev => `
                      <div class="event-item">
                        <strong>${escapeHtml(ev.title)}</strong> ${ev.startTime ? `(${escapeHtml(ev.startTime)})` : ''}
                        ${ev.description ? `<br/>${escapeHtml(ev.description).replace(/\n/g, '<br/>')}` : ''}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                ${hotels.map(hotel => `
                  <div class="highlight-block">
                    <div class="highlight-title">🏨 Accommodation</div>
                    <div class="highlight-body">
                      <strong>${escapeHtml(hotel.title || hotel.metadata?.hotelName)}</strong>
                      ${hotel.metadata?.roomCategory ? `${escapeHtml(hotel.metadata.roomCategory)}` : ''}
                      ${hotel.metadata?.mealPlan ? ` (${escapeHtml(hotel.metadata.mealPlan)})` : ''} <br/>
                      ${hotel.metadata?.checkInDate ? `Check In: ${escapeHtml(hotel.metadata.checkInDate)} ${escapeHtml(hotel.metadata.checkInTime || '')}` : ''}
                      ${hotel.metadata?.checkOutDate ? `<br/>Check Out: ${escapeHtml(hotel.metadata.checkOutDate)} ${escapeHtml(hotel.metadata.checkOutTime || '')}` : ''}
                    </div>
                  </div>
                `).join('')}

                ${transports.map(tr => `
                  <div class="highlight-block">
                    <div class="highlight-title">🚗 Transport</div>
                    <div class="highlight-body">
                      <strong>${escapeHtml(tr.title || tr.metadata?.vehicleType)}</strong>
                      ${tr.startTime ? `Departure: ${escapeHtml(tr.startTime)}<br/>` : ''}
                      ${tr.description ? escapeHtml(tr.description).replace(/\n/g, '<br/>') : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            `;
          }).join('') || '<p style="text-align:center;">Itinerary details coming soon...</p>'}

          <div class="price-box">
            <h3>Investment</h3>
            <div class="price-amount">₹${Number(proposal.sellingPrice || itinerary?.sellingPrice || itinerary?.totalCost || 0).toLocaleString('en-IN')}</div>
            ${itinerary?.perPersonCost ? `<p class="handwritten" style="margin-top: 10px;">₹${Number(itinerary.perPersonCost).toLocaleString('en-IN')} per person</p>` : ''}
          </div>

          ${(itinerary?.inclusionsHtml || itinerary?.exclusionsHtml) ? `
            <div class="summary-grid">
              ${itinerary?.inclusionsHtml ? `
                <div class="summary-col">
                  <h4>Inclusions</h4>
                  <div class="summary-col-body">${itinerary.inclusionsHtml}</div>
                </div>
              ` : ''}
              ${itinerary?.exclusionsHtml ? `
                <div class="summary-col">
                  <h4>Exclusions</h4>
                  <div class="summary-col-body">${itinerary.exclusionsHtml}</div>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        ${gallery.length > 0 ? `
          <div class="content-page">
            <div class="gallery-header">
              <h2 style="font-size: 28px;">Visual Inspiration</h2>
            </div>
            <div class="gallery-grid">
              ${gallery.map(img => `
                <div class="gallery-item">
                  <img src="${getSafeImageUrl(img.imageUrl)}" alt="Gallery Scene" />
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="footer">
          <p class="handwritten" style="font-size: 20px;">Crafted with passion for ${escapeHtml(proposal.query?.name || 'Customer')}</p>
          <div style="letter-spacing: 2px; margin-top: 8px;">WWW.IMAGICAHOLIDAYS.COM</div>
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

// PDF download with Cloudinary caching — first download generates, subsequent ones are instant.
const downloadPdf = async (req, res, next) => {
  try {
    const proposal = await proposalService.getProposalById(req.params.id);
    
    const buffer = await getOrGeneratePdf(proposal);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename=Proposal-v${proposal.version}-${proposal.query.queryCode}.pdf`);
    
    // Log Activity (Non-blocking)
    prisma.activityLog.create({
      data: {
        userId: req.user?.id || null,
        action: 'proposal.pdf_downloaded',
        entityType: 'query',
        entityId: proposal.queryId,
        newValue: { version: proposal.version }
      }
    }).catch(err => logger.error('History Log Error:', err));

    res.end(buffer);
  } catch (error) {
    logger.error('PDF Generation Controller Error:', error.message);
    next(error);
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

    // Automatically move query to 'quoted' status
    await prisma.query.update({ where: { id: proposal.queryId }, data: { status: 'quoted' } });

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

    // Accept both 'body' and 'bodyRichText' from frontend (fixes field mismatch)
    const { to, cc, subject, body, bodyRichText } = req.body;
    const finalTo = to || proposal.query.email;
    if (!finalTo) {
      return res.status(400).json({ success: false, message: 'No recipient email provided.' });
    }

    // Use cached PDF instead of regenerating (30s → instant)
    const pdfBuffer = await getOrGeneratePdf(proposal);

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
    const rawContent = body || bodyRichText || `<p>Hi ${proposal.query.name}, your travel proposal is ready.</p>`;

    // Wrap in Artisanal V3 Frame
    const htmlContent = getArtisanalEmailFrame({
      subject: finalSubject,
      bodyContent: rawContent,
      inviteType: 'proposal'
    });

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

    // Send Email via connection pool (fast with reused connections)
    await sendMail(msg);

    // Update lastSentAt
    await prisma.proposal.update({ where: { id: proposal.id }, data: { lastSentAt: now } });
    
    // Automatically move query to 'quoted' status
    await prisma.query.update({ where: { id: proposal.queryId }, data: { status: 'quoted' } });
    
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
    logger.error('Proposal Email Send Error:', error.message);
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

      // B. Soft-delete and reject all other proposals for this same query to remove UI clutter
      await tx.proposal.updateMany({
        where: { 
          queryId: proposal.queryId,
          id: { not: id },
          status: 'pending' // Only reject pending ones
        },
        data: { 
          status: 'rejected',
          deletedAt: new Date()
        }
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

const updateProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;
    const canViewAll = role === 'admin' || role === 'system_owner';

    // 1. Check if proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { query: true }
    });

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (!canViewAll && proposal.query.assignedTo !== userId && proposal.createdBy !== userId) {
      return res.status(403).json({ success: false, message: 'You do not have access to this proposal' });
    }

    // 2. Update allowed fields
    const { travelDateFrom, travelDateTo } = req.body;
    
    let updateData = {};
    if (travelDateFrom !== undefined) updateData.travelDateFrom = travelDateFrom ? new Date(travelDateFrom) : null;
    if (travelDateTo !== undefined) updateData.travelDateTo = travelDateTo ? new Date(travelDateTo) : null;

    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, message: 'Proposal updated successfully', data: updatedProposal });
  } catch (error) {
    next(error);
  }
};

const deleteProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;
    const canViewAll = role === 'admin' || role === 'system_owner';

    // 1. Check if proposal exists and its status
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.status === 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete a confirmed proposal. Please revert the status first if this was a mistake.' 
      });
    }

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
  updateProposal,
  deleteProposal,
};
