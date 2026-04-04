// ============================================================
// TravelCRM — Itinerary Controller
// Handcrafted Proposal PDF Generation + CRUD
// ============================================================

const itineraryService = require('../services/itinerary.service');
const pdfService = require('../services/pdf.service');

// Constants for icons and UI
const EVENT_TYPE_ICONS = {
  accommodation: '🏨',
  sightseeing: '🗾',
  activity: '🧭',
  transport: '🚗',
  flight: '✈️',
  meal: '🍴',
  checkin: '🔑',
  checkout: '👋',
  freeTime: '☀️',
};

/**
 * Escapes HTML characters to prevent injection in the template string.
 */
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Helper to get a safe image URL for PDF rendering.
 */
const getSafeImageUrl = (url) => {
  if (!url) return '';
  // Ensure protocol is present
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

/**
 * Generates the full HTML for the premium handcrafted itinerary PDF.
 */
const generateItineraryHtml = (itinerary) => {
  const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  
  const days = itinerary?.days || [];
  const totalDays = days.length;
  const destinations = [...new Set(days.map(d => d.destination?.name).filter(Boolean))].join(', ') || 'Your Journey';
  const gallery = itinerary?.galleryImages || [];

  const EVENT_ICONS = {
    accommodation: '🏨', sightseeing: '🗻', activity: '🧭', transport: '🚗',
    flight: '✈️', meal: '🍴', checkin: '🔑', checkout: '👋', freeTime: '☀️',
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Travel Itinerary - ${escapeHtml(itinerary?.title || 'Draft')}</title>
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
          }
          
          /* Handcrafted Border */
          .page-border {
            position: fixed;
            top: 20px; left: 20px; right: 20px; bottom: 20px;
            border: 2px solid #d4af37;
            pointer-events: none;
            z-index: 100;
          }
          .page-border::after {
            content: '';
            position: absolute;
            top: 5px; left: 5px; right: 5px; bottom: 5px;
            border: 1px solid #d4af37;
            opacity: 0.5;
          }

          h1, h2, h3 { font-family: 'Playfair Display', serif; color: #1a1a1a; margin: 0; }
          .handwritten { font-family: 'Dancing Script', cursive; color: #8b6e4b; }

          /* Hero Section */
          .hero { position: relative; height: 600px; width: 100%; overflow: hidden; background: #2c2c2c; }
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
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; 
            padding: 40px 60px; 
            background: #fff;
            border-bottom: 1px solid #eee;
          }
          .info-item .label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #a1a1a1; margin-bottom: 5px; }
          .info-item .value { font-size: 18px; font-weight: 700; color: #1a1a1a; font-family: 'Playfair Display', serif; }

          /* Sections */
          .content-wrap { padding: 40px 60px; }
          .section-heading { 
            text-align: center; 
            margin-bottom: 40px; 
            position: relative; 
          }
          .section-heading h2 { font-size: 36px; margin-bottom: 10px; font-style: italic; }
          .section-divider { 
            width: 150px; height: 1px; background: #d4af37; margin: 0 auto; 
            position: relative;
          }
          .section-divider::after {
            content: '❦';
            position: absolute;
            top: -10px; left: 50%;
            transform: translateX(-50%);
            background: #fdfbf7;
            padding: 0 10px;
            color: #d4af37;
            font-size: 16px;
          }

          /* Day Layout */
          .day-entry { margin-bottom: 60px; break-inside: avoid; }
          .day-title-wrap { display: flex; align-items: baseline; gap: 15px; margin-bottom: 20px; }
          .day-number { font-size: 24px; color: #d4af37; font-weight: 900; }
          .day-content { display: flex; gap: 30px; }
          .day-text { flex: 1; }
          .day-photo { width: 45%; flex-shrink: 0; }
          .day-photo img { width: 100%; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 8px solid white; }
          
          .day-description { font-size: 18px; line-height: 1.8; color: #444; margin-bottom: 20px; text-align: justify; }
          
          .event-item { 
            padding: 12px 0; 
            border-bottom: 1px solid #f0f0f0; 
            display: flex; 
            gap: 15px; 
            align-items: flex-start;
          }
          .event-symbol { font-size: 20px; }
          .event-info h4 { font-size: 16px; margin: 0; font-weight: 700; color: #1a1a1a; }
          .event-info p { font-size: 14px; color: #666; margin: 2px 0 0; }

          /* Pricing & Policy */
          .price-scroll {
            margin: 40px 0;
            padding: 40px;
            background: white;
            border: 1px solid #eee;
            text-align: center;
            box-shadow: inset 0 0 50px rgba(212, 175, 55, 0.05);
          }
          .price-scroll h3 { font-size: 22px; color: #8b6e4b; margin-bottom: 10px; font-style: italic; }
          .grand-total { font-size: 48px; font-weight: 900; color: #1a1a1a; font-family: 'Playfair Display', serif; }

          .policy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
          .policy-card h4 { font-size: 18px; margin-bottom: 10px; color: #d4af37; font-style: italic; }
          .policy-card { font-size: 14px; line-height: 1.6; color: #555; }

          /* Gallery Masonry */
          .gallery-section { margin-top: 60px; }
          .gallery-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .gallery-item { height: 200px; border-radius: 4px; overflow: hidden; }
          .gallery-item img { width: 100%; height: 100%; object-fit: cover; }

          .footer { text-align: center; padding: 60px 0; border-top: 1px solid #eee; margin-top: 60px; }
          .footer p { font-family: 'Dancing Script', cursive; font-size: 24px; color: #8b6e4b; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="page-border"></div>

          <div class="hero">
            ${itinerary?.coverPhotoUrl ? `<img src="${getSafeImageUrl(itinerary.coverPhotoUrl)}" alt="Cover" />` : ''}
            <div class="hero-overlay">
              <span class="hero-badge">A Curated Journey</span>
              <h1>${escapeHtml(itinerary?.title || 'Handcrafted Itinerary')}</h1>
              <div class="hero-meta">
                <span>${totalDays} Days of Discovery</span>
                <span>❦</span>
                <span>Created carefully for you</span>
              </div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="label">Traveling Party</div>
              <div class="value">${itinerary?.adults || 0} Adults${itinerary?.children ? `, ${itinerary.children} Kids` : ''}</div>
            </div>
            <div class="info-item">
              <div class="label">Destinations</div>
              <div class="value">${escapeHtml(destinations)}</div>
            </div>
            <div class="info-item">
              <div class="label">Duration</div>
              <div class="value">${totalDays} Days</div>
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
              const dayImage = day.imageUrl; // Only use explicitly uploaded day images for the side panel
              
              return `
              <div class="day-entry">
                <div class="day-title-wrap">
                  <span class="day-number">Day ${day.dayNumber}</span>
                  <h3>${escapeHtml(day.title || 'In Search of Magic')}</h3>
                </div>
                <div class="day-content">
                  <div class="day-text">
                    ${day.description ? `<div class="day-description">${escapeHtml(day.description).replace(/\n/g, '<br/>')}</div>` : ''}
                    
                    <div class="events-list">
                      ${events.map(ev => `
                        <div class="event-item" style="flex-wrap: wrap;">
                          <span class="event-symbol">${EVENT_ICONS[ev.type] || '•'}</span>
                          <div class="event-info" style="flex: 1; min-width: 200px;">
                            <h4>${escapeHtml(ev.title)}</h4>
                            <p>${ev.type === 'accommodation' && ev.metadata?.hotelName ? `<strong>Staying at ${escapeHtml(ev.metadata.hotelName)}</strong>` : ''}</p>
                            ${ev.description ? `<p>${escapeHtml(ev.description).replace(/\n/g, '<br/>')}</p>` : ''}
                            ${ev.startTime ? `<p class="handwritten" style="font-size: 16px; margin-top: 5px;">Scheduled for ${escapeHtml(ev.startTime)}</p>` : ''}
                          </div>
                          ${ev.imageUrl ? `
                            <div style="width: 100%; margin-top: 10px; padding-left: 35px;">
                              <img src="${getSafeImageUrl(ev.imageUrl)}" alt="Event Photo" style="max-height: 150px; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 2px solid white;" />
                            </div>
                          ` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  ${dayImage ? `
                    <div class="day-photo">
                      <img src="${getSafeImageUrl(dayImage)}" alt="Scene" />
                    </div>
                  ` : ''}
                </div>
              </div>
              `;
            }).join('') || '<p class="handwritten" style="text-align: center; font-size: 28px;">Your custom journey awaits...</p>'}

            ${(itinerary?.sellingPrice || itinerary?.totalCost || itinerary?.perPersonCost) ? `
            <div class="price-scroll">
              <h3 class="handwritten">The Investment</h3>
              <div class="grand-total">₹${Number(itinerary?.sellingPrice || itinerary?.totalCost || 0).toLocaleString('en-IN')}</div>
              ${itinerary?.perPersonCost ? `<p class="handwritten" style="font-size: 20px; margin-top: 10px;">Offering at ₹${Number(itinerary.perPersonCost).toLocaleString('en-IN')} per person</p>` : ''}
            </div>
            ` : ''}

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
              <p>Handcrafted with passion</p>
              <div style="font-size: 12px; letter-spacing: 0.1em; color: #aaa; margin-top: 10px;">WWW.IMAGICAHOLIDAYS.COM</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// ── Core CRUD ──────────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const data = req.body;
    const itinerary = await itineraryService.create(req.user.id, data);
    res.status(201).json({ success: true, data: itinerary });
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const { items, total } = await itineraryService.list(req.query);
    res.json({ success: true, data: items, total });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.getById(req.params.id);
    res.json({ success: true, data: itinerary });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.update(req.params.id, req.body);
    res.json({ success: true, data: itinerary });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await itineraryService.remove(req.params.id);
    res.json({ success: true, message: 'Itinerary removed' });
  } catch (err) { next(err); }
};

const duplicate = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.duplicate(req.params.id, req.user.id);
    res.status(201).json({ success: true, data: itinerary });
  } catch (err) { next(err); }
};

const publishToTemplates = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.publishToTemplates(req.params.id, req.user.id);
    res.status(201).json({ success: true, data: itinerary, message: "Saved as a new Master Template" });
  } catch (err) { next(err); }
};

// ── Specialized UI Actions ───────────────────────────────────

const uploadCoverPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    const itinerary = await itineraryService.uploadCoverPhoto(req.params.id, req.file);
    res.json({ success: true, data: itinerary });
  } catch (err) { next(err); }
};

const uploadGalleryImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No images provided' });
    const images = await itineraryService.addGalleryImages(req.params.id, req.files);
    res.json({ success: true, data: images });
  } catch (err) { next(err); }
};

const uploadGalleryByUrl = async (req, res, next) => {
  try {
    const results = await itineraryService.addGalleryImagesByUrl(req.params.id, req.body.imageUrls);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};

const removeGalleryImage = async (req, res, next) => {
  try {
    await itineraryService.removeGalleryImage(req.params.imageId);
    res.json({ success: true, message: 'Removed from gallery' });
  } catch (err) { next(err); }
};

const uploadEventImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    const event = await itineraryService.uploadEventImage(req.params.eventId, req.file);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

// ── Day/Event Management ─────────────────────────────────────

const addDay = async (req, res, next) => {
  try {
    const day = await itineraryService.addDay(req.params.id, req.body);
    res.status(201).json({ success: true, data: day });
  } catch (err) { next(err); }
};

const updateDay = async (req, res, next) => {
  try {
    const day = await itineraryService.updateDay(req.params.dayId, req.body);
    res.json({ success: true, data: day });
  } catch (err) { next(err); }
};

const uploadDayImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    const day = await itineraryService.uploadDayImage(req.params.dayId, req.file);
    res.json({ success: true, data: day });
  } catch (err) { next(err); }
};

const removeDay = async (req, res, next) => {
  try {
    await itineraryService.removeDay(req.params.dayId);
    res.json({ success: true, message: 'Day removed' });
  } catch (err) { next(err); }
};

const addEvent = async (req, res, next) => {
  try {
    const event = await itineraryService.addEvent(req.params.dayId, req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await itineraryService.updateEvent(req.params.eventId, req.body);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

const removeEvent = async (req, res, next) => {
  try {
    await itineraryService.removeEvent(req.params.eventId);
    res.json({ success: true, message: 'Event removed' });
  } catch (err) { next(err); }
};

const reorderEvents = async (req, res, next) => {
  try {
    const events = await itineraryService.reorderEvents(req.params.dayId, req.body.eventIds);
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

// ── Export/Share ─────────────────────────────────────────────

const generateShareLink = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.generateShareSlug(req.params.id);
    res.json({ success: true, data: itinerary });
  } catch (err) { next(err); }
};

const getByShareSlug = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.getByShareSlug(req.params.slug);
    res.json({ success: true, data: itinerary });
  } catch (err) {
    console.error(`[ItineraryShareError] Slug: ${req.params.slug}`, err);
    next(err);
  }
};

const exportPdf = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.getExportData(req.params.id);
    const html = generateItineraryHtml(itinerary);
    const pdfBuffer = await pdfService.generatePdfFromHtml(html);
    const buffer = Buffer.from(pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Itinerary-${itinerary.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    );
    res.end(buffer);
  } catch (err) {
    console.error('Itinerary PDF Error:', err);
    next(err);
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  duplicate,
  publishToTemplates,
  uploadCoverPhoto,
  uploadGalleryImages,
  uploadGalleryByUrl,
  removeGalleryImage,
  uploadEventImage,
  addDay,
  updateDay,
  uploadDayImage,
  removeDay,
  addEvent,
  updateEvent,
  removeEvent,
  reorderEvents,
  generateShareLink,
  getByShareSlug,
  exportPdf,
};
