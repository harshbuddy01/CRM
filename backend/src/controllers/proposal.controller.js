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
  // Always generate fresh PDF to apply latest templates, logo, terms layout & styles

  // Generate fresh PDF
  let htmlContent;
  if (proposal.itineraryId) {
    try {
      const itineraryService = require('../services/itinerary.service');
      const orgSettingService = require('../services/org-setting.service');
      const { generateItineraryHtml } = require('./itinerary.controller');
      
      const itinerary = await itineraryService.getExportData(proposal.itineraryId);
      const settings = await orgSettingService.getAllSettings();
      
      if (proposal.query) {
        itinerary.proposals = [
          {
            query: {
              name: proposal.query.name,
              queryCode: proposal.query.queryCode
            }
          }
        ];
        itinerary.queryCode = proposal.query.queryCode;
      }
      
      htmlContent = generateItineraryHtml(itinerary, settings);
    } catch (itineraryErr) {
      logger.error('[PDF Generation] Failed to generate itinerary PDF, falling back to proposal HTML:', itineraryErr);
      htmlContent = generateProposalHtml(proposal);
    }
  } else {
    htmlContent = generateProposalHtml(proposal);
  }

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
    if (processedUrl.startsWith('http://')) {
      processedUrl = processedUrl.replace('http://', 'https://');
    }
    if (processedUrl.includes('res.cloudinary.com')) {
      processedUrl = processedUrl.replace('/upload/', '/upload/q_auto,f_auto,w_900/');
    }
    return processedUrl;
  };

  const itinerary = proposal.itinerary;
  const days = itinerary?.days || proposal.days || [];
  const gallery = itinerary?.galleryImages || [];
  const destinations = [...new Set(days.map(d => d.destination?.name).filter(Boolean))].join(' • ') || itinerary?.title || proposal.query?.destination || 'TBD';
  const departurePoint = proposal.query?.pickupLocation || days[0]?.destination?.name || 'TBD';

  const fromDate = proposal.travelDateFrom || itinerary?.travelDateFrom || proposal.query?.travelDateFrom;
  const toDate = proposal.travelDateTo || itinerary?.travelDateTo || proposal.query?.travelDateTo;
  
  let dateString = 'Season TBD';
  if (fromDate && toDate) {
    const fromStr = new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const toStr = new Date(toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    dateString = `${fromStr} - ${toStr}`;
  }

  const coverImageUrl = itinerary?.coverPhotoUrl 
    ? getSafeImageUrl(itinerary.coverPhotoUrl) 
    : 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2674&auto=format&fit=crop';

  const numDays = days.length;
  const numNights = Math.max(0, numDays - 1);
  const durationString = numDays > 0 ? `${numDays} Days & ${numNights} Nights` : 'Duration TBD';

  const adults = proposal.query?.adults || 0;
  const children = proposal.query?.children || 0;
  let paxString = 'Travellers TBD';
  if (adults > 0 || children > 0) {
    paxString = `${adults} Adult${adults !== 1 ? 's' : ''}`;
    if (children > 0) paxString += ` & ${children} Child${children !== 1 ? 'ren' : ''}`;
  }

  // --- UI ICON CONSTANTS (SVG) TO FIX PDF RENDERING ISSUE ---
  const ICONS = {
    airplane: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px;"><path d="M2 22h20"/><path d="M6.36 17.4 4 17l-3-4 1.1-.55 3.5 1.5 5-5-3-5 1.5-1.5L14 9.5l6-3.5c.5-.3 1.2-.1 1.5.4a1.2 1.2 0 0 1 0 1.1l-1.5 3 2.5 4c.4.7.1 1.5-.6 1.9l-1.5 1-5-3-5 5Z"/></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  };

  const CONTACT_INFO_HTML = `
    <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 15px 30px; font-family: 'Montserrat', sans-serif; font-size: 10px; color: #555; font-weight: 500; max-width: 700px; margin: 0 auto; line-height: 1;">
      <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" style="width: 13px; height: 13px;" />
        <span>+91 97330 38048</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Email" style="width: 13px; height: 13px;" />
        <span>info@imagicaholidays.com</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.6;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        <span>www.imagicaholidays.com</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        <span>@sikkimdiariesptr</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b5998" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
        <span>/sikkimdiariesptr</span>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Travel Proposal - ${escapeHtml(proposal.query?.name || 'Customer')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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

          /* HERO SECTION OVERLAY */
          .hero-container { position: relative; width: 100%; height: 350px; overflow: hidden; }
          .hero-img { width: 100%; height: 100%; object-fit: cover; }
          .hero-overlay-text {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            width: 90%;
          }
          .hero-title {
            color: white;
            font-size: 64px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            line-height: 1;
            /* Stylized outline/shadow as per draft */
            text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 4px 4px 10px rgba(0,0,0,0.5);
          }

          /* META BAR */
          .thick-divider { width: 100%; height: 15px; background: #454545; margin-bottom: 25px; }
          .meta-info-row { display: flex; justify-content: space-between; padding: 0 60px 30px; border-bottom: 1px solid #111; margin-bottom: 40px; }
          .meta-item { width: 45%; font-family: 'Playfair Display', serif; font-size: 14px; }
          .meta-label { font-weight: 700; }
          .meta-value { border-bottom: 1px solid #999; display: inline-block; min-width: 150px; padding: 0 5px; font-weight: 400; }

          /* CONTENT */
          .page-content { padding: 0 60px 40px; }
          .day-row { display: flex; align-items: flex-start; gap: 30px; margin-bottom: 50px; page-break-inside: avoid; }
          .day-row.even { flex-direction: row-reverse; }

          .day-visual { width: 35%; }
          .arch-img { width: 100%; height: 260px; object-fit: cover; border-radius: 130px 130px 0 0; }

          .day-details { width: 65%; }
          .day-header { border-bottom: 1.5px solid #111; padding-bottom: 10px; margin-bottom: 15px; }
          .day-title { font-size: 18px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; color: #333; }
          .day-title span { color: #8b6e4b; margin-right: 10px; }

          .split-columns { display: flex; gap: 20px; position: relative; }
          .split-columns::after { content: ''; position: absolute; left: 50%; top: 10%; bottom: 10%; width: 1px; background: #ddd; }
          .col-half { width: 48%; }

          .col-label { color: #8b6e4b; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; display: block; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px; }
          .col-label span { color: #999; margin-left: 5px; font-weight: 400; }
          .col-text { font-size: 9.5px; line-height: 1.5; color: #555; text-align: justify; }

          /* CARDS FOR STAY/TRANSPORT */
          .mini-card { display: flex; background: #fafafa; border: 1px solid #eee; margin-top: 15px; border-radius: 4px; overflow: hidden; }
          .mini-card-img { width: 80px; height: 80px; object-fit: cover; }
          .mini-card-data { flex: 1; padding: 10px; display: flex; flex-direction: column; justify-content: center; }
          .mini-type { font-size: 7px; text-transform: uppercase; color: #8b6e4b; font-weight: 800; }
          .mini-title { font-size: 11px; font-weight: 700; font-family: 'Playfair Display', serif; }
          .mini-meta { font-size: 8px; color: #777; margin-top: 3px; }

          /* PRICE BLOCK */
          .price-block { 
            margin-top: 50px; padding: 40px; 
            background: #faf7f2; color: #333; text-align: center; page-break-inside: avoid; 
            border: 1px solid #e0d0c0;
            border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
            position: relative;
          }
          .price-block::before {
            content: '';
            position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px;
            border: 1px solid #8b6e4b; opacity: 0.3;
            border-radius: 15px 225px 15px 255px/255px 15px 225px 15px;
            pointer-events: none;
          }
          .price-val { font-size: 42px; font-weight: 700; font-family: 'Montserrat', sans-serif; color: #8b6e4b; letter-spacing: 1px; }
          .price-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #666; margin-top: 12px; font-weight: 600; }
          .price-meta { font-size: 9px; color: #999; margin-top: 6px; font-style: italic; }

          /* GALLERY */
          .gallery-section { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 40px; page-break-before: always; padding: 60px; }
          .gallery-item { flex: 1 1 30%; height: 220px; border-radius: 8px; overflow: hidden; box-shadow: 4px 4px 15px rgba(0,0,0,0.05); border: 4px solid #fff; }
          .gallery-item img { width: 100%; height: 100%; object-fit: cover; }

          /* PAGE STRUCTURE & BREATHING ROOM */
          .first-page { 
            height: 297mm; 
            width: 100%;
            position: relative; 
            overflow: hidden; 
            background: #fff;
            page-break-after: always; 
          }
          .branding-footer { 
            position: absolute; 
            bottom: 60px; 
            width: 100%; 
            left: 0; 
            padding-bottom: 20px;
          }
          .main-itinerary-start { 
            padding-top: 60px; 
          }
        </style>
      </head>
      <body>

        <div class="first-page">
          <div class="hero-container">
            <img src="${coverImageUrl}" class="hero-img" />
            <div class="hero-overlay-text">
              <h1 class="hero-title">${escapeHtml(itinerary?.title || proposal.query?.destination || 'TRAVEL ITINERARY')}</h1>
            </div>
          </div>

          <div class="thick-divider"></div>

          <div class="meta-info-row">
            <div class="meta-item">
              <div style="margin-bottom: 12px;">
                <span class="meta-label">${ICONS.airplane} Route :</span>
                <span class="meta-value">${escapeHtml(destinations)}</span>
              </div>
              <div>
                <span class="meta-label">${ICONS.clock} Duration :</span>
                <span class="meta-value">${escapeHtml(durationString)}</span>
              </div>
            </div>
            <div class="meta-item" style="text-align: right;">
              <div style="margin-bottom: 12px;">
                <span class="meta-label">${ICONS.calendar} Date :</span>
                <span class="meta-value">${escapeHtml(dateString)}</span>
              </div>
              <div>
                <span class="meta-label">${ICONS.users} Travellers :</span>
                <span class="meta-value">${escapeHtml(paxString)}</span>
              </div>
            </div>
          </div>

          <!-- PAYMENT SECTION (MOVED TO TOP) -->
          <div style="padding: 0 60px;">
            <div class="price-block" style="margin-top: 0; margin-bottom: 30px;">
              <div class="price-val">₹${Number(proposal.sellingPrice || 0).toLocaleString('en-IN')}</div>
              <div class="price-lbl">Proposed Tour Cost</div>
              <div class="price-meta">Calculated for ${escapeHtml(paxString)}</div>
              <div style="margin-top: 15px; font-size: 8px; color: #888; font-style: normal; line-height: 1.4; max-width: 80%; margin-left: auto; margin-right: auto;">
                Note: All prices are subject to change without prior notice as per availability, 
                the final date of travel and any changes in taxes.
              </div>
            </div>
          </div>

          <!-- BRAND & CONTACT IDENTITY SECTION (FORCE TO BOTTOM OF FIRST PAGE) -->
          <div class="branding-footer" style="text-align: center;">
            <div style="width: 200px; height: 1px; background: #8b6e4b; opacity: 0.3; margin: 0 auto 25px;"></div>
            <div style="margin-bottom: 20px;">
              <h2 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; letter-spacing: 5px; color: #1a1a1a; margin: 0;">IMAGICA</h2>
              <div style="font-size: 9px; color: #8b6e4b; text-transform: uppercase; letter-spacing: 3px; font-weight: 600; margin-top: 4px;">Luxury Holidays & Curated Experiences</div>
            </div>
            
            ${CONTACT_INFO_HTML}
          </div>
        </div>

        <div class="page-content main-itinerary-start">
          ${days.map((day, dIdx) => {
            const isEven = (dIdx + 1) % 2 === 0;
            const events = day.events || [];
            let archImageUrl = day.imageUrl || (events.find(e => e.imageUrl)?.imageUrl);
            archImageUrl = archImageUrl ? getSafeImageUrl(archImageUrl) : 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=800&auto=format&fit=crop';
            
            const activities = events.filter(e => e.type !== 'accommodation' && e.type !== 'transport');
            const stay = events.find(e => e.type === 'accommodation');
            const trans = events.find(e => e.type === 'transport');

            // Calculate exact date for the day
            let formattedDateAttractive = '';
            if (fromDate) {
              const d = new Date(fromDate);
              d.setDate(d.getDate() + (day.dayNumber - 1));
              
              const getOrdinalNum = (n) => n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
              const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
              const dayOfMonth = getOrdinalNum(d.getDate());
              const month = d.toLocaleDateString('en-US', { month: 'long' });
              const year = d.getFullYear();
              
              formattedDateAttractive = `${weekday}, ${dayOfMonth} of ${month} ${year}`;
            }

            const desc = day.description || '';
            const highlights = activities.map(a => a.title).join(' • ');

            return `
            <div class="day-row ${isEven ? 'even' : ''}">
              <div class="day-visual">
                <img src="${archImageUrl}" class="arch-img" />
              </div>
              <div class="day-details">
                <div class="day-header">
                  <h2 class="day-title"><span>DAY ${day.dayNumber} :</span> ${escapeHtml(day.title || destinations)}</h2>
                  <div class="day-date" style="font-family: 'Playfair Display', serif; font-size: 16px; color: #8b6e4b; font-weight: 700; margin-top: 6px; font-style: italic;">
                    ${escapeHtml(formattedDateAttractive)}
                  </div>
                  ${highlights ? `<div style="color: #8b6e4b; font-size: 10px; font-weight: 600; margin-top: 10px; letter-spacing: 1px; text-transform: uppercase;">✦ Highlights: ${escapeHtml(highlights)}</div>` : ''}
                </div>
                
                <div class="split-columns">
                  <div class="col-half" style="width: 100%;">
                    <div class="col-text" style="column-count: 2; column-gap: 30px; column-rule: 1px solid #ccc; orphans: 2; widows: 2; text-align: left;">
                      ${desc ? `<p style="margin-top:0;">${escapeHtml(desc)}</p>` : ''}
                      ${activities.map(ev => `
                        <div style="margin-top:10px; break-inside: avoid-column;">
                          • <strong>${escapeHtml(ev.title)}</strong>
                          ${ev.description ? `<br/><span style="color:#777; font-size: 8.5px; margin-left: 8px; display: block;">${escapeHtml(ev.description)}</span>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>

                ${stay ? `
                <div class="mini-card">
                  <img src="${getSafeImageUrl(stay.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=250')}" class="mini-card-img" />
                  <div class="mini-card-data">
                    <span class="mini-type">Sanctuary</span>
                    <h4 class="mini-title">${escapeHtml(stay.title || stay.metadata?.hotelName)}</h4>
                    <span class="mini-meta">
                      ${escapeHtml(stay.metadata?.roomType || stay.metadata?.roomCategory || 'Standard Room')}
                      ${stay.metadata?.mealPlan ? `<br/>Meal Plan: ${escapeHtml(stay.metadata.mealPlan)}` : ''}
                      ${stay.description ? `<br/>Notes: ${escapeHtml(stay.description)}` : ''}
                      ${stay.metadata?.checkInDate ? `<br/>Check-In: ${escapeHtml(stay.metadata.checkInDate)}` : ''}
                      ${stay.metadata?.checkOutDate ? ` | Check-Out: ${escapeHtml(stay.metadata.checkOutDate)}` : ''}
                    </span>
                  </div>
                </div>
                ` : ''}

                ${trans ? `
                <div class="mini-card">
                  <img src="${getSafeImageUrl(trans.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=250')}" class="mini-card-img" />
                  <div class="mini-card-data">
                    <span class="mini-type">Expedition Vector</span>
                    <h4 class="mini-title">${escapeHtml(trans.title || trans.metadata?.vehicleType || 'Executive Transfer')}</h4>
                    <span class="mini-meta">${escapeHtml(trans.description || 'Door-to-door curated transit.')}</span>
                  </div>
                </div>
                ` : ''}
              </div>
            </div>
            `;
          }).join('')}

          ${(itinerary?.inclusionsHtml || itinerary?.exclusionsHtml) ? `
            <div style="margin-top: 40px; page-break-inside: avoid; border-top: 2px solid #111; padding-top: 20px;">
              <div style="display: flex; gap: 30px;">
                <div style="width: 50%;">
                  <h4 style="color:#8b6e4b; font-size:10px; text-transform:uppercase; letter-spacing:2px; margin-bottom:10px;">Inclusions</h4>
                  <div style="font-size: 8.5px; line-height: 1.4; color: #555;">${itinerary.inclusionsHtml}</div>
                </div>
                <div style="width: 50%;">
                  <h4 style="color:#999; font-size:10px; text-transform:uppercase; letter-spacing:2px; margin-bottom:10px;">Exclusions</h4>
                  <div style="font-size: 8.5px; line-height: 1.4; color: #555;">${itinerary.exclusionsHtml}</div>
                </div>
              </div>
            </div>
          ` : ''}

          ${(itinerary?.paymentPolicyHtml || itinerary?.cancellationPolicyHtml || itinerary?.termsHtml) ? `
            <div style="margin-top: 25px; page-break-inside: avoid; border-top: 1px solid #ddd; padding-top: 15px;">
              <h4 style="color:#111; font-size:10px; text-transform:uppercase; letter-spacing:2px; margin-bottom:10px;">Policies & General Terms</h4>
              <div style="font-size: 8px; line-height: 1.4; color: #777;">
                ${itinerary.paymentPolicyHtml ? `<div style="margin-bottom:8px;"><strong>Payment Policy:</strong> ${itinerary.paymentPolicyHtml}</div>` : ''}
                ${itinerary.cancellationPolicyHtml ? `<div style="margin-bottom:8px;"><strong>Cancellation Policy:</strong> ${itinerary.cancellationPolicyHtml}</div>` : ''}
                ${itinerary.termsHtml ? `<div style="margin-bottom:8px;"><strong>General Terms:</strong> ${itinerary.termsHtml}</div>` : ''}
              </div>
            </div>
          ` : ''}

          <div style="margin-top: 40px; text-align: center; color: #aaa; font-family: 'Playfair Display', serif; font-style: italic; font-size: 14px;">
            Your Journey Awaits...
          </div>
        </div>

        ${gallery.length > 0 ? `
          <div class="gallery-section">
            ${gallery.map(img => `
              <div class="gallery-item"><img src="${getSafeImageUrl(img.imageUrl)}" /></div>
            `).join('')}
          </div>
        ` : ''}

        <!-- BRAND & CONTACT IDENTITY SECTION (BOTTOM) -->
        <div style="text-align: center; padding: 60px 40px; border-top: 1px solid #eee; margin-top: 60px; page-break-inside: avoid;">
          <h3 style="font-size: 20px; color: #8b6e4b; margin-bottom: 25px; font-family: 'Playfair Display', serif; font-weight: 700; letter-spacing: 1px;">Ready for your next adventure with Imagica?</h3>
          <p style="font-size: 11px; color: #777; margin-bottom: 30px; font-family: 'Montserrat', sans-serif;">Our travel experts are ready to personalize this itinerary even further for you.</p>
          
          <div style="width: 200px; height: 1px; background: #eee; margin: 0 auto 30px;"></div>

          ${CONTACT_INFO_HTML}
          
          <div style="margin-top: 40px; font-size: 9px; color: #aaa; text-transform: uppercase; letter-spacing: 2px;">
            © ${new Date().getFullYear()} Imagica Holidays • All Rights Reserved
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
    res.setHeader('Content-Disposition', `attachment; filename="Proposal-v${proposal.version}-${proposal.query.queryCode}.pdf"`);
    
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

    // Automatically move query to 'quoted' status ONLY if it's not already confirmed or further along
    if (proposal.query && !['confirmed', 'in_progress', 'completed'].includes(proposal.query.status)) {
      await prisma.query.update({ where: { id: proposal.queryId }, data: { status: 'quoted' } });
    }

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

    // Build the PDF download link (avoids attaching large PDF binary — fixes 552 5.3.4 SMTP size error)
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = (config.apiUrl || `${protocol}://${req.get('host')}/api/v1`).replace(/\/$/, '');
    const pdfDownloadUrl = `${baseUrl}/proposals/${proposal.id}/pdf`;

    const finalSubject = subject || 'Your Travel Proposal is Ready!';
    const rawContent = body || bodyRichText || `<p>Hi ${proposal.query.name}, your travel proposal is ready.</p>`;

    // Add "View Online" link if itinerary exists
    const viewOnlineHtml = proposal.itinerary ? `
        <a href="${(process.env.FRONTEND_URL || 'https://crm.imagicaholidays.com')}/share/${proposal.itinerary.shareSlug || proposal.itinerary.id}" 
           style="display:inline-block;background:#a5813b;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;letter-spacing:0.5px;margin-bottom:12px;box-shadow:0 4px 12px rgba(165,129,59,0.25);">
          🌐 View Proposal Online
        </a><br/>
    ` : '';

    // Append buttons to the email body
    const pdfLinkHtml = `
      <div style="margin-top:24px;text-align:center;">
        ${viewOnlineHtml}
        <a href="${pdfDownloadUrl}" 
           style="display:inline-block;background:#1a1a2e;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;letter-spacing:0.5px;">
          📄 Download Your Proposal PDF
        </a>
        <p style="margin-top:10px;font-size:12px;color:#888;">Or copy this link: <a href="${pdfDownloadUrl}" style="color:#666;">${pdfDownloadUrl}</a></p>
      </div>
    `;

    const combinedBody = rawContent + pdfLinkHtml;

    // Fetch Org Settings for brand logo and company details
    const orgSettingService = require('../services/org-setting.service');
    const settings = await orgSettingService.getAllSettings();

    // Wrap in Artisanal Frame
    const htmlContent = getArtisanalEmailFrame({
      subject: finalSubject,
      bodyContent: combinedBody,
      inviteType: 'proposal',
      companyLogoUrl: settings.companyLogoUrl || settings.companyLogo || '',
      companyName: settings.companyName || 'Imagica Holidays',
      companySlogan: settings.companySlogan || 'CURATED JOURNEYS. LASTING MEMORIES.',
      companyPhone: settings.companyPhone || settings.phone || '+91 99999 99999',
      companyEmail: settings.companyEmail || settings.email || 'info@imagicaholidays.com',
      companyWebsite: settings.companyWebsite || settings.website || 'imagicaholidays.com'
    });

    // Prepare attachments — only include extra file if user uploaded one (and it's small enough)
    const attachments = [];
    if (req.file) {
      const fileSizeMB = req.file.buffer.length / (1024 * 1024);
      if (fileSizeMB <= 15) {
        attachments.push({
          filename: req.file.originalname,
          content: req.file.buffer,
          contentType: req.file.mimetype
        });
      } else {
        logger.warn(`Skipped attaching ${req.file.originalname} — too large (${fileSizeMB.toFixed(1)}MB)`);
      }
    }

    // Prepare Nodemailer Message
    const msg = {
      to: finalTo,
      subject: finalSubject,
      html: htmlContent,
      ...(attachments.length > 0 && { attachments })
    };

    if (cc) {
      msg.cc = cc.split(',').map(e => e.trim()).filter(Boolean).join(',');
    }

    // Send Email via connection pool (fast with reused connections)
    await sendMail(msg);

    // Update lastSentAt
    await prisma.proposal.update({ where: { id: proposal.id }, data: { lastSentAt: now } });
    
    // Automatically move query to 'quoted' status ONLY if it's not already confirmed or further along
    if (proposal.query && !['confirmed', 'in_progress', 'completed'].includes(proposal.query.status)) {
      await prisma.query.update({ where: { id: proposal.queryId }, data: { status: 'quoted' } });
    }
    
    // Log Activity
    await prisma.integrationLog.create({
      data: {
        type: 'email',
        direction: 'outbound',
        status: 'success',
        payload: { provider: 'brevo_smtp', to: finalTo, subject: finalSubject, pdfSentAsLink: true, withCustomAttachment: !!req.file },
        relatedId: proposal.queryId,
      }
    });

    res.json({ success: true, message: 'Email sent successfully! PDF link included in email.' });
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

      // B. Reject all other pending proposals and clean up their orphaned itineraries
      // First, fetch the other pending proposals to get their itinerary IDs
      const otherPendingProposals = await tx.proposal.findMany({
        where: {
          queryId: proposal.queryId,
          id: { not: id },
          status: 'pending'
        },
        select: { id: true, itineraryId: true }
      });

      // Soft-delete/reject them
      await tx.proposal.updateMany({
        where: { 
          queryId: proposal.queryId,
          id: { not: id },
          status: 'pending'
        },
        data: { 
          status: 'rejected',
          deletedAt: new Date()
        }
      });

      // Clean up orphaned client working-copy itineraries from the rejected proposals
      for (const rejectedProp of otherPendingProposals) {
        if (!rejectedProp.itineraryId) continue;
        // Don't delete the confirmed proposal's itinerary!
        if (rejectedProp.itineraryId === proposal.itineraryId) continue;

        const linkedItinerary = await tx.itinerary.findUnique({
          where: { id: rejectedProp.itineraryId },
          select: { id: true, isTemplate: true, deletedAt: true }
        });

        if (linkedItinerary && !linkedItinerary.isTemplate && !linkedItinerary.deletedAt) {
          await tx.itinerary.update({
            where: { id: rejectedProp.itineraryId },
            data: { deletedAt: new Date() }
          });
        }
      }

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
// Triggering a fresh build with a blank commit
