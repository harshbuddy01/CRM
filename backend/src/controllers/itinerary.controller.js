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

const generateItineraryHtml = (itinerary) => {
  const totalDays = itinerary.days.length;
  const destinations = [...new Set(itinerary.days.map(d => d.destination?.name).filter(Boolean))].map(escapeHtml);
  let safeCoverUrl = '';
  if (itinerary.coverPhotoUrl) {
    try {
      // Adding a dummy base allows relative URLs or protocol-relative to parse (if intended), 
      // but typically coverPhotoUrl is absolute.
      const urlObj = new URL(itinerary.coverPhotoUrl, 'http://dummy');
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        safeCoverUrl = encodeURI(itinerary.coverPhotoUrl);
      }
    } catch(e) { }
  }

  return `
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; background: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; }
        .header { border-bottom: 3px solid #3b82f6; padding-bottom: 24px; margin-bottom: 32px; }
        .header h1 { font-size: 28px; font-weight: 700; color: #0f172a; }
        .header .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
        .meta-row { display: flex; gap: 24px; margin-top: 12px; font-size: 13px; color: #475569; }
        .meta-row span { display: flex; align-items: center; gap: 4px; }
        ${safeCoverUrl ? `.cover { width: 100%; height: 250px; object-fit: cover; border-radius: 12px; margin-bottom: 32px; }` : ''}
        .price-box { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #93c5fd; border-radius: 12px; padding: 16px 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; }
        .price-box .amount { font-size: 24px; font-weight: 700; color: #1e40af; }
        .price-box .label { font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .day-card { border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px; overflow: hidden; }
        .day-header { background: #f1f5f9; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .day-header h3 { font-size: 16px; font-weight: 600; color: #0f172a; }
        .day-header .dest { font-size: 12px; color: #3b82f6; background: #eff6ff; padding: 2px 10px; border-radius: 99px; font-weight: 500; }
        .event { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; display: flex; gap: 14px; align-items: flex-start; }
        .event:last-child { border-bottom: none; }
        .event-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
        .event-content { flex: 1; }
        .event-title { font-weight: 600; font-size: 14px; color: #1e293b; }
        .event-desc { font-size: 13px; color: #64748b; margin-top: 2px; }
        .event-meta { font-size: 11px; color: #94a3b8; margin-top: 4px; display: flex; gap: 12px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${escapeHtml(itinerary.title)}</h1>
          ${itinerary.description ? `<div class="subtitle">${escapeHtml(itinerary.description)}</div>` : ''}
          <div class="meta-row">
            <span>📅 ${totalDays} Days</span>
            <span>📍 ${destinations.join(', ') || 'Multiple Destinations'}</span>
            <span>👥 ${escapeHtml(itinerary.adults)} Adults${itinerary.children ? `, ${escapeHtml(itinerary.children)} Children` : ''}</span>
          </div>
        </div>

        ${safeCoverUrl ? `<img class="cover" src="${safeCoverUrl}" alt="Cover" />` : ''}

        ${itinerary.perPersonCost ? `
          <div class="price-box">
            <div>
              <div class="label">Package Price Per Person</div>
              <div class="amount">₹${Number(itinerary.perPersonCost).toLocaleString('en-IN')}</div>
            </div>
            ${itinerary.totalCost ? `
              <div style="text-align: right;">
                <div class="label">Total Package</div>
                <div class="amount" style="font-size: 18px;">₹${Number(itinerary.totalCost).toLocaleString('en-IN')}</div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <h2 style="font-size: 20px; margin-bottom: 16px; color: #0f172a;">Day-by-Day Itinerary</h2>

        ${itinerary.days.map(day => `
          <div class="day-card">
            <div class="day-header">
              <h3>Day ${day.dayNumber}${day.title ? `: ${escapeHtml(day.title)}` : ''}</h3>
              ${day.destination?.name ? `<span class="dest">${escapeHtml(day.destination.name)}</span>` : ''}
            </div>
            ${day.events.length > 0 ? day.events.map(ev => `
              <div class="event">
                <div class="event-icon">${EVENT_TYPE_ICONS[ev.type] || '📌'}</div>
                <div class="event-content">
                  <div class="event-title">${escapeHtml(ev.title)}</div>
                  ${ev.description ? `<div class="event-desc">${escapeHtml(ev.description)}</div>` : ''}
                  <div class="event-meta">
                    ${ev.startTime ? `<span>🕐 ${escapeHtml(ev.startTime)}${ev.endTime ? ` – ${escapeHtml(ev.endTime)}` : ''}</span>` : ''}
                    ${ev.cost ? `<span>💰 ₹${Number(ev.cost).toLocaleString('en-IN')}</span>` : ''}
                    <span style="text-transform: capitalize;">${escapeHtml(ev.type)}</span>
                  </div>
                </div>
              </div>
            `).join('') : `
              <div class="event">
                <div class="event-icon">📌</div>
                <div class="event-content">
                  <div class="event-desc" style="color: #94a3b8;">No events planned for this day</div>
                </div>
              </div>
            `}
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
  removeGalleryImage,
  uploadEventImage,
  addDay,
  updateDay,
  removeDay,
  addEvent,
  updateEvent,
  removeEvent,
  reorderEvents,
  generateShareLink,
  getByShareSlug,
  exportPdf,
};
