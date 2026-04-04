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
  const safeInclusions = itinerary.inclusionsHtml || '';
  const safeExclusions = itinerary.exclusionsHtml || '';

  // SVG Divider Component (Reusable)
  const WOBBLY_DIVIDER = `<svg viewBox="0 0 100 2" width="100%" height="3" preserveAspectRatio="none" style="margin: 20px 0;"><path d="M0 1 Q 5 0, 10 1 T 20 1 T 30 1 T 40 1 T 50 1 T 60 1 T 70 1 T 80 1 T 90 1 T 100 1" stroke="#cbd5e1" stroke-width="0.5" fill="none" /></svg>`;
  
  // SVG Torn Edge component (Reusable)
  const TORN_WASHI_TAPE = (color = '#93c5fd', opacity = 0.4) => `
    <div style="position: absolute; width: 80px; height: 26px; z-index: 10; pointer-events: none;">
      <svg viewBox="0 0 80 26" width="100%" height="100%" preserveAspectRatio="none">
        <path d="M0 3 L5 0 L15 2 L25 0 L35 3 L45 0 L55 2 L65 0 L75 3 L80 1 L80 23 L75 26 L65 23 L55 26 L45 23 L35 26 L25 23 L15 26 L5 23 L0 25 Z" fill="${color}" fill-opacity="${opacity}" />
      </svg>
    </div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
        
        :root {
          --paper: #fcf9f2;
          --ink: #1e293b;
          --accent: #2563eb;
          --muted: #64748b;
          --blue-ink: #3b82f6;
        }

        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          color: var(--ink);
          background-color: #f1f5f9;
        }

        /* Handmade Paper Texture */
        .paper-bg {
          background-color: var(--paper);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
        }

        .page {
          width: 8.27in;
          margin: 0 auto;
          padding: 50px 60px;
          box-sizing: border-box;
          position: relative;
          min-height: 100vh;
        }

        .h-serif {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          margin: 0;
        }

        .font-handwriting {
          font-family: 'Caveat', cursive;
        }

        /* Marginalia - Notes in the margins */
        .marginalia {
          position: absolute;
          left: 15px;
          top: 150px;
          width: 80px;
          font-family: 'Caveat', cursive;
          color: var(--blue-ink);
          font-size: 14px;
          line-height: 1.1;
          transform: rotate(-12deg);
          opacity: 0.7;
          pointer-events: none;
        }

        /* Corner Ornament - Universal Cultural Motif */
        .corner-motif {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          opacity: 0.15;
          pointer-events: none;
        }

        /* Hero Section */
        .hero {
          position: relative;
          height: 400px;
          border-radius: 40px 10px 40px 10px; /* Irregular feel */
          overflow: hidden;
          margin-bottom: 50px;
          background: #334155;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
        }

        .hero img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2) 60%, transparent);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 50px;
          color: white;
        }

        .hero h1 { font-size: 54px; line-height: 1; margin-bottom: 10px; }

        /* Stamp Effect */
        .stamp {
          position: absolute;
          top: 50px;
          right: 60px;
          border: 3px solid rgba(37, 99, 235, 0.4);
          color: rgba(37, 99, 235, 0.4);
          padding: 8px 15px;
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 12px;
          text-transform: uppercase;
          transform: rotate(15deg);
          border-radius: 4px;
          letter-spacing: 2px;
          pointer-events: none;
        }

        /* Day Layout */
        .day-wrap { margin-bottom: 80px; page-break-inside: avoid; position: relative; }
        .day-row { display: flex; gap: 50px; align-items: flex-start; }
        .day-content { flex: 1; }
        .day-num-box { font-family: 'Caveat', cursive; font-size: 32px; color: var(--accent); margin-bottom: 2px; line-height: 1; }
        .day-title { font-family: 'Playfair Display', serif; font-size: 34px; margin-bottom: 10px; letter-spacing: -0.02em; }
        .day-desc { color: #4b5563; font-size: 15px; line-height: 1.8; margin-bottom: 30px; font-weight: 400; }

        .sketchy-border {
          border: 2px solid #334155;
          border-radius: 255px 15px 225px 15px/15px 225px 15px 255px; /* Organic/irregular radius */
        }

        .day-img-wrap {
          width: 330px;
          height: 420px;
          flex-shrink: 0;
          overflow: hidden;
          background: #f1f5f9;
          position: relative;
        }

        .day-img-wrap img { width: 100%; height: 100%; object-fit: cover; }

        .event-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 12px 18px;
          background: white;
          border-radius: 16px;
          margin-bottom: 12px;
          border: 1px solid #e2e8f0;
          position: relative;
        }

        /* Price Box */
        .price-box {
          margin-top: 80px;
          background: white;
          padding: 50px;
          border-radius: 30px;
          text-align: center;
          position: relative;
          page-break-inside: avoid;
          border: 1px dashed #cbd5e1;
        }

        .price-label { font-size: 15px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
        .price-amount { font-size: 52px; font-weight: 900; letter-spacing: -2px; }

        .policy-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
          margin-top: 100px; padding-top: 50px; border-top: 1px solid #e2e8f0;
        }
        
        .footer {
          margin-top: 120px; text-align: center; font-size: 11px; font-weight: 700;
          color: var(--muted); letter-spacing: 0.4em; opacity: 0.6;
        }
      </style>
    </head>
    <body class="paper-bg">
      <div class="page">
        <!-- Decoration & Marginalia -->
        <div class="corner-motif">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <path d="M20 10 Q 50 10, 50 50 T 80 90 M20 90 Q 50 90, 50 50 T 80 10" stroke-width="2" />
            <circle cx="50" cy="50" r="4" fill="currentColor" />
          </svg>
        </div>
        <div class="marginalia">“A journey of a thousand miles begins with a single step...”</div>
        <div class="stamp">Verified Proposal</div>

        <div class="hero">
          ${itinerary.coverPhotoUrl ? `<img src="${getSafeImageUrl(itinerary.coverPhotoUrl)}" />` : ''}
          <div class="hero-overlay">
            <div style="font-family: 'Caveat', cursive; font-size: 32px; color: #93c5fd; transform: rotate(-3deg); transform-origin: left; margin-bottom: 15px;">A uniquely crafted journey for you</div>
            <h1 class="h-serif">${escapeHtml(itinerary.title)}</h1>
            <div style="display: flex; gap: 20px; font-size: 14px; opacity: 0.9; margin-top: 10px; font-weight: 600;">
              <span>• ${itinerary.days?.length || 0} Days</span>
              <span>• ${itinerary.adults || 0} Adults ${itinerary.children ? `& ${itinerary.children} Children` : ''}</span>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin: 80px 0 60px;">
          <h2 class="h-serif" style="font-size: 42px;">The Experience</h2>
          <div style="width: 120px; height: 1px; background: #334155; margin: 15px auto;"></div>
        </div>

        ${(itinerary.days || []).map((day, idx) => `
          <div class="day-wrap">
            <div class="day-row" style="${idx % 2 !== 0 ? 'flex-direction: row-reverse;' : ''}">
              <div class="day-content">
                <div class="day-num-box">Day ${day.dayNumber}</div>
                <h3 class="day-title">${escapeHtml(day.title || `The heart of ${day.destination?.name || 'Nature'}`)}</h3>
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--accent); letter-spacing: 0.15em; margin-bottom: 25px;">${escapeHtml(day.destination?.name || 'Exploring Handcrafted Paths')}</div>
                
                <div class="day-desc">${escapeHtml(day.description || 'Welcome to a day of organic discovery. We have curated these experiences to bring you closer to the cultural heartbeat of the region, ensuring every moment feels personal and hand-picked.')}</div>
                
                ${WOBBLY_DIVIDER}
                
                <div style="margin-top: 25px;">
                  ${(day.events || []).filter(e => e.type !== 'accommodation').map(ev => `
                    <div class="event-item">
                      <div style="font-size: 20px; line-height: 1;">${EVENT_TYPE_ICONS[ev.type] || '•'}</div>
                      <div style="flex: 1;">
                        <div style="font-size: 14px; font-weight: 700; color: #1e293b;">${escapeHtml(ev.title)}</div>
                        ${ev.startTime ? `<div style="font-size: 10px; font-weight: 700; color: var(--muted); margin-top: 2px;">SCHEDULED: ${escapeHtml(ev.startTime)}</div>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div style="position: relative;">
                ${idx === 0 ? `
                  <div style="top: 10px; left: -20px; transform: rotate(-15deg);">${TORN_WASHI_TAPE('#fb7185', 0.5)}</div>
                  <div style="bottom: 10px; right: -20px; transform: rotate(15deg);">${TORN_WASHI_TAPE('#34d399', 0.5)}</div>
                ` : `
                  <div style="top: -15px; right: 10px; transform: rotate(35deg);">${TORN_WASHI_TAPE('#facc15', 0.5)}</div>
                `}
                <div class="day-img-wrap sketchy-border">
                  ${day.imageUrl ? `<img src="${getSafeImageUrl(day.imageUrl)}" />` : `<div style="width:100%; height:100%; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-family:'Caveat'; font-size:24px;">Captured Moments</div>`}
                </div>
              </div>
            </div>
          </div>
        `).join('')}

        <div class="price-box">
          <div style="top: -12px; left: 50%; transform: translateX(-50%); position: absolute;">${TORN_WASHI_TAPE('#60a5fa', 0.6)}</div>
          <div class="price-label">Our Curated Proposal</div>
          <div class="price-amount">₹${Number(itinerary.perPersonCost).toLocaleString('en-IN')} <span style="font-size: 18px; color: var(--muted); font-weight: 500;">/ PERSON</span></div>
          ${itinerary.totalCost ? `<div style="font-family: 'Caveat', cursive; font-size: 22px; color: var(--accent); margin-top: 15px; font-weight: 700;">Total Package: ₹${Number(itinerary.totalCost).toLocaleString('en-IN')}</div>` : ''}
        </div>

        <div class="policy-grid">
          <div class="policy-col">
            <h4 class="h-serif">Inclusions</h4>
            <div class="policy-content prose">${safeInclusions || 'Personally selected service inclusions.'}</div>
          </div>
          <div class="policy-col">
            <h4 class="h-serif">Exclusions</h4>
            <div class="policy-content prose">${safeExclusions || 'Personal expenditures.'}</div>
          </div>
        </div>

        <div class="footer">IMAGICA HOLIDAYS • CRAFTED WITH CARE</div>
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
