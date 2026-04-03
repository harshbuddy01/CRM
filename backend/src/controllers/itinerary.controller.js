// ============================================================
// TravelCRM — Itinerary Controller
// Maps HTTP requests to itinerary service methods
// ============================================================

const itineraryService = require('../services/itinerary.service');
const pdfService = require('../services/pdf.service');

// ── Itinerary CRUD ───────────────────────────────────────────

const create = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: itinerary });
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const result = await itineraryService.list({ search, status, page: Number(page) || 1, limit: Number(limit) || 50 });
    res.json({ success: true, data: result.items, total: result.total });
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
    res.json({ success: true, message: 'Itinerary deleted' });
  } catch (err) { next(err); }
};

const duplicate = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.duplicate(req.params.id, req.user.id);
    res.status(201).json({ success: true, data: itinerary });
  } catch (err) { next(err); }
};

// ── Image Uploads ────────────────────────────────────────────

const uploadCoverPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
    const itinerary = await itineraryService.uploadCoverPhoto(req.params.id, req.file);
    res.json({ success: true, data: itinerary });
  } catch (err) { next(err); }
};

const uploadGalleryImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided' });
    }
    const images = await itineraryService.addGalleryImages(req.params.id, req.files);
    res.status(201).json({ success: true, data: images });
  } catch (err) { next(err); }
};

const uploadGalleryByUrl = async (req, res, next) => {
  try {
    const { imageUrls } = req.body;
    if (!imageUrls || !Array.isArray(imageUrls)) return res.status(400).json({ success: false, message: 'Invalid payload' });
    await itineraryService.addGalleryImagesByUrl(req.params.id, imageUrls);
    res.status(201).json({ success: true, message: 'Images added to gallery' });
  } catch (err) { next(err); }
};

const removeGalleryImage = async (req, res, next) => {
  try {
    await itineraryService.removeGalleryImage(req.params.imageId);
    res.json({ success: true, message: 'Gallery image removed' });
  } catch (err) { next(err); }
};

const uploadEventImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
    const event = await itineraryService.uploadEventImage(req.params.eventId, req.file);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

// ── Day Management ───────────────────────────────────────────

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
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
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

// ── Event Management ─────────────────────────────────────────

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

// ── Share & Export ────────────────────────────────────────────

const generateShareLink = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.generateShareSlug(req.params.id);
    res.json({ success: true, data: { shareSlug: itinerary.shareSlug, itinerary } });
  } catch (err) { next(err); }
};

const getByShareSlug = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.getByShareSlug(req.params.slug);
    res.json({ success: true, data: itinerary });
  } catch (err) { next(err); }
};

const EVENT_TYPE_ICONS = {
  accommodation: '🏨',
  sightseeing: '🗺️',
  activity: '🎯',
  transport: '🚗',
  flight: '✈️',
  meal: '🍽️',
  checkin: '📋',
  checkout: '📋',
  freeTime: '☀️',
};

const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#x60;');
};

const sanitizeHtml = require('sanitize-html');

const getSafeImageUrl = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url, 'http://dummy');
    return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') ? encodeURI(url) : '';
  } catch(e) { return ''; }
};

