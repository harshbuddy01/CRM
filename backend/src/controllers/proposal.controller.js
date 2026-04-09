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
    
    // Cloudinary Optimization for PDF (Smart Compression & Resizing)
    // Converts high-res originals to optimized versions for email-friendly PDFs
    if (processedUrl.includes('res.cloudinary.com')) {
      processedUrl = processedUrl.replace('/upload/', '/upload/q_auto,f_auto,w_900/');
    }
    
    return processedUrl;
  };

  const itinerary = proposal.itinerary;
  const days = itinerary?.days || proposal.days || [];
  const totalDays = days.length;
  const destinations = [...new Set(days.map(d => d.destination?.name).filter(Boolean))].join(', ') || proposal.query?.destination || 'Your Journey';
  const gallery = itinerary?.galleryImages || [];
  const PREMIUM_ICONS = {
    accommodation: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22v-5a2 2 0 0 1 4 0v5"/><path d="M2 22h20"/><path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18"/><path d="M9 7h1"/><path d="M9 11h1"/><path d="M14 7h1"/><path d="M14 11h1"/></svg>',
    sightseeing: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>',
    transport: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-2.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1-4 0m0 0H9m-4 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1-4 0"/></svg>',
    flight: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
    meal: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
    activity: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    default: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 8 4 4-4 4"/><path d="M8 12h8"/></svg>'
  };

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

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Travel Proposal - ${escapeHtml(proposal.query?.name || 'Customer')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Dancing+Script:wght@700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          @page { margin: 0; size: A4; }
          body { 
            margin: 0; padding: 0; 
            font-family: 'EB Garamond', serif; 
            color: #2c2c2c; 
            background: #fdfbf7; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          .page { 
            width: 100%; 
            position: relative;
            background: #fdfbf7;
            overflow: hidden;
            min-height: 100vh;
            /* Removed the fixed border that was causing overlapping text */
          }

          h1, h2, h3 { font-family: 'Playfair Display', serif; color: #1a1a1a; margin: 0; }
          h4 { font-family: 'Playfair Display', serif; color: #2c2c2c; font-size: 20px; font-weight: 700; }
          .handwritten { font-family: 'Dancing Script', cursive; color: #8b6e4b; font-size: 20px; }

          /* Hero Section */
          .hero { position: relative; height: 600px; width: 100%; overflow: hidden; background: #c5bba3; }
          .hero img { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; }
          .hero-overlay { 
            position: absolute; 
            bottom: 0; left: 0; width: 100%; 
            padding: 80px 60px; 
            background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%); 
            color: white; 
          }
          .hero h1 { color: #ffffff; font-size: 56px; font-weight: 900; margin-bottom: 20px; }
          .hero-badge { 
            font-size: 18px; 
            letter-spacing: 0.2em; 
            text-transform: uppercase; 
            margin-bottom: 10px; 
            display: block;
            color: #d4af37;
            font-weight: 600;
          }
          .hero-meta { display: flex; gap: 30px; font-size: 16px; font-weight: 500; opacity: 0.9; }

          /* Info Bar */
          .info-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
            padding: 40px 60px; 
            background: #fff;
            border-bottom: 1px solid #eee;
          }
          .info-item .label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #a1a1a1; margin-bottom: 5px; }
          .info-item .value { font-size: 18px; font-weight: 700; color: #1a1a1a; font-family: 'Playfair Display', serif; }

          /* Sections */
          .content-wrap { padding: 40px 80px; } /* Added more side padding to prevent cutoffs */
          .section-heading { 
            text-align: center; 
            margin-bottom: 50px; 
            position: relative; 
          }
          .section-heading h2 { font-size: 36px; margin-bottom: 15px; font-style: italic; }
          .section-divider { 
            width: 150px; height: 1px; background: #d4af37; margin: 0 auto; 
            position: relative;
          }
          .section-divider::after {
            content: '❦';
            position: absolute;
            top: -12px; left: 50%;
            transform: translateX(-50%);
            background: #fdfbf7;
            padding: 0 10px;
            color: #d4af37;
            font-size: 18px;
          }

          /* Day Layout */
          .day-entry { margin-bottom: 70px; break-inside: avoid; }
          .day-title-wrap { display: flex; align-items: baseline; gap: 15px; margin-bottom: 25px; border-bottom: 1px dashed #d4af37; padding-bottom: 15px; }
          .day-number { font-size: 26px; color: #d4af37; font-weight: 900; }
          .day-content { display: flex; flex-direction: column; gap: 30px; } /* Stacked to stop overlapping text */
          .day-text { width: 100%; }
          .day-photo { width: 100%; margin-bottom: 20px; }
          .day-photo img { width: 100%; border-radius: 4px; box-shadow: 0 5px 25px rgba(0,0,0,0.1); border: 4px solid white; object-fit: cover; max-height: 400px; }
          
          .day-description { font-size: 20px; line-height: 1.8; color: #333; margin-bottom: 30px; text-align: left; }
          
          .events-list { border-left: 2px solid rgba(212, 175, 55, 0.3); padding-left: 20px; margin-left: 10px; }
          .event-item { 
            padding: 20px 0; 
            border-bottom: 1px solid rgba(0,0,0,0.05); 
            display: flex; 
            flex-direction: column;
            position: relative;
          }
          .event-symbol { position: absolute; left: -32px; top: 22px; background: #fdfbf7; padding: 5px 0; }
          .event-info { display: flex; flex-direction: column; gap: 6px; }
          .event-info h4 { font-size: 22px; margin: 0; color: #000; letter-spacing: -0.02em; }
          .event-info .meta-title { font-size: 16px; font-weight: 600; color: #2c2c2c; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'EB Garamond', serif; }
          .event-info .soft-note { font-family: 'Dancing Script', cursive; font-size: 22px; color: #8b6e4b; margin: 4px 0; }
          .event-image { margin-top: 15px; }
          .event-image img { max-width: 80%; border-radius: 8px; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.08); max-height: 250px; object-fit: cover; }

          /* Enhanced Meta Badges */
          .meta-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 5px; }
          .meta-badge { 
            font-size: 11px; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 0.1em; 
            background: #f4efdf; 
            color: #8b6e4b; 
            padding: 4px 10px; 
            border-radius: 4px;
            border: 1px solid rgba(139, 110, 75, 0.2);
          }


          /* Pricing & Policy */
          .price-scroll {
            margin: 60px 0;
            padding: 50px;
            background: white;
            border: 1px solid #e5e5e5;
            text-align: center;
            box-shadow: inset 0 0 50px rgba(212, 175, 55, 0.05);
            border-radius: 8px;
          }
          .price-scroll h3 { font-size: 26px; color: #8b6e4b; margin-bottom: 10px; font-style: italic; }
          .grand-total { font-size: 54px; font-weight: 900; color: #1a1a1a; font-family: 'Playfair Display', serif; }

          .policy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .policy-card h4 { font-size: 22px; margin-bottom: 15px; color: #d4af37; font-style: italic; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .policy-card { font-size: 15px; line-height: 1.7; color: #444; }

          /* Gallery Masonry */
          .gallery-section { margin-top: 80px; }
          .gallery-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .gallery-item { height: 250px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }

          .footer { text-align: center; padding: 60px 0; border-top: 1px solid #eee; margin-top: 80px; }
          .footer p { font-family: 'Dancing Script', cursive; font-size: 28px; color: #8b6e4b; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="hero">
            ${itinerary?.coverPhotoUrl ? `<img src="${getSafeImageUrl(itinerary.coverPhotoUrl)}" alt="Cover" />` : ''}
            <div class="hero-overlay">
              <span class="hero-badge">A Curated Journey</span>
              <h1>${escapeHtml(itinerary?.title || proposal.query?.name || 'Crafted Proposal')}</h1>
              <div class="hero-meta">
                <span>${totalDays} Days of Discovery</span>
                <span>❦</span>
                <span>Ref: ${escapeHtml(proposal.query?.queryCode || 'QRY')}</span>
              </div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="label">Prepared For</div>
              <div class="value">${escapeHtml(proposal.query?.name || 'Valued Guest')}</div>
            </div>
            <div class="info-item">
              <div class="label">Traveling Party</div>
              <div class="value">${proposal.query?.adults || 0} Adults${proposal.query?.children ? `, ${proposal.query.children} Kids` : ''}</div>
            </div>
            <div class="info-item">
              <div class="label">Travel Dates</div>
              <div class="value">${escapeHtml(dateString)}</div>
            </div>
            <div class="info-item">
              <div class="label">Destinations</div>
              <div class="value">${escapeHtml(destinations)}</div>
            </div>
          </div>

          <div class="content-wrap">
            <div class="section-heading">
              <span class="handwritten">The Itinerary</span>
              <h2>Your Daily Chronicle</h2>
              <div class="section-divider"></div>
            </div>

            ${days.map(day => {
              const events = day.events || [];
              const dayImage = day.imageUrl;
              
              let dateText = '';
              if (itinerary?.travelDateFrom) {
                const dateObj = new Date(itinerary.travelDateFrom);
                dateObj.setDate(dateObj.getDate() + day.dayNumber - 1);
                dateText = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
              }
              
              return `
              <div class="day-entry">
                <div class="day-title-wrap">
                  <div style="display: flex; flex-direction: column;">
                    <span class="day-number">Day ${day.dayNumber}</span>
                    ${dateText ? `<span style="font-family: 'EB Garamond', serif; color: #a1a1a1; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 5px;">${dateText}</span>` : ''}
                  </div>
                  <h3>${escapeHtml(day.title || 'In Search of Magic')}</h3>
                </div>
                <div class="day-content">
                  ${dayImage ? `
                    <div class="day-photo">
                      <img src="${getSafeImageUrl(dayImage)}" alt="Scene" />
                    </div>
                  ` : ''}
                  <div class="day-text">
                    ${day.description ? `<div class="day-description">${escapeHtml(day.description).replace(/\n/g, '<br/>')}</div>` : ''}
                    
                    <div class="events-list">
                      ${events.map(ev => `
                        <div class="event-item">
                          <span class="event-symbol">${PREMIUM_ICONS[ev.type] || PREMIUM_ICONS.default}</span>
                          <div class="event-info">
                            <h4>${escapeHtml(ev.title)}</h4>
                            <div class="meta-row">
                              ${ev.type === 'accommodation' && ev.metadata?.hotelName ? `<div class="meta-badge">Stay: ${escapeHtml(ev.metadata.hotelName)}</div>` : ''}
                              ${ev.type === 'accommodation' && ev.metadata?.roomCategory ? `<div class="meta-badge">${escapeHtml(ev.metadata.roomCategory)}</div>` : ''}
                              ${ev.type === 'accommodation' && ev.metadata?.roomType ? `<div class="meta-badge">Room: ${escapeHtml(ev.metadata.roomType)}</div>` : ''}
                              ${ev.type === 'accommodation' && ev.metadata?.mealPlan ? `<div class="meta-badge">Plan: ${escapeHtml(ev.metadata.mealPlan)}</div>` : ''}
                              
                              ${ev.type === 'accommodation' && ev.metadata?.checkInDate ? `
                                <div class="meta-badge" style="background: rgba(212,175,55,0.05); border-color: rgba(212,175,55,0.3);">
                                  In: ${escapeHtml(ev.metadata.checkInDate)} ${ev.metadata.checkInTime ? `• ${escapeHtml(ev.metadata.checkInTime)}` : ''}
                                </div>
                              ` : ''}
                              
                              ${ev.type === 'accommodation' && ev.metadata?.checkOutDate ? `
                                <div class="meta-badge" style="background: rgba(212,175,55,0.05); border-color: rgba(212,175,55,0.3);">
                                  Out: ${escapeHtml(ev.metadata.checkOutDate)} ${ev.metadata.checkOutTime ? `• ${escapeHtml(ev.metadata.checkOutTime)}` : ''}
                                </div>
                              ` : ''}

                              ${ev.type === 'transport' && ev.metadata?.vehicleType ? `<div class="meta-badge">Vehicle: ${escapeHtml(ev.metadata.vehicleType)}</div>` : ''}
                              ${ev.type === 'transport' && ev.description ? `<div class="meta-badge">Route: ${escapeHtml(ev.description)}</div>` : ''}
                              ${ev.startTime && ev.type !== 'accommodation' ? `<div class="meta-badge">Time: ${escapeHtml(ev.startTime)}</div>` : ''}
                            </div>
                            ${ev.description && ev.type !== 'transport' ? `<div class="soft-note">${escapeHtml(ev.description).replace(/\n/g, '<br/>')}</div>` : ''}
                          </div>

                          ${ev.imageUrl ? `
                            <div class="event-image">
                              <img src="${getSafeImageUrl(ev.imageUrl)}" alt="Event Detail" />
                            </div>
                          ` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
              `;
            }).join('') || '<p class="handwritten" style="text-align: center; font-size: 28px;">Your custom journey awaits...</p>'}

            <div class="price-scroll">
              <h3 class="handwritten">The Investment</h3>
              <div class="grand-total">₹${Number(proposal.sellingPrice || itinerary?.sellingPrice || itinerary?.totalCost || 0).toLocaleString('en-IN')}</div>
              ${itinerary?.perPersonCost ? `<p class="handwritten" style="font-size: 20px; margin-top: 10px;">Offering at ₹${Number(itinerary.perPersonCost).toLocaleString('en-IN')} per person</p>` : ''}
            </div>

            ${gallery.length > 0 ? `
            <div class="gallery-section">
              <div class="section-heading">
                <span class="handwritten">Visual Musings</span>
                <h2>Journey Gallery</h2>
                <div class="section-divider"></div>
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

            ${(itinerary?.inclusionsHtml || itinerary?.exclusionsHtml) ? `
            <div class="gallery-section">
              <div class="section-heading" style="margin-top: 80px;">
                <span class="handwritten">Fine Print</span>
                <h2>Guidelines & Grace</h2>
                <div class="section-divider"></div>
              </div>
              <div class="policy-grid">
                ${itinerary?.inclusionsHtml ? `
                  <div class="policy-card">
                    <h4>Inclusions</h4>
                    <div>${itinerary.inclusionsHtml}</div>
                  </div>
                ` : ''}
                ${itinerary?.exclusionsHtml ? `
                  <div class="policy-card">
                    <h4>Exclusions</h4>
                    <div>${itinerary.exclusionsHtml}</div>
                  </div>
                ` : ''}
              </div>
            </div>
            ` : ''}

            <div class="footer">
              <p>Handcrafted with passion by Imagica Holidays</p>
              <div style="font-size: 12px; letter-spacing: 0.1em; color: #aaa; margin-top: 10px;">WWW.IMAGICAHOLIDAYS.COM</div>
            </div>
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
