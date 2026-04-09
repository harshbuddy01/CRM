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
  const gallery = itinerary?.galleryImages || [];
  const destinations = [...new Set(days.map(d => d.destination?.name).filter(Boolean))].join(', ') || proposal.query?.destination || 'TBD';

  const fromDate = proposal.travelDateFrom || proposal.query?.travelDateFrom;
  const toDate = proposal.travelDateTo || proposal.query?.travelDateTo;
  
  let dateString = 'Season TBD';
  if (fromDate && toDate) {
    const fromStr = new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const toStr = new Date(toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    dateString = `${fromStr} - ${toStr}`;
  }

  const coverImageUrl = itinerary?.coverPhotoUrl 
    ? getSafeImageUrl(itinerary.coverPhotoUrl) 
    : 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2674&auto=format&fit=crop';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Travel Proposal - ${escapeHtml(proposal.query?.name || 'Customer')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Dancing+Script:wght@700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
            font-size: 10px;
          }
          
          h1, h2, h3, h4 { font-family: 'Playfair Display', serif; color: #1a1a1a; margin: 0; }
          .handwritten { font-family: 'Dancing Script', cursive; color: #8b6e4b; font-size: 20px; }

          /* DESIGNER HEADER */
          .designer-header { text-align: center; padding: 40px 0; background: #fff; border-bottom: 1px solid #f0f0f0; }
          .crafted-text { font-size: 10px; letter-spacing: 0.8em; text-transform: uppercase; color: #8b6e4b; margin-bottom: 12px; display: block; }
          .tour-main-title { font-size: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 10px 0; color: #111; }
          .itinerary-label { font-size: 13px; letter-spacing: 0.4em; color: #666; text-transform: uppercase; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 10px 0; display: inline-block; margin-top: 5px; }

          /* COVER */
          .cover-page { width: 100%; height: 100vh; position: relative; page-break-after: always; display: flex; flex-direction: column; }
          .cover-image-full { height: 75vh; width: 100%; background-image: url('${coverImageUrl}'); background-size: cover; background-position: center; border-bottom: 5px solid #111; }
          .cover-info { flex: 1; padding: 40px 60px; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
          .metric { width: 22%; border-left: 2px solid #d4af37; padding-left: 20px; }
          .metric-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 2.5px; color: #999; margin-bottom: 5px; display: block; }
          .metric-val { font-size: 15px; font-weight: 700; color: #1a1a1a; font-family: 'Playfair Display', serif; }

          /* CONTENT */
          .page-content { padding: 40px 60px; }
          .day-card { margin-bottom: 40px; page-break-inside: avoid; position: relative; border-bottom: 1px solid #f0f0f0; padding-bottom: 30px; }
          .day-num { font-size: 40px; font-weight: 900; color: #d4af37; opacity: 0.15; position: absolute; left: -40px; top: -10px; }
          .day-title-row { margin-bottom: 20px; }
          .day-text-title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #111; }

          .day-split { display: flex; gap: 30px; align-items: flex-start; }
          .day-left-visual { width: 35%; }
          .day-right-content { width: 65%; }
          .arch-img-designed { width: 100%; height: 280px; object-fit: cover; border-radius: 140px 140px 0 0; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }

          .day-desc { font-size: 10.5px; line-height: 1.6; color: #444; margin-bottom: 15px; text-align: justify; border-left: 2px solid #eee; padding-left: 12px; }

          /* ACTIVITIES TWO SECTION */
          .activities-split { display: flex; justify-content: space-between; margin-top: 15px; border-top: 1px solid #f0f0f0; padding-top: 15px; }
          .activity-column { width: 48%; }
          .activity-column h4 { font-size: 8px; text-transform: uppercase; letter-spacing: 2px; color: #8b6e4b; margin-bottom: 10px; border-bottom: 2px solid #f9f9f9; padding-bottom: 4px; display: block; }

          /* VISUAL CARDS */
          .visual-card { display: flex; margin-bottom: 12px; background: #fff; border: 1px solid #eee; border-radius: 4px; overflow: hidden; page-break-inside: avoid; }
          .visual-card-img { width: 90px; height: 90px; object-fit: cover; border-right: 1px solid #eee; }
          .visual-card-data { flex: 1; padding: 12px; display: flex; flex-direction: column; justify-content: center; }
          .card-type { font-size: 7.5px; text-transform: uppercase; color: #d4af37; font-weight: 800; letter-spacing: 1.2px; margin-bottom: 3px; }
          .card-title { font-size: 13px; font-weight: 700; font-family: 'Playfair Display', serif; color: #111; margin: 3px 0; }
          .card-meta { font-size: 8.5px; color: #777; line-height: 1.4; }

          /* PRICING & FOOTER */
          .price-designed { margin-top: 30px; padding: 30px; background: #111; color: #fff; text-align: center; border-radius: 8px; page-break-inside: avoid; }
          .price-designed h3 { color: #d4af37; font-size: 11px; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 15px; }
          .total-amt { font-size: 42px; font-weight: 900; font-family: 'Playfair Display', serif; letter-spacing: 1px; }
          .pricing-label { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.6; margin-top: 12px; }

          .gallery-header { margin-top: 40px; text-align: center; margin-bottom: 25px; page-break-before: auto; }
          .gallery-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; padding: 0 40px; }
          .gallery-item { width: 31%; height: 180px; border-radius: 4px; overflow: hidden; margin-bottom: 12px; border: 1px solid #eee; }
          .gallery-item img { width: 100%; height: 100%; object-fit: cover; }

          .footer-final { text-align: center; padding: 30px 0; margin-top: 40px; border-top: 1px solid #eee; }
          .footer-logo { font-size: 14px; letter-spacing: 6px; text-transform: uppercase; color: #ccc; font-weight: 300; }
        </style>
      </head>
      <body>

        <div class="designer-header">
          <span class="crafted-text">C U S T O M &nbsp; C R A F T E D &nbsp; J O U R N E Y</span>
          <h1 class="tour-main-title">${escapeHtml(itinerary?.title || destinations + ' Tour')}</h1>
          <div class="itinerary-label">TRAVEL ITINERARY</div>
        </div>

        <div class="cover-page">
          <div class="cover-image-full"></div>
          <div class="cover-info">
            <div class="metric"><span class="metric-lbl">Departure</span><span class="metric-val">${escapeHtml(proposal.query?.pickupLocation || 'Your City')}</span></div>
            <div class="metric"><span class="metric-lbl">Duration</span><span class="metric-val">${days.length} Days</span></div>
            <div class="metric"><span class="metric-lbl">Dates</span><span class="metric-val">${escapeHtml(dateString)}</span></div>
            <div class="metric"><span class="metric-lbl">Travelers</span><span class="metric-val">${proposal.query?.adults || 0} Adults</span></div>
          </div>
        </div>

        <div class="page-content">
          ${days.map(day => {
            const events = day.events || [];
            let archImageUrl = day.imageUrl || (events.find(e => e.imageUrl)?.imageUrl);
            archImageUrl = archImageUrl ? getSafeImageUrl(archImageUrl) : 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=800&auto=format&fit=crop';
            
            const activities = events.filter(e => e.type !== 'accommodation' && e.type !== 'transport');
            const morning = activities.slice(0, Math.ceil(activities.length / 2));
            const afternoon = activities.slice(Math.ceil(activities.length / 2));
            
            const accommodations = events.filter(e => e.type === 'accommodation');
            const transports = events.filter(e => e.type === 'transport');

            return `
            <div class="day-card">
              <span class="day-num">${day.dayNumber}</span>
              <div class="day-title-row">
                <h2 class="day-text-title">DAY ${day.dayNumber}: ${escapeHtml(day.title || destinations)}</h2>
              </div>

              <div class="day-split">
                <div class="day-left-visual">
                  <img src="${archImageUrl}" class="arch-img-designed" />
                </div>
                <div class="day-right-content">
                  <div class="day-desc">${escapeHtml(day.description || '').replace(/\n/g, '<br/>')}</div>
                  
                  <div class="activities-split">
                    <div class="activity-column">
                      <h4>Morning</h4>
                      ${morning.map(ev => `
                        <div style="margin-bottom: 15px; border-left: 2px solid #f0f0f0; padding-left: 12px;">
                          <strong style="display:block; font-family:'Playfair Display', serif; font-size:11px; color:#111;">${escapeHtml(ev.title)}</strong>
                          ${ev.imageUrl ? `<img src="${getSafeImageUrl(ev.imageUrl)}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-top: 8px; border: 1px solid #eee;" />` : ''}
                        </div>
                      `).join('') || '<p style="color:#bbb; font-style:italic; font-size:9px;">At leisure...</p>'}
                    </div>
                    <div class="activity-column" style="border-left: 1px solid #f0f0f0; padding-left: 20px;">
                      <h4>Afternoon</h4>
                      ${afternoon.map(ev => `
                        <div style="margin-bottom: 15px; border-left: 2px solid #f0f0f0; padding-left: 12px;">
                          <strong style="display:block; font-family:'Playfair Display', serif; font-size:11px; color:#111;">${escapeHtml(ev.title)}</strong>
                          ${ev.imageUrl ? `<img src="${getSafeImageUrl(ev.imageUrl)}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-top: 8px; border: 1px solid #eee;" />` : ''}
                        </div>
                      `).join('') || '<p style="color:#bbb; font-style:italic; font-size:9px;">At leisure...</p>'}
                    </div>
                  </div>

                  ${accommodations.map(hotel => `
                    <div class="visual-card">
                      <img src="${getSafeImageUrl(hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500')}" class="visual-card-img" />
                      <div class="visual-card-data">
                        <span class="card-type">Sanctuary</span>
                        <h4 class="card-title">${escapeHtml(hotel.title || hotel.metadata?.hotelName)}</h4>
                        <span class="card-meta">
                          ${hotel.metadata?.roomCategory ? escapeHtml(hotel.metadata.roomCategory) : 'Elite Guest Room'}<br/>
                          Arrival: ${escapeHtml(hotel.metadata?.checkInDate || 'TBD')} | Departure: ${escapeHtml(hotel.metadata?.checkOutDate || 'TBD')}
                        </span>
                      </div>
                    </div>
                  `).join('')}

                  ${transports.map(tr => `
                    <div class="visual-card">
                      <img src="${getSafeImageUrl(tr.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500')}" class="visual-card-img" />
                      <div class="visual-card-data">
                        <span class="card-type">Expeditious</span>
                        <h4 class="card-title">${escapeHtml(tr.title || tr.metadata?.vehicleType || 'Executive Transfer')}</h4>
                        <span class="card-meta">${escapeHtml(tr.description || 'Seamless connection across destinations.')}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            `;
          }).join('')}

          ${(itinerary?.inclusionsHtml || itinerary?.exclusionsHtml) ? `
            <div style="margin-top: 40px; page-break-inside: avoid; border-top: 2px solid #111; padding-top: 30px;">
              <h3 style="font-size: 18px; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 20px; text-align: center;">Details of the Journey</h3>
              <div style="display: flex; justify-content: space-between; gap: 30px;">
                ${itinerary?.inclusionsHtml ? `
                  <div style="width: 48%;">
                    <h4 style="font-size: 10px; color: #d4af37; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">The Inclusions</h4>
                    <div style="font-size: 9px; line-height: 1.6; color: #555;">${itinerary.inclusionsHtml}</div>
                  </div>
                ` : ''}
                ${itinerary?.exclusionsHtml ? `
                  <div style="width: 48%;">
                    <h4 style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">The Exclusions</h4>
                    <div style="font-size: 9px; line-height: 1.6; color: #555;">${itinerary.exclusionsHtml}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <div class="price-designed">
            <h3>Standard Offering</h3>
            <div class="total-amt">₹${Number(proposal.sellingPrice || 0).toLocaleString('en-IN')}</div>
            <div class="pricing-label">Total investment for the curated group</div>
          </div>
        </div>

        ${gallery.length > 0 ? `
          <div class="gallery-header">
            <h2 style="font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 4px;">Visual Journey</h2>
            <p style="font-size: 10px; color: #888; margin-top: 10px; letter-spacing: 2px;">SNAPSHOTS FROM YOUR DESTINATION</p>
          </div>
          <div class="gallery-grid">
            ${gallery.map(img => `
              <div class="gallery-item">
                <img src="${getSafeImageUrl(img.imageUrl)}" alt="Gallery Scene" />
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer-final">
          <p class="handwritten" style="font-size: 24px; margin-bottom: 15px;">A voyage perfectly crafted for ${escapeHtml(proposal.query?.name || 'you')}</p>
          <div class="footer-logo">IMAGICA HOLIDAYS</div>
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