const generateItineraryHtml = (itinerary) => {
  const totalDays = itinerary.days.length;
  const destinations = [...new Set(itinerary.days.map(d => d.destination?.name).filter(Boolean))].map(escapeHtml);
  const safeCoverUrl = getSafeImageUrl(itinerary.coverPhotoUrl);
  const safeInclusions = sanitizeHtml(itinerary.inclusionsHtml || '', { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']) });
  const safeExclusions = sanitizeHtml(itinerary.exclusionsHtml || '', { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']) });

  const accomEvents = (itinerary.days || []).flatMap(d => (d.events || []).filter(e => e.type === 'accommodation'));

  return `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Caveat:wght@400..700&display=swap');
        
        :root {
          --primary: #1e293b;
          --accent: #2563eb;
          --muted: #64748b;
          --bg: #ffffff;
          --border: #f1f5f9;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; }
        body { font-family: 'Inter', sans-serif; color: var(--primary); line-height: 1.6; background-color: #fdfbf7; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E"); font-size: 13px; min-height: 100vh; }
        .h-serif { font-family: 'Playfair Display', serif; }
        .h-handwriting { font-family: 'Caveat', cursive; }
        
        .container { padding: 40px; position: relative; }
        
        /* Handmade Elements */
        .sketchy-border {
          border: 2px solid #334155;
          border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
        }
        
        .washi-tape {
          position: absolute;
          width: 60px;
          height: 20px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(2px);
          transform: rotate(-3deg);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          z-index: 10;
        }
        .tape-tr { top: -5px; right: -15px; transform: rotate(35deg); }
        .tape-bl { bottom: -5px; left: -15px; transform: rotate(35deg); }

        /* Hero Section */
        .hero { position: relative; height: 380px; border-radius: 40px; overflow: hidden; margin-bottom: 50px; background: #000; border: 2px solid #334155; }
        .hero-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; }
        .hero-content { position: absolute; bottom: 40px; left: 40px; right: 40px; color: white; }
        .hero-title { font-size: 42px; font-weight: 800; margin-bottom: 10px; line-height: 1.1; font-family: 'Playfair Display', serif; }
        .hero-meta { display: flex; gap: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8; }

        /* Accommodation Section */
        .section-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; margin-top: 40px; }
        .section-header h2 { font-size: 32px; font-family: 'Caveat', cursive; white-space: nowrap; font-weight: 700; color: #1e293b; }
        .section-header .line { height: 2px; background: rgba(30, 41, 59, 0.1); width: 100%; border-bottom: 1px dashed rgba(30, 41, 59, 0.2); }

        .accom-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .accom-card { position: relative; border: none; background: white; border-radius: 32px; overflow: hidden; margin-bottom: 15px; page-break-inside: avoid; }
        .accom-img { width: 100%; height: 160px; object-fit: cover; background: #f8fafc; }
        .accom-body { padding: 15px; }
        .accom-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .accom-meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); border-top: 1px solid #f8fafc; padding-top: 10px; margin-top: 10px; }

        /* Day Itinerary Section */
        .day-wrap { margin-bottom: 50px; page-break-inside: avoid; }
        .day-row { display: flex; gap: 30px; align-items: flex-start; }
        .day-content { flex: 1; }
        .day-img-wrap { width: 250px; height: 320px; border-radius: 24px; overflow: hidden; flex-shrink: 0; background: #f8fafc; }
        .day-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        
        .day-num-box { position: relative; width: 45px; height: 45px; background: var(--primary); color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 20px; margin-bottom: 15px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .day-num-box::after { content: ''; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #fb7185; border-radius: 50%; border: 2px solid white; }
        .day-title { font-family: 'Caveat', cursive; font-size: 32px; line-height: 1.1; margin-bottom: 5px; color: #1e293b; font-weight: 700; }
        .day-subtitle { font-family: 'Caveat', cursive; font-size: 18px; color: #2563eb; margin-bottom: 15px; font-weight: 600; }
        .day-desc { font-size: 13px; color: var(--muted); margin-bottom: 20px; text-align: justify; line-height: 1.7; }

        .event-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 11px; font-weight: 600; color: #1e293b; background: rgba(248, 250, 252, 0.5); padding: 8px 14px; border-radius: 12px; border: 1px solid rgba(241, 245, 249, 0.8); }

        /* Pricing Section */
        .price-box { margin-top: 60px; text-align: center; background: white; border-radius: 40px; padding: 40px; page-break-inside: avoid; border: 2px solid #334155; position: relative; }
        .price-label { font-family: 'Caveat', cursive; font-size: 20px; font-weight: 700; text-transform: none; letter-spacing: 0; color: var(--muted); margin-bottom: 5px; }
        .price-amount { font-family: 'Playfair Display', serif; font-size: 42px; color: var(--primary); font-weight: 800; }

        /* Policy Section */
        .policy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; page-break-inside: avoid; }
        .policy-col h4 { font-family: 'Playfair Display', serif; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid var(--border); padding-bottom: 8px; }
        .policy-content { font-size: 11px; color: var(--muted); }

        .footer { margin-top: 80px; text-align: center; font-size: 10px; color: #94a3b8; letter-spacing: 0.05em; }
        
        @page { margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Hero -->
        <div class="hero">
          ${safeCoverUrl ? `<img class="hero-img" src="${safeCoverUrl}" />` : '<div class="hero-img" style="background: linear-gradient(to bottom, #1e293b, #0f172a)"></div>'}
          <div class="hero-content">
            <h1 class="hero-title">${escapeHtml(itinerary.title)}</h1>
            <div class="hero-meta">
              <span>📍 ${destinations.slice(0, 3).join(' • ') || 'Multiple Destinations'}</span>
              <span>📅 ${totalDays} Day Journey</span>
              <span>👥 ${escapeHtml(itinerary.adults)} Guests</span>
            </div>
          </div>
        </div>

        <!-- Accom Overview -->
        ${accomEvents.length > 0 ? `
          <div class="section-header">
            <h2 class="h-serif">Accommodations</h2>
            <div class="line"></div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
            ${(itinerary.days || []).flatMap(d => (d.events || []).filter(e => e.type === 'accommodation').map(ev => `
                <div class="accom-card sketchy-border">
                  <div class="washi-tape tape-tr" style="background: rgba(59, 130, 246, 0.2);"></div>
                  ${ev.imageUrl ? `<img class="accom-img" src="${getSafeImageUrl(ev.imageUrl)}" />` : '<div class="accom-img"></div>'}
                  <div class="accom-body">
                    <div class="accom-title">${escapeHtml(ev.metadata?.hotelName || ev.title)}</div>
                    <div style="font-family: 'Caveat', cursive; font-size: 14px; color: var(--accent); font-weight: 700; margin-bottom: 5px;">DAY ${d.dayNumber} • ${escapeHtml(ev.metadata?.category || 'Standard')}</div>
                    <div class="accom-meta">
                      <span>${escapeHtml(ev.metadata?.roomType || 'Standard Room')}</span>
                      <span>${escapeHtml(ev.metadata?.mealPlan || 'EP Plan')}</span>
                    </div>
                  </div>
                </div>
            `)).join('')}
          </div>
        ` : ''}

        <div class="section-header">
          <h2 class="h-serif">The Experience</h2>
          <div class="line"></div>
        </div>

        <!-- Day Stories -->
        ${(itinerary.days || []).map((day, idx) => `
          <div class="day-wrap">
            <div class="day-row" style="${idx % 2 !== 0 ? 'flex-direction: row-reverse;' : ''}">
              <div class="day-content">
                <div class="day-num-box">${day.dayNumber}</div>
                <h3 class="day-title">${escapeHtml(day.title || `Day ${day.dayNumber}: Introduction`)}</h3>
                <div class="day-subtitle">${escapeHtml(day.destination?.name || 'Exploring Nature')}</div>
                <div class="day-desc">${escapeHtml(day.description || 'Discover the hidden gems and breathtaking landscapes. This day is specially curated to provide an immersive experience into the local culture and natural beauty.')}</div>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                  ${(day.events || []).filter(e => e.type !== 'accommodation').map(ev => `
                    <div class="event-item">
                      <span style="font-size: 14px;">${EVENT_TYPE_ICONS[ev.type] || '•'}</span>
                      <span>${escapeHtml(ev.title)}</span>
                      ${ev.startTime ? `<span style="margin-left: auto; color: var(--muted); font-size: 9px;">${escapeHtml(ev.startTime)}</span>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="day-img-wrap sketchy-border" style="position: relative;">
                <div class="washi-tape tape-tr" style="background: rgba(251, 113, 133, 0.2);"></div>
                <div class="washi-tape tape-bl" style="background: rgba(52, 211, 153, 0.2);"></div>
                ${day.imageUrl ? `<img src="${getSafeImageUrl(day.imageUrl)}" />` : '<div style="width:100%; height:100%; background:#f1f5f9;"></div>'}
              </div>
            </div>
          </div>
        `).join('')}

        <!-- Policies -->
        <div class="policy-grid">
          <div class="policy-col">
            <h4 class="h-serif">Inclusions</h4>
            <div class="policy-content">${safeInclusions || 'Standard service inclusions apply.'}</div>
          </div>
          <div class="policy-col">
            <h4 class="h-serif">Exclusions</h4>
            <div class="policy-content">${safeExclusions || 'Personal expenses and tips excluded.'}</div>
          </div>
        </div>

        <!-- Pricing Summary -->
        ${itinerary.perPersonCost ? `
          <div class="price-box sketchy-border">
            <div class="washi-tape tape-tr" style="background: rgba(59, 130, 246, 0.3); width: 80px; height: 25px;"></div>
            <div class="price-label">Our Bespoke Proposal</div>
            <div class="price-amount">₹${Number(itinerary.perPersonCost).toLocaleString('en-IN')} <span style="font-size: 16px; color: var(--muted); font-weight: 400; font-family: 'Inter', sans-serif;">/ Person</span></div>
            ${itinerary.totalCost ? `<div style="font-family: 'Caveat', cursive; font-size: 16px; color: #2563eb; font-weight: 700; margin-top: 10px;">Total Package Value: ₹${Number(itinerary.totalCost).toLocaleString('en-IN')}</div>` : ''}
          </div>
        ` : ''}

        <div class="footer">
          CRAFTED BY TRAVELCRM • WWW.IMAGICAHOLIDAYS.COM
        </div>
      </div>
    </body>
    </html>
  `;
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
