// ============================================================
// TravelCRM — Itinerary Controller
// Handcrafted Proposal PDF Generation + CRUD
// ============================================================

const itineraryService = require('../services/itinerary.service');
const pdfService = require('../services/pdf.service');
const orgSettingService = require('../services/org-setting.service');
const fs = require('fs');
const path = require('path');

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

const getSafeImageUrl = (url) => {
  if (!url) return '';
  // Ensure protocol is present and secure
  let processedUrl = url.startsWith('//') ? `https:${url}` : url;
  if (processedUrl.startsWith('http://')) {
    processedUrl = processedUrl.replace('http://', 'https://');
  }
  return processedUrl;
};

const loadCoverImageBase64 = () => {
  try {
    const filePath = path.join(__dirname, '../assets/cover-train.jpg');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      return `data:image/jpeg;base64,${data.toString('base64')}`;
    }
  } catch (err) {
    console.error('Failed to load default cover train image:', err);
  }
  return '';
};

/**
 * Generates the full HTML for the premium handcrafted itinerary PDF.
 */
const generateItineraryHtml = (itinerary, settings = {}) => {
  const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  
  const days = itinerary?.days || [];
  const totalDays = days.length;
  const destinations = [...new Set(days.map(d => d.destination?.name).filter(Boolean))].join(' & ') || 'Sikkim & Darjeeling';
  const gallery = itinerary?.galleryImages || [];

  const fromDate = itinerary?.travelDateFrom;
  const toDate = itinerary?.travelDateTo;
  let dateString = 'Season TBD';
  let computedTotalDays = totalDays;
  if (fromDate && toDate) {
    const fromStr = new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const toStr = new Date(toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    dateString = `${fromStr} - ${toStr}`;
    const diffTime = Math.abs(new Date(toDate).getTime() - new Date(fromDate).getTime());
    computedTotalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  const rawGuestName = itinerary.proposals?.[0]?.query?.name || '';
  const guestName = (!rawGuestName || rawGuestName.toLowerCase() === 'harsh' || rawGuestName.toLowerCase() === 'harsh anand' || rawGuestName.toLowerCase() === 'draft')
    ? 'Sir/Madam'
    : rawGuestName;

  let titleFallback = itinerary?.title || '';
  if (!titleFallback || titleFallback.toLowerCase() === 'draft' || titleFallback.toLowerCase() === 'harsh' || titleFallback.toLowerCase() === guestName.toLowerCase()) {
    titleFallback = destinations || 'SIKKIM & DARJEELING';
  }

  let subtitleFallback = itinerary?.description || '';
  if (!subtitleFallback || subtitleFallback.toLowerCase() === 'draft' || subtitleFallback.toLowerCase() === 'harsh' || subtitleFallback.toLowerCase() === guestName.toLowerCase()) {
    subtitleFallback = 'Tea Gardens • Mountain Magic • Himalayan Escapes';
  }

  // --- Dynamic settings values ---
  const companyLogo = settings.companyLogoUrl || '';
  const companyName = settings.companyName || 'Imagica Holidays';
  const companyPhone = settings.companyPhone || '+91 89107 59374';
  const companyEmail = settings.companyEmail || 'info.imagicaholidays@gmail.com';
  const companyWeb = settings.companyWebsite || 'imagicaholidays.com';
  const companySlogan = settings.companySlogan || 'CURATED JOURNEYS. LASTING MEMORIES.';

  // Custom PDF customization settings
  const pdfCoverPhoto = settings.pdfCoverPhoto || '';
  const pdfHeaderBanner = settings.pdfHeaderBanner || '';
  const pdfWatermark = settings.pdfWatermark || '';
  const pdfBottomSilhouette = settings.pdfBottomSilhouette || '';
  const pdfThemeColor = settings.pdfThemeColor || '#0f3d2f';
  const pdfAccentColor = settings.pdfAccentColor || '#d4af37';

  // Canva Background Template customization settings
  const pdfUseCanvaBackground = settings.pdfUseCanvaBackground === 'true';
  const pdfCanvaCover = settings.pdfCanvaCover || '';
  const pdfCanvaInner = settings.pdfCanvaInner || '';
  const pdfCoverOverlayTop = settings.pdfCoverOverlayTop || '130mm';
  const pdfPagePaddingTop = settings.pdfPagePaddingTop || '38mm';
  const pdfPagePaddingBottom = settings.pdfPagePaddingBottom || '20mm';
  const pdfPagePaddingLeft = settings.pdfPagePaddingLeft || '15mm';
  const pdfPagePaddingRight = settings.pdfPagePaddingRight || '15mm';

  // --- Dynamic Consultant ---
  const consultantName = itinerary.creator?.name || 'Anish Sharma';
  const consultantInitial = consultantName.charAt(0).toUpperCase();

  // --- Inline SVG Icons (Puppeteer-safe, replaces emojis that fail on Linux) ---
  const svgCalendar = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
  const svgClock = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  const svgUsers = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
  const svgTicket = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>`;
  const svgMountain = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 2 4 5 10H0L8 3z"/></svg>`;
  const svgMapPin = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="1.5" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const svgFamily = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
  const svgFood = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`;
  const svgCar = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
  const svgTrain = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="8" cy="15" r="1" fill="white"/><circle cx="16" cy="15" r="1" fill="white"/></svg>`;
  const svgPlane = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;
  const svgRuler = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/></svg>`;
  const svgHotel = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/><path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"/><path d="M8 7h.01"/><path d="M16 7h.01"/><path d="M12 7h.01"/></svg>`;
  const svgStar = `<svg width="10" height="10" viewBox="0 0 24 24" fill="${pdfAccentColor}" stroke="${pdfAccentColor}" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const svgGlobe = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
  const svgPhone = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
  const svgMail = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
  const svgLeaf = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 1 8-1 3.5-3.5 6-7.5 8"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
  const svgCheckCircle = `<svg width="10" height="10" viewBox="0 0 24 24" fill="${pdfThemeColor}" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="17 8 10 16 7 13"/></svg>`;
  const svgXCircle = `<svg width="10" height="10" viewBox="0 0 24 24" fill="#5c1d1d" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  const svgDocument = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
  const svgShield = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  const svgCreditCard = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`;
  const svgCamera = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${pdfAccentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
  const svgBus = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>`;

  const defaultCoverBase64 = loadCoverImageBase64();
  const standardFooterHtml = `
  <div class="page-footer">
    <svg viewBox="0 0 800 80" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;">
      <path d="M 0 40 Q 400 10 800 40 L 800 80 L 0 80 Z" fill="var(--pdf-primary)" />
      <path d="M 0 40 Q 400 10 800 40" stroke="var(--pdf-accent)" stroke-width="2.5" fill="none" />
    </svg>
    <div style="position: relative; z-index: 5; display: flex; justify-content: space-between; align-items: center; width: 100%; font-family: 'Montserrat', sans-serif; font-size: 8px; color: white; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 5mm;">
      <span style="display: flex; align-items: center; gap: 4px;">${svgGlobe} ${escapeHtml(companyWeb)}</span>
      <span style="display: flex; align-items: center; gap: 4px;">${svgPhone} ${escapeHtml(companyPhone)}</span>
      <span style="display: flex; align-items: center; gap: 4px;">${svgMail} ${escapeHtml(companyEmail)}</span>
    </div>
  </div>
  `;
  const coverImageUrl = itinerary.coverPhotoUrl 
    ? getSafeImageUrl(itinerary.coverPhotoUrl) 
    : (defaultCoverBase64 || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop');

  const getItineraryImages = () => {
    const images = [];
    // Priority 1: User-uploaded gallery images (explicit, no car/hotel event photos)
    if (gallery && gallery.length > 0) {
      gallery.forEach(g => {
        if (g.imageUrl) images.push(getSafeImageUrl(g.imageUrl));
      });
    }
    // Priority 2: Day hero images (not event images which include cars/hotels)
    if (images.length < 5) {
      days.forEach((day) => {
        if (day.imageUrl && images.length < 5) images.push(getSafeImageUrl(day.imageUrl));
      });
    }
    // Priority 3: Cover photo
    if (images.length < 5 && itinerary.coverPhotoUrl) {
      images.push(getSafeImageUrl(itinerary.coverPhotoUrl));
    }
    // Fallback: Himalayan stock photos
    const fallbacks = [
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop'
    ];
    let fi = 0;
    while (images.length < 5) {
      images.push(fallbacks[fi % fallbacks.length]);
      fi++;
    }
    return images.slice(0, 5);
  };

  const gridImages = getItineraryImages();

  const stays = [];
  days.forEach((day) => {
    const events = day.events || [];
    events.forEach((ev) => {
      if (ev.type === 'accommodation') {
        stays.push({ 
          ...ev, 
          dayNumber: day.dayNumber,
          destination: day.destination?.name || 'Sikkim'
        });
      }
    });
  });

  const trans = [];
  days.forEach((day) => {
    const events = day.events || [];
    events.forEach((ev) => {
      if (ev.type === 'transport' || ev.type === 'flight') {
        trans.push({ 
          ...ev, 
          dayNumber: day.dayNumber,
          destination: day.destination?.name || 'Sikkim'
        });
      }
    });
  });

  let transportList = [...trans];
  if (transportList.length === 0) {
    days.forEach((day) => {
      const dest = day.destination?.name || 'Destination';
      let desc = '';
      if (day.dayNumber === 1) {
        desc = `Arrival at airport/station and scenic transfer to your hotel in ${dest} via Private SUV. Check-in and relax.`;
      } else if (day.dayNumber === totalDays) {
        desc = `Check-out from hotel and private transfer to airport/station for departure from ${dest}.`;
      } else {
        desc = `Enjoy sightseeing and intercity transfer in and around ${dest} in your private SUV.`;
      }
      transportList.push({
        dayNumber: day.dayNumber,
        title: `Day ${day.dayNumber} - Private Transit`,
        description: desc,
      });
    });
  }

  const sellingPrice = itinerary.sellingPrice ? Number(itinerary.sellingPrice) : null;

  const dayFallbacks = [
    'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800&auto=format&fit=crop', // Himalayas
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop', // Tea garden
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop', // Sikkim
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop', // Darjeeling
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop', // Valley
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop', // Mountains
  ];

  const getDayMetadata = (day) => {
    let distance = '';
    let duration = '';
    let stay = day.destination?.name || 'TBD';
    let transfer = 'Private SUV';
    
    const events = day.events || [];
    events.forEach(ev => {
      if (ev.type === 'accommodation' && ev.metadata?.hotelName) {
        stay = ev.metadata.hotelName;
      }
      if (ev.metadata?.distance) distance = ev.metadata.distance;
      if (ev.metadata?.duration) duration = ev.metadata.duration;
      if (ev.metadata?.transfer) transfer = ev.metadata.transfer;
    });
    
    if (!distance) distance = 'As per route';
    if (!duration) duration = 'Scenic drive';
    
    return { distance, duration, transfer, stay };
  };

  let staysHtml = '';
  // (Not used directly in page rendering now, stays are embedded inline on Page 2 welcome summary)

  let daysHtml = '';
  days.forEach((day, index) => {
    const dayMeta = getDayMetadata(day);
    const dayDateStr = fromDate 
      ? new Date(new Date(fromDate).getTime() + (day.dayNumber - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : `Day ${day.dayNumber}`;

    // Get 3 images for the collage:
    const collageImg1 = day.imageUrl ? getSafeImageUrl(day.imageUrl) : dayFallbacks[index % dayFallbacks.length];
    const collageImg2 = gallery[(index * 2) % gallery.length]?.imageUrl ? getSafeImageUrl(gallery[(index * 2) % gallery.length].imageUrl) : dayFallbacks[(index + 1) % dayFallbacks.length];
    const collageImg3 = gallery[(index * 2 + 1) % gallery.length]?.imageUrl ? getSafeImageUrl(gallery[(index * 2 + 1) % gallery.length].imageUrl) : dayFallbacks[(index + 2) % dayFallbacks.length];

    // Check ordinal prefix for day number (e.g. 1st, 2nd, 3rd, 4th...)
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const dayOrdinal = getOrdinal(day.dayNumber);

    daysHtml += `
    <!-- DAY ${day.dayNumber} ITINERARY PAGE -->
    <div class="page">
      <!-- Curved Top Header -->
      <div class="page-header" style="height: 34mm;">
        <svg viewBox="0 0 800 130" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;">
          <path d="M 0 0 L 800 0 L 800 115 Q 400 95 0 115 Z" fill="white" />
          <path d="M 0 115 Q 400 95 800 115" stroke="${pdfAccentColor}" stroke-width="2" fill="none" />
        </svg>
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 4mm;">
          ${companyLogo ? `<img src="${getSafeImageUrl(companyLogo)}" alt="Logo" style="height: 12mm; max-width: 30mm; object-fit: contain;" />` : `<div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: var(--pdf-primary); border: 2px solid var(--pdf-accent); padding: 2px 6px;">IH</div>`}
          <div style="display: flex; flex-direction: column;">
            <span style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(companyName)}</span>
            <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(companySlogan)}</span>
          </div>
        </div>
        <div style="text-align: right; margin-top: 5mm;">
          <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(destinations)}</span>
          <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-style: italic; color: var(--pdf-accent); display: block; margin-top: 2px;">${computedTotalDays} Days / ${Math.max(1, computedTotalDays - 1)} Nights</span>
        </div>
      </div>

      <!-- Horizontal Illustration Banner -->
      <div style="height: 25mm; width: 100%; margin-top: 10mm; border-radius: 6px; border: 1.5px solid var(--pdf-accent); background-image: url('${pdfHeaderBanner || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800'}'); background-size: cover; background-position: center; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      </div>

      <!-- Content -->
      <div class="page-content" style="margin-top: 4mm; position: relative; display: flex; flex-direction: column;">
        <!-- Day and Date Info Section -->
        <div style="display: flex; gap: 15px; align-items: flex-start; margin-bottom: 3mm; text-align: left;">
          <!-- Day Badge Ribbon -->
          <div style="width: 20mm; height: 18mm; background: var(--pdf-primary); border: 1.5px solid var(--pdf-accent); border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; flex-shrink: 0; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <span style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 800; line-height: 1;">${dayOrdinal}</span>
            <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 700; text-transform: uppercase; color: var(--pdf-accent); letter-spacing: 0.5px; margin-top: 2px;">Day</span>
          </div>
          
          <div>
            <span style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              ${svgCalendar} <span>${dayDateStr}</span>
            </span>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--pdf-primary); margin: 0 0 2px 0; line-height: 1.25;">
              ${escapeHtml(day.title || 'Sightseeing & Leisure')}
            </h3>
            <span style="font-family: 'EB Garamond', serif; font-size: 10px; color: #666; font-style: italic; display: block; display: flex; align-items: center; gap: 6px;">
              ${svgMapPin} Approx Distance: ${escapeHtml(dayMeta.distance)} &bull; Est. Travel Time: ${escapeHtml(dayMeta.duration)}
            </span>
          </div>
        </div>

        <!-- 3-Photo Collage Grid -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 10px; height: 50mm; margin-bottom: 4mm;">
          <!-- Left Large Photo -->
          <div style="background-image: url('${collageImg1}'); background-size: cover; background-position: center; border-radius: 6px; border: 1.5px solid #efe4d2; box-shadow: 0 2px 8px rgba(0,0,0,0.02);"></div>
          <!-- Right Two Small Stacked Photos -->
          <div style="display: flex; flex-direction: column; gap: 10px; height: 100%;">
            <div style="height: calc(50% - 5px); background-image: url('${collageImg2}'); background-size: cover; background-position: center; border-radius: 6px; border: 1.5px solid #efe4d2; box-shadow: 0 2px 8px rgba(0,0,0,0.02);"></div>
            <div style="height: calc(50% - 5px); background-image: url('${collageImg3}'); background-size: cover; background-position: center; border-radius: 6px; border: 1.5px solid #efe4d2; box-shadow: 0 2px 8px rgba(0,0,0,0.02);"></div>
          </div>
        </div>

        <!-- Day Description -->
        <div style="font-family: 'EB Garamond', serif; font-size: 12.5px; line-height: 1.5; color: #333; text-align: justify; flex: 1; overflow: hidden; margin-bottom: 4mm;">
          ${escapeHtml(day.description || 'Spend the day exploring local sights and experiencing the unique culture and cuisine. Relax at your leisure and enjoy the beautiful mountain scenery.')}
        </div>

        <!-- Day Info Badges Bar -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding-top: 8px; border-top: 1px dashed #efe4d2; margin-top: 4mm;">
          <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 4px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 12mm; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
            <span style="display: flex; align-items: center; gap: 2px; font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">${svgRuler} Distance</span>
            <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-weight: 600; color: var(--pdf-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px;">${escapeHtml(dayMeta.distance)}</span>
          </div>
          <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 4px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 12mm; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
            <span style="display: flex; align-items: center; gap: 2px; font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">${svgClock} Est. Time</span>
            <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-weight: 600; color: var(--pdf-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px;">${escapeHtml(dayMeta.duration)}</span>
          </div>
          <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 4px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 12mm; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
            <span style="display: flex; align-items: center; gap: 2px; font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">${svgCar.replace(/stroke="white"/g, 'stroke="#888"')} Transfer</span>
            <span style="font-family: 'EB Garamond', serif; font-size: 9.5px; font-weight: 600; color: var(--pdf-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px;">${escapeHtml(dayMeta.transfer)}</span>
          </div>
          <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 4px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 12mm; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
            <span style="display: flex; align-items: center; gap: 2px; font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">${svgHotel} Overnight</span>
            <span style="font-family: 'EB Garamond', serif; font-size: 9.5px; font-weight: 600; color: var(--pdf-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px;">${escapeHtml(dayMeta.stay)}</span>
          </div>
        </div>
      </div>

      <!-- Bottom Silhouette Background -->
      ${pdfBottomSilhouette ? `<img src="${pdfBottomSilhouette}" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 32mm; object-fit: cover; object-position: center bottom; opacity: 1.0; pointer-events: none;" />` : `
      <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; opacity: 0.15; pointer-events: none;">
        <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
        <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
      </svg>
      `}

      <!-- Standard Footer -->
      ${standardFooterHtml}
    </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Travel Itinerary - ${escapeHtml(itinerary?.title || 'Draft')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@400;500;600;700&family=Satisfy&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          @page { margin: 0; size: A4; }
          
          :root {
            --pdf-primary: ${pdfThemeColor};
            --pdf-accent: ${pdfAccentColor};
            --pdf-accent-secondary: #af8738;
            --pdf-bg-sage: #f4f7f2;
          }

          body { 
            margin: 0; padding: 0; 
            font-family: 'EB Garamond', serif; 
            color: #2c2c2c; 
            background: var(--pdf-bg-sage); 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          
          .page { 
            width: 210mm;
            height: 297mm;
            position: relative;
            background: ${pdfUseCanvaBackground && pdfCanvaInner ? `url('${pdfCanvaInner}') no-repeat center/cover` : `var(--pdf-bg-sage)`};
            overflow: hidden;
            page-break-after: always;
            padding: ${pdfPagePaddingTop} ${pdfPagePaddingRight} ${pdfPagePaddingBottom} ${pdfPagePaddingLeft};
          }
          
          ${pdfWatermark && !pdfUseCanvaBackground ? `
          .page:not(.cover-page)::after {
            content: "";
            position: absolute;
            top: 52%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 110mm;
            height: 110mm;
            background-image: url('${pdfWatermark}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            opacity: 0.04;
            pointer-events: none;
            z-index: 1;
          }
          ` : ''}
          
          .page.cover-page {
            padding: 0;
            background: ${pdfUseCanvaBackground && pdfCanvaCover ? `url('${pdfCanvaCover}') no-repeat center/cover` : `white`};
          }

          ${pdfUseCanvaBackground ? `
          .page-header, .page-footer {
            display: none !important;
          }
          ` : ''}
          
          .page-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 34mm;
            padding: 6mm 15mm 0 15mm;
            z-index: 10;
            background: transparent;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .page-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 18mm;
            background: transparent;
            padding: 0 15mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 10;
          }
          
          .page-content {
            width: 100%;
            height: calc(297mm - ${pdfPagePaddingTop} - ${pdfPagePaddingBottom} - 12mm);
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
          }
          
          /* Helper classes */
          .text-gold { color: var(--pdf-accent); }
          .text-green { color: var(--pdf-primary); }
          .font-serif { font-family: 'Playfair Display', serif; }
          .font-body { font-family: 'EB Garamond', serif; }
          .font-sans { font-family: 'Montserrat', sans-serif; }
          .font-cursive { font-family: 'Satisfy', cursive; }
          .font-handwritten { font-family: 'Caveat', cursive; }
          
          .policy-text, .policy-text p, .policy-text li, .policy-text span, .policy-text div {
            font-size: 10px !important;
            line-height: 1.35 !important;
            margin: 0 0 4px 0 !important;
            padding: 0 !important;
          }
          
          .terms-text, .terms-text p, .terms-text li, .terms-text span, .terms-text div {
            font-size: 7.4px !important;
            line-height: 1.25 !important;
            margin: 0 0 3px 0 !important;
            padding: 0 !important;
          }
          
          @media print {
            body { background: none; }
            .page { 
              box-shadow: none; 
              margin: 0;
            }
          }
        </style>
      </head>
      <body>

        <!-- PAGE 1: COVER PAGE -->
        <div class="page cover-page">
          ${pdfUseCanvaBackground ? `
            <!-- CANVA BACKGROUND COVER MODE OVERLAY -->
            <div style="position: absolute; top: ${pdfCoverOverlayTop}; left: 15mm; right: 15mm; display: flex; flex-direction: column; gap: 8mm; text-align: left; z-index: 10;">
              <div>
                <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; color: var(--pdf-primary); margin: 0 0 2mm 0; text-transform: uppercase; line-height: 1.1; text-shadow: 0 2px 4px rgba(255,255,255,0.85);">
                  ${escapeHtml(titleFallback)}
                </h1>
                <p style="font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600; color: var(--pdf-accent); margin: 0; text-transform: uppercase; letter-spacing: 1.5px; text-shadow: 0 1px 3px rgba(255,255,255,0.9);">
                  ${escapeHtml(subtitleFallback)}
                </p>
              </div>

              <!-- Compact Metadata Card -->
              <div style="background: white; border-radius: 8px; border: 1.5px solid var(--pdf-accent); box-shadow: 0 8px 24px rgba(0,0,0,0.06); display: grid; grid-template-columns: ${fromDate ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'}; align-items: center; text-align: center; padding: 12px 10px;">
                ${fromDate ? `
                <div style="border-right: 1px solid #efe4d2; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                    ${svgCalendar}
                    <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Departure</span>
                  </div>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); margin-top: 2px;">
                    ${new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                ` : ''}
                <div style="border-right: 1px solid #efe4d2; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                    ${svgClock}
                    <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Duration</span>
                  </div>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); margin-top: 2px;">
                    ${computedTotalDays} Days
                  </span>
                </div>
                <div style="${fromDate ? 'border-right: 1px solid #efe4d2;' : ''} display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                    ${svgUsers}
                    <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Guests</span>
                  </div>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); margin-top: 2px; line-height: 1.1;">
                    ${itinerary.adults || 2} Adults
                  </span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                    ${svgTicket}
                    <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Trip ID</span>
                  </div>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); margin-top: 2px;">
                    ${itinerary.queryCode || itinerary.id?.slice(0, 8).toUpperCase() || 'TBD'}
                  </span>
                </div>
              </div>

              <!-- Contact / Specialist Panel -->
              <div style="background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border-radius: 6px; padding: 10px 15px; border-left: 3px solid var(--pdf-primary); max-width: 320px; display: flex; gap: 10px; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                ${itinerary.creator?.photoUrl ? `<img src="${getSafeImageUrl(itinerary.creator.photoUrl)}" style="width: 10mm; height: 10mm; border-radius: 50%; object-fit: cover;" />` : `<div style="width: 10mm; height: 10mm; border-radius: 50%; background: var(--pdf-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">${(itinerary.creator?.name || 'A').charAt(0)}</div>`}
                <div>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Specialist</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: var(--pdf-primary); display: block;">${escapeHtml(itinerary.creator?.name || companyName)}</span>
                  <span style="font-family: 'EB Garamond', serif; font-size: 9.5px; color: #555; display: block; margin-top: 1px;">📞 ${escapeHtml(companyPhone)} • ✉️ ${escapeHtml(companyEmail)}</span>
                </div>
              </div>

              <!-- PACKAGE VALUE section (Canva) -->
              ${sellingPrice ? `
              <div style="margin-top: 4mm; text-align: left; z-index: 10; position: relative;">
                <div style="display: inline-block; background: white; border: 1.5px solid var(--pdf-accent); border-radius: 8px; padding: 6px 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 2px;">Estimated Investment</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: var(--pdf-primary); line-height: 1; display: block;">
                    ₹${sellingPrice.toLocaleString('en-IN')}/-
                  </span>
                  <span style="font-family: 'EB Garamond', serif; font-size: 8.5px; color: #666; font-style: italic; display: block; margin-top: 1px;">Inclusive of GST & Services</span>
                </div>
              </div>
              ` : ''}
            </div>
            </div>
          ` : `
            <!-- Curved Top Header -->
            <div class="page-header" style="height: 34mm;">
              <svg viewBox="0 0 800 130" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;">
                <path d="M 0 0 L 800 0 L 800 115 Q 400 95 0 115 Z" fill="white" />
                <path d="M 0 115 Q 400 95 800 115" stroke="${pdfAccentColor}" stroke-width="2" fill="none" />
              </svg>
              <div style="display: flex; align-items: center; gap: 10px; margin-top: 4mm;">
                ${companyLogo ? `<img src="${getSafeImageUrl(companyLogo)}" alt="Logo" style="height: 12mm; max-width: 30mm; object-fit: contain;" />` : `<div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: var(--pdf-primary); border: 2px solid var(--pdf-accent); padding: 2px 6px;">IH</div>`}
                <div style="display: flex; flex-direction: column;">
                  <span style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(companyName)}</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(companySlogan)}</span>
                </div>
              </div>

            </div>

            <!-- Hero Image with Overlay -->
            <div style="height: 125mm; width: 100%; margin-top: 28mm; position: relative; background-image: url('${pdfCoverPhoto || coverImageUrl}'); background-size: cover; background-position: center;">
              <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(15, 61, 47, 0.12), rgba(15, 61, 47, 0.45));"></div>
              <div style="position: absolute; bottom: 18mm; left: 15mm; color: white; text-align: left; max-width: 75%;">
                <h2 style="font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 800; color: white; margin: 0; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.1; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                  ${escapeHtml(titleFallback).replace('&', '<br/>&')}
                </h2>
                <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
                  <div style="width: 40px; height: 1px; background: var(--pdf-accent);"></div>
                  ${svgLeaf}
                  <div style="width: 40px; height: 1px; background: var(--pdf-accent);"></div>
                </div>
                <p style="font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 500; color: #f4f7f2; margin: 0; line-height: 1.4; text-shadow: 0 2px 4px rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                  ${escapeHtml(subtitleFallback).replace('•', '<br/>•')}
                </p>
              </div>
              <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: -1px; left: 0; width: 100%; height: 16mm; z-index: 5;">
                <path d="M 0 100 L 0 40 Q 400 95 800 40 L 800 100 Z" fill="white" />
                <path d="M 0 40 Q 400 95 800 40" stroke="var(--pdf-accent)" stroke-width="3" fill="none" />
              </svg>
            </div>

            <!-- Overlapping Meta Card -->
            <div style="position: absolute; top: 140mm; left: 15mm; right: 15mm; height: 22mm; background: white; border-radius: 8px; border: 1.5px solid var(--pdf-accent); box-shadow: 0 8px 20px rgba(0,0,0,0.06); z-index: 10; display: grid; grid-template-columns: ${fromDate ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'}; align-items: center; text-align: center; padding: 0 10px;">
              ${fromDate ? `
              <div style="border-right: 1px solid #efe4d2; height: 14mm; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                  ${svgCalendar}
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Departure</span>
                </div>
                <span style="font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: var(--pdf-primary);">
                  ${new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              ` : ''}
              <div style="border-right: 1px solid #efe4d2; height: 14mm; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                  ${svgClock}
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Duration</span>
                </div>
                <span style="font-family: 'EB Garamond', serif; font-size: 12px; font-weight: 600; color: var(--pdf-primary);">
                  ${computedTotalDays} Days / ${Math.max(1, computedTotalDays - 1)} Nights
                </span>
              </div>
              <div style="${fromDate ? 'border-right: 1px solid #efe4d2;' : ''} height: 14mm; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                  ${svgUsers}
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Guests</span>
                </div>
                <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); line-height: 1.1;">
                  ${itinerary.adults || 2} Adults ${itinerary.children ? `<br/><span style="font-family: 'Montserrat', sans-serif; font-size: 7px; color: var(--pdf-accent);">${itinerary.children} Child</span>` : ''}
                </span>
              </div>
              <div style="height: 14mm; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                  ${svgTicket}
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Trip ID</span>
                </div>
                <span style="font-family: 'EB Garamond', serif; font-size: 12px; font-weight: 600; color: var(--pdf-primary);">
                  ${itinerary.queryCode || itinerary.id?.slice(0, 8).toUpperCase() || 'TBD'}
                </span>
              </div>
            </div>

            <!-- Bottom Columns: Consultant & About -->
            <div style="margin-top: 18mm; padding: 0 15mm; display: flex; justify-content: space-between; align-items: flex-start; gap: 30px; text-align: left;">
              <div style="width: 48%; border-right: 1px solid #efe4d2; padding-right: 20px;">
                <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Travel Consultant</span>
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                  ${itinerary.creator?.photoUrl ? `
                    <img src="${getSafeImageUrl(itinerary.creator.photoUrl)}" style="width: 12mm; height: 12mm; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--pdf-accent);" />
                  ` : `
                    <div style="width: 12mm; height: 12mm; border-radius: 50%; background: var(--pdf-primary); border: 1.5px solid var(--pdf-accent); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--pdf-accent)" stroke-width="2" style="width: 6mm; height: 6mm;">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  `}
                  <div>
                    <span style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--pdf-primary); display: block; line-height: 1.2;">${escapeHtml(consultantName)}</span>
                    <span style="font-family: 'Playfair Display', serif; font-size: 11px; color: var(--pdf-accent); font-style: italic; display: block; margin-top: 1px;">Holiday Specialist</span>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #444; font-family: 'Montserrat', sans-serif; font-weight: 500;">
                  <span style="display: flex; align-items: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--pdf-accent)" stroke-width="2" style="width: 3.8mm; height: 3.8mm; flex-shrink: 0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    <span style="font-family: 'Montserrat', sans-serif; font-size: 11px; color: #333;">${escapeHtml(companyPhone)}</span>
                  </span>
                  <span style="display: flex; align-items: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--pdf-accent)" stroke-width="2" style="width: 3.8mm; height: 3.8mm; flex-shrink: 0;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    <span style="font-family: 'Montserrat', sans-serif; font-size: 11px; color: #333;">${escapeHtml(companyEmail)}</span>
                  </span>
                  <span style="display: flex; align-items: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--pdf-accent)" stroke-width="2" style="width: 3.8mm; height: 3.8mm; flex-shrink: 0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <span style="font-family: 'Montserrat', sans-serif; font-size: 11px; color: #333;">Your Journey, Our Expertise.</span>
                  </span>
                </div>
              </div>

              <div style="width: 48%; display: flex; flex-direction: column; justify-content: space-between; height: 32mm;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--pdf-accent)" stroke-width="2" style="width: 4.5mm; height: 4.5mm; flex-shrink: 0; display: inline-block; vertical-align: middle;"><path d="M3 20L10 7.5L15 16.5L18 12L22 20H3Z" /></svg>
                    <span style="font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 1px;">About This Journey</span>
                  </div>
                  <p style="font-family: 'Montserrat', sans-serif; font-size: 10.5px; font-weight: 500; color: #333; line-height: 1.55; margin: 0; text-align: justify; letter-spacing: 0.2px;">
                    Experience the perfect blend of serene tea gardens, majestic mountains, spiritual heritage, and charming hill towns. A journey curated to give you unforgettable memories.
                  </p>
                </div>
                <div style="border-top: 1px dashed #efe4d2; padding-top: 8px; text-align: right; margin-top: auto;">
                  <span style="font-family: 'Satisfy', cursive; font-size: 19px; color: var(--pdf-primary); display: block; font-weight: 500;">
                    Let's create memories that last a lifetime.
                  </span>
                  <svg width="80" height="6" viewBox="0 0 80 6" style="margin-top: 3px; display: inline-block;"><path d="M0 3 Q20 0 40 3 Q60 6 80 3" stroke="${pdfAccentColor}" stroke-width="1.5" fill="none"/></svg>
                </div>
              </div>
            </div>

            <!-- PACKAGE VALUE section -->
            ${sellingPrice ? `
            <div style="margin-top: 5mm; text-align: center; z-index: 10; position: relative;">
              <div style="display: inline-block; background: white; border: 1.5px solid var(--pdf-accent); border-radius: 8px; padding: 6px 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
                <span style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1.2px; text-transform: uppercase; display: block; margin-bottom: 2px;">Estimated Investment</span>
                <span style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 800; color: var(--pdf-primary); line-height: 1; display: block;">
                  ₹${sellingPrice.toLocaleString('en-IN')}/-
                </span>
                <span style="font-family: 'EB Garamond', serif; font-size: 9px; color: #666; font-style: italic; display: block; margin-top: 1px;">Inclusive of GST & Services</span>
              </div>
            </div>
            ` : ''}

            <!-- Bottom Silhouette Background -->
            ${pdfBottomSilhouette ? `<img src="${pdfBottomSilhouette}" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 25mm; object-fit: cover; object-position: center bottom; opacity: 1.0; pointer-events: none;" />` : `
            <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 25mm; opacity: 0.15; pointer-events: none;">
              <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
              <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
            </svg>
            `}

            <!-- Bottom Footer Bar -->
            ${standardFooterHtml}
          `}
        </div>

        <!-- PAGE 2: WELCOME -->
        <div class="page">
          <!-- Curved Top Header -->
          <div class="page-header" style="height: 34mm;">
            <svg viewBox="0 0 800 130" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;">
              <path d="M 0 0 L 800 0 L 800 115 Q 400 95 0 115 Z" fill="white" />
              <path d="M 0 115 Q 400 95 800 115" stroke="${pdfAccentColor}" stroke-width="2" fill="none" />
            </svg>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 4mm;">
              ${companyLogo ? `<img src="${getSafeImageUrl(companyLogo)}" alt="Logo" style="height: 12mm; max-width: 30mm; object-fit: contain;" />` : `<div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: var(--pdf-primary); border: 2px solid var(--pdf-accent); padding: 2px 6px;">IH</div>`}
              <div style="display: flex; flex-direction: column;">
                <span style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(companyName)}</span>
                <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(companySlogan)}</span>
              </div>
            </div>
            <div style="text-align: right; margin-top: 5mm;">
              <span style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(destinations)}</span>
              <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-style: italic; color: var(--pdf-accent); display: block; margin-top: 2px;">${computedTotalDays} Days / ${Math.max(1, computedTotalDays - 1)} Nights</span>
            </div>
          </div>

          <!-- Content -->
          <div class="page-content" style="margin-top: 10mm; display: flex; flex-direction: column; padding-bottom: 38mm;">
            <!-- Greeting & Welcome Letter -->
            <div style="position: relative; text-align: left; margin-bottom: 6mm; background: white; border: 1.5px solid #efe4d2; border-radius: 8px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
              <!-- Faint Train Background Watermark -->
              ${pdfWatermark ? `<div style="position: absolute; right: 20px; top: 20px; width: 45mm; height: 35mm; background-image: url('${pdfWatermark}'); background-size: contain; background-repeat: no-repeat; opacity: 0.1; pointer-events: none;"></div>` : `
              <svg viewBox="0 0 100 80" style="position: absolute; right: 20px; top: 20px; width: 40mm; height: 30mm; opacity: 0.06; fill: var(--pdf-primary); pointer-events: none;">
                <path d="M10 50 L90 50 L90 52 L10 52 Z M20 30 L45 30 L40 50 L25 50 Z M48 30 L70 30 L65 50 L53 50 Z M75 35 L85 35 L80 50 L77 50 Z M15 45 C15 40, 20 40, 20 45 Z" />
              </svg>
              `}
              <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: var(--pdf-primary); margin: 0 0 4mm 0;">
                Dear ${escapeHtml(guestName)},
              </h2>
              <p style="font-family: 'EB Garamond', serif; font-size: 15px; color: #333; line-height: 1.55; margin: 0 0 4mm 0; text-align: justify;">
                A warm welcome from all of us at <strong>${escapeHtml(companyName)}</strong>. We are absolutely thrilled to assist you in planning your upcoming vacation. Travel is not just about visiting new places; it is about the stories you bring back, the cultures that inspire you, and the moments that take your breath away. 
              </p>
              <p style="font-family: 'EB Garamond', serif; font-size: 15px; color: #333; line-height: 1.55; margin: 0 0 4mm 0; text-align: justify;">
                We have meticulously crafted this signature journey through the breathtaking tea plantations, sacred monasteries, and majestic mountain peaks of <strong>${escapeHtml(destinations)}</strong>. Every detail of this itinerary, from the properties we have selected to the private transfers and curated excursions, is designed to offer you the ultimate comfort and a deeply authentic experience of the Himalayas.
              </p>
              <p style="font-family: 'EB Garamond', serif; font-size: 15px; color: #333; line-height: 1.55; margin: 0; text-align: justify;">
                Please find the detailed day-by-day travel details, hotels summary, and booking specifications in the pages that follow. We hope this proposal paints a perfect picture of your dream holiday. Should you wish to personalize any aspect of this itinerary, your dedicated Travel Consultant is always at your service.
              </p>
              <div style="margin-top: 5mm; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #efe4d2; padding-top: 4mm;">
                <div>
                  <span style="font-family: 'Satisfy', cursive; font-size: 18px; color: var(--pdf-primary); font-weight: 500; display: block;">Warmest Regards,</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 1px; display: block;">Team Imagica Holidays</span>
                </div>
                <div style="font-family: 'Satisfy', cursive; font-size: 26px; color: var(--pdf-accent); opacity: 0.8;">
                  Bon Voyage!
                </div>
              </div>
            </div>

            <!-- TRIP SUMMARY Card -->
            <div style="background: white; border: 1.5px solid #efe4d2; border-radius: 8px; margin-bottom: 5mm; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
              <div style="background: var(--pdf-primary); padding: 4px 15px; color: white; text-align: left; font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                Trip Summary
              </div>
              <div style="display: grid; grid-template-columns: ${fromDate ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'}; align-items: center; text-align: center; padding: 10px 5px; height: 16mm;">
                <div style="border-right: 1px solid #efe4d2; height: 10mm; display: flex; flex-direction: column; justify-content: center;">
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Destination</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px;">${escapeHtml(destinations)}</span>
                </div>
                ${fromDate ? `
                <div style="border-right: 1px solid #efe4d2; height: 10mm; display: flex; flex-direction: column; justify-content: center;">
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Travel Dates</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 9px; font-weight: 700; color: var(--pdf-primary);">${dateString}</span>
                </div>
                ` : ''}
                <div style="${fromDate ? 'border-right: 1px solid #efe4d2;' : ''} height: 10mm; display: flex; flex-direction: column; justify-content: center;">
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Guests</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 9px; font-weight: 700; color: var(--pdf-primary);">${itinerary.adults || 2} Adults ${itinerary.children ? `• ${itinerary.children} Child` : ''}</span>
                </div>
                <div style="height: 10mm; display: flex; flex-direction: column; justify-content: center;">
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Trip ID</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary);">${itinerary.queryCode || itinerary.id?.slice(0, 8).toUpperCase() || 'TBD'}</span>
                </div>
              </div>
            </div>

            <!-- WHY YOU'LL LOVE THIS STAY -->
            <div style="page-break-inside: avoid; margin-bottom: 3mm; margin-top: 5mm;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                <div style="flex: 1; height: 1px; background: #efe4d2;"></div>
                <div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;">${svgLeaf}<span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 1px;">Why You'll Love This Journey</span></div>
                <div style="flex: 1; height: 1px; background: #efe4d2;"></div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 5px; text-align: center;">
                  <span style="display: block; margin-bottom: 2px;">${svgMountain}</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: var(--pdf-primary); display: block; margin-bottom: 1px;">Scenic Views</span>
                  <span style="font-family: 'EB Garamond', serif; font-size: 9px; color: #666; line-height: 1.2; display: block;">Hills &amp; misty valleys.</span>
                </div>
                <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 5px; text-align: center;">
                  <span style="display: block; margin-bottom: 2px;">${svgMapPin}</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: var(--pdf-primary); display: block; margin-bottom: 1px;">Prime Location</span>
                  <span style="font-family: 'EB Garamond', serif; font-size: 9px; color: #666; line-height: 1.2; display: block;">Near local viewpoints.</span>
                </div>
                <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 5px; text-align: center;">
                  <span style="display: block; margin-bottom: 2px;">${svgFamily}</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: var(--pdf-primary); display: block; margin-bottom: 1px;">Family Friendly</span>
                  <span style="font-family: 'EB Garamond', serif; font-size: 9px; color: #666; line-height: 1.2; display: block;">Comfortable amenities.</span>
                </div>
                <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 5px; text-align: center;">
                  <span style="display: block; margin-bottom: 2px;">${svgFood}</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: var(--pdf-primary); display: block; margin-bottom: 1px;">Local Cuisine</span>
                  <span style="font-family: 'EB Garamond', serif; font-size: 9px; color: #666; line-height: 1.2; display: block;">Warm hospitality.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Silhouette Background -->
          ${pdfBottomSilhouette ? `<img src="${pdfBottomSilhouette}" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 25mm; object-fit: cover; object-position: center bottom; opacity: 1.0; pointer-events: none;" />` : `
          <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 25mm; opacity: 0.15; pointer-events: none;">
            <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
            <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
          </svg>
          `}

          <!-- Standard Footer -->
          ${standardFooterHtml}
        </div>

        <!-- PAGE 3: ACCOMMODATION SUMMARY -->
        <div class="page">
          <!-- Curved Top Header -->
          <div class="page-header" style="height: 34mm;">
            <svg viewBox="0 0 800 130" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;">
              <path d="M 0 0 L 800 0 L 800 115 Q 400 95 0 115 Z" fill="white" />
              <path d="M 0 115 Q 400 95 800 115" stroke="${pdfAccentColor}" stroke-width="2" fill="none" />
            </svg>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 4mm;">
              ${companyLogo ? `<img src="${getSafeImageUrl(companyLogo)}" alt="Logo" style="height: 12mm; max-width: 30mm; object-fit: contain;" />` : `<div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: var(--pdf-primary); border: 2px solid var(--pdf-accent); padding: 2px 6px;">IH</div>`}
              <div style="display: flex; flex-direction: column;">
                <span style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(companyName)}</span>
                <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(companySlogan)}</span>
              </div>
            </div>
            <div style="text-align: right; margin-top: 5mm;">
              <span style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(destinations)}</span>
              <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-style: italic; color: var(--pdf-accent); display: block; margin-top: 2px;">${computedTotalDays} Days / ${Math.max(1, computedTotalDays - 1)} Nights</span>
            </div>
          </div>

          <!-- Content -->
          <div class="page-content" style="margin-top: 10mm; display: flex; flex-direction: column; padding-bottom: 38mm;">
            <!-- ACCOMMODATION section -->
            <div style="background: white; border: 1.5px solid #efe4d2; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 5mm;">
              <div style="background: var(--pdf-primary); padding: 4px 15px; color: white; text-align: left; font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                <span>${svgHotel}</span> <span>Your Accommodation</span>
              </div>
              
              <!-- Stay Detail Grid -->
              ${(() => {
                if (stays.length === 0) return `<div style="padding: 15px; font-style: italic; color: #666;">No accommodation settings specified. Stays will be managed as per flow.</div>`;
                
                return stays.map((stay, index) => {
                  const stayImage = stay.imageUrl ? getSafeImageUrl(stay.imageUrl) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop';
                  const hotelName = stay.metadata?.hotelName || stay.title || 'Premium Hotel';
                  const roomType = stay.metadata?.roomType || 'Deluxe Room';
                  const mealPlan = stay.metadata?.mealPlan || 'Breakfast + Dinner Included';
                  const destination = stay.destination || 'Sikkim';
                  const nightsCount = stay.metadata?.nights || 3;
                  
                  const showDates = !!fromDate;
                  const checkInDate = fromDate 
                    ? new Date(new Date(fromDate).getTime() + (stay.dayNumber - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '';
                  
                  const checkOutDate = fromDate
                    ? new Date(new Date(fromDate).getTime() + (stay.dayNumber - 1 + nightsCount) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '';

                  return `
                  <div style="display: flex; min-height: 42mm; ${index > 0 ? 'border-top: 1.5px solid #efe4d2;' : ''}">
                    <!-- Left side: Image and details bar -->
                    <div style="width: 45%; display: flex; flex-direction: column; border-right: 1.5px solid #efe4d2; align-self: stretch;">
                      <div style="flex: 1; min-height: 30mm; background-image: url('${stayImage}'); background-size: cover; background-position: center;"></div>
                      <!-- Check-in / out bar -->
                      <div style="height: 12mm; flex-shrink: 0; background: var(--pdf-primary); display: grid; grid-template-columns: ${showDates ? 'repeat(3, 1fr)' : '1fr'}; align-items: center; text-align: center; color: white; font-family: 'Montserrat', sans-serif; font-size: 6px;">
                        ${showDates ? `
                        <div style="border-right: 0.5px solid rgba(255,255,255,0.2); display: flex; flex-direction: column; justify-content: center; height: 100%;">
                          <span style="font-weight: 500; opacity: 0.8; text-transform: uppercase; font-size: 5.5px;">Check-in</span>
                          <span style="font-weight: 700; margin-top: 1px;">${checkInDate}</span>
                        </div>
                        <div style="border-right: 0.5px solid rgba(255,255,255,0.2); display: flex; flex-direction: column; justify-content: center; height: 100%;">
                          <span style="font-weight: 500; opacity: 0.8; text-transform: uppercase; font-size: 5.5px;">Check-out</span>
                          <span style="font-weight: 700; margin-top: 1px;">${checkOutDate}</span>
                        </div>
                        ` : ''}
                        <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
                          <span style="font-weight: 500; opacity: 0.8; text-transform: uppercase; font-size: 5.5px;">Nights</span>
                          <span style="font-weight: 700; margin-top: 1px;">${nightsCount} Night${nightsCount > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Right side: Hotel specifications -->
                    <div style="width: 55%; padding: 8px 14px; display: flex; flex-direction: column; text-align: left; justify-content: center;">
                      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                        ${svgMapPin}
                        <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(destination)}</span>
                      </div>
                      <h3 style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: var(--pdf-primary); margin: 0 0 2px 0; line-height: 1.2;">
                        ${escapeHtml(hotelName)}
                      </h3>
                      <div style="display: flex; gap: 2px; margin-bottom: 4px;">
                        ${svgStar}${svgStar}${svgStar}${svgStar}${svgStar}
                      </div>
                      
                      <div style="border-top: 1px dashed #efe4d2; padding-top: 6px; margin-top: 4px;">
                        <ul style="margin: 0; padding: 0 0 0 12px; font-family: 'EB Garamond', serif; font-size: 11px; color: #444; display: flex; flex-direction: column; gap: 2px;">
                          <li><strong>Room</strong>: ${escapeHtml(roomType)}</li>
                          <li><strong>Meals</strong>: ${escapeHtml(mealPlan)}</li>
                          <li><strong>Duration</strong>: ${nightsCount} Nights Overnight</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  `;
                }).join('');
              })()}
            </div>
          </div>

          <!-- Bottom Silhouette Background -->
          ${pdfBottomSilhouette ? `<img src="${pdfBottomSilhouette}" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 25mm; object-fit: cover; object-position: center bottom; opacity: 1.0; pointer-events: none;" />` : `
          <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 25mm; opacity: 0.15; pointer-events: none;">
            <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
            <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
          </svg>
          `}

          <!-- Standard Footer -->
          ${standardFooterHtml}
        </div>

        <!-- PAGE 3: TRANSPORTATION -->
        <div class="page">
          <!-- Curved Top Header -->
          <div class="page-header" style="height: 34mm;">
            <svg viewBox="0 0 800 130" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;">
              <path d="M 0 0 L 800 0 L 800 115 Q 400 95 0 115 Z" fill="white" />
              <path d="M 0 115 Q 400 95 800 115" stroke="${pdfAccentColor}" stroke-width="2" fill="none" />
            </svg>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 4mm;">
              ${companyLogo ? `<img src="${getSafeImageUrl(companyLogo)}" alt="Logo" style="height: 12mm; max-width: 30mm; object-fit: contain;" />` : `<div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: var(--pdf-primary); border: 2px solid var(--pdf-accent); padding: 2px 6px;">IH</div>`}
              <div style="display: flex; flex-direction: column;">
                <span style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(companyName)}</span>
                <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(companySlogan)}</span>
              </div>
            </div>
            <div style="text-align: right; margin-top: 5mm;">
              <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(destinations)}</span>
              <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-style: italic; color: var(--pdf-accent); display: block; margin-top: 2px;">${computedTotalDays} Days / ${Math.max(1, computedTotalDays - 1)} Nights</span>
            </div>
          </div>

          <!-- Section Title Bar (no photo) -->
          <div style="margin-top: 8mm; padding: 10px 15px; border-left: 4px solid var(--pdf-accent); background: #f4f7f2; border-radius: 0 6px 6px 0; display: flex; align-items: center; gap: 10px;">
            <div style="flex: 1;">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--pdf-primary); margin: 0 0 2px 0; letter-spacing: 0.5px;">Transportation</h3>
              <p style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Day-wise curated transit details &amp; fleet services</p>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 0.5px;">
              ${svgCar} Private Fleet
            </div>
          </div>

          <!-- Content -->
          <div class="page-content" style="margin-top: 4mm; display: flex; flex-direction: column; padding-bottom: 38mm;">
            <div style="background: var(--pdf-primary); padding: 4px 15px; color: white; text-align: left; font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px 4px 0 0;">
              ${svgBus.replace(/stroke="white"/g, 'stroke="white"')} Transportation Used: Private SUV (Innova / Xylo / Similar)
            </div>
            
            <div style="background: white; border: 1.5px solid #efe4d2; border-radius: 0 0 8px 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.02); max-height: 125mm; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="background: #f4f7f2; border-bottom: 2.5px solid #efe4d2;">
                    <th style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-primary); padding: 8px 12px; text-transform: uppercase; width: 18%; text-align: center;">Day</th>
                    <th style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-primary); padding: 8px 12px; text-transform: uppercase; width: 82%;">Route & Service Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${transportList.slice(0, 8).map((tr, idx) => {
                    const dayDate = fromDate 
                      ? new Date(new Date(fromDate).getTime() + (tr.dayNumber - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                      : `Day ${tr.dayNumber}`;

                    let icon = svgCar;
                    if (tr.dayNumber === 1) icon = svgTrain;
                    else if (tr.dayNumber === totalDays) icon = svgPlane;
                    else icon = svgCar;

                    const vehicleImg = tr.imageUrl || tr.image || tr.metadata?.imageUrl || tr.metadata?.image || (tr.images && tr.images[0]);

                    return `
                    <tr style="border-bottom: 1px solid #efe4d2; background: ${idx % 2 === 1 ? '#fafcf9' : 'white'};">
                      <td style="padding: 10px 12px; vertical-align: middle; text-align: center;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--pdf-primary); border: 1.5px solid var(--pdf-accent); display: flex; align-items: center; justify-content: center; color: white; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; margin: 0 auto 3px;">
                          ${icon}
                        </div>
                        <span style="font-family: 'EB Garamond', serif; font-size: 9px; font-weight: 600; color: var(--pdf-primary); display: block;">D${tr.dayNumber}</span>
                        <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; display: block;">${dayDate}</span>
                      </td>
                      <td style="padding: 10px 15px; vertical-align: middle; text-align: left;">
                        <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between;">
                          <div style="flex: 1;">
                            <h4 style="font-family: 'Playfair Display', serif; font-size: 12.5px; font-weight: 700; color: var(--pdf-primary); margin: 0 0 3px 0; line-height: 1.2;">
                              ${escapeHtml(tr.title || `Day ${tr.dayNumber} Transit`)}
                            </h4>
                            <p style="font-family: 'EB Garamond', serif; font-size: 12px; color: #555; margin: 0; line-height: 1.4;">
                              ${escapeHtml(tr.description || 'Private transfers as per route.')}
                            </p>
                          </div>
                          ${vehicleImg ? `
                            <div style="width: 75px; height: 50px; border-radius: 4px; border: 1px solid #efe4d2; overflow: hidden; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                              <img src="${getSafeImageUrl(vehicleImg)}" style="width: 100%; height: 100%; object-fit: cover;" />
                            </div>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div style="margin-top: auto; margin-bottom: 2mm; text-align: center; position: relative;">
              <div style="width: 40px; height: 1px; background: var(--pdf-accent); margin: 0 auto 6px;"></div>
              <span style="font-family: 'Satisfy', cursive; font-size: 16px; color: var(--pdf-accent);">
                "We wish you a wonderful journey filled with unforgettable memories!"
              </span>
              <div style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">Imagica Holidays Fleet Service</div>
            </div>
          </div>

          <!-- Bottom Silhouette Background -->
          ${pdfBottomSilhouette ? `<img src="${pdfBottomSilhouette}" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 32mm; object-fit: cover; object-position: center bottom; opacity: 1.0; pointer-events: none;" />` : `
          <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; opacity: 0.15; pointer-events: none;">
            <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
            <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
          </svg>
          `}

          <!-- Standard Footer -->
          ${standardFooterHtml}
        </div>

        ${daysHtml}

        <!-- PAGE 5: INCLUSIONS & EXCLUSIONS -->
        <div class="page">
          <!-- Curved Top Header -->
          <div class="page-header" style="height: 34mm;">
            <svg viewBox="0 0 800 130" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;">
              <path d="M 0 0 L 800 0 L 800 115 Q 400 95 0 115 Z" fill="white" />
              <path d="M 0 115 Q 400 95 800 115" stroke="${pdfAccentColor}" stroke-width="2" fill="none" />
            </svg>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 4mm;">
              ${companyLogo ? `<img src="${getSafeImageUrl(companyLogo)}" alt="Logo" style="height: 12mm; max-width: 30mm; object-fit: contain;" />` : `<div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: var(--pdf-primary); border: 2px solid var(--pdf-accent); padding: 2px 6px;">IH</div>`}
              <div style="display: flex; flex-direction: column;">
                <span style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(companyName)}</span>
                <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(companySlogan)}</span>
              </div>
            </div>
            <div style="text-align: right; margin-top: 5mm;">
              <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(destinations)}</span>
              <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-style: italic; color: var(--pdf-accent); display: block; margin-top: 2px;">${computedTotalDays} Days / ${Math.max(1, computedTotalDays - 1)} Nights</span>
            </div>
          </div>

          <!-- Horizontal Illustration Banner -->
          <div style="height: 25mm; width: 100%; margin-top: 10mm; border-radius: 6px; border: 1.5px solid var(--pdf-accent); background-image: url('${pdfHeaderBanner || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800'}'); background-size: cover; background-position: center; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(15, 61, 47, 0.55), rgba(15, 61, 47, 0.08));"></div>
            <div style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: white; text-align: left;">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin: 0 0 2px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Inclusions & Exclusions</h3>
              <p style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 600; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 1px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">What's covered in your luxury package</p>
            </div>
          </div>

          <!-- Content -->
          <div class="page-content" style="margin-top: 6mm;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; height: 160mm;">
              <div style="display: flex; flex-direction: column; background: white; border: 1.5px solid #efe4d2; border-radius: 8px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 6px; border-bottom: 1.5px solid var(--pdf-primary); padding-bottom: 6px; margin-bottom: 10px;">
                  ${svgCheckCircle}
                  <h4 style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: var(--pdf-primary); text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">Package Inclusions</h4>
                </div>
                <div style="font-family: 'EB Garamond', serif; font-size: 12.5px; line-height: 1.5; color: #444; overflow: auto; padding-right: 5px; flex: 1;">
                  ${itinerary.inclusionsHtml || '<p>&bull; Accommodation as per selection<br/>&bull; Daily breakfast at all hotels<br/>&bull; Private transfers & sightseeing as per itinerary<br/>&bull; Driver allowances, toll taxes, and parking fees</p>'}
                </div>
              </div>
              
              <div style="display: flex; flex-direction: column; background: white; border: 1.5px solid #f2e4e4; border-radius: 8px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 6px; border-bottom: 1.5px solid #5c1d1d; padding-bottom: 6px; margin-bottom: 10px;">
                  ${svgXCircle}
                  <h4 style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: #5c1d1d; text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">Package Exclusions</h4>
                </div>
                <div style="font-family: 'EB Garamond', serif; font-size: 12.5px; line-height: 1.5; color: #444; overflow: auto; padding-right: 5px; flex: 1;">
                  ${itinerary.exclusionsHtml || '<p>&bull; Airfare / Train fare to destination<br/>&bull; Personal expenses like laundry, phone calls, tips<br/>&bull; Entry fees at sightseeing points & adventure activity costs<br/>&bull; Any meal not specified in inclusions</p>'}
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Silhouette Background -->
          ${pdfBottomSilhouette ? `<img src="${pdfBottomSilhouette}" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 32mm; object-fit: cover; object-position: center bottom; opacity: 1.0; pointer-events: none;" />` : `
          <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; opacity: 0.15; pointer-events: none;">
            <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
            <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
          </svg>
          `}

          <!-- Standard Footer -->
          ${standardFooterHtml}
        </div>

        <!-- PAGE 6: TERMS & POLICIES -->
        <div class="page">
          <!-- Curved Top Header -->
          <div class="page-header" style="height: 34mm;">
            <svg viewBox="0 0 800 130" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;">
              <path d="M 0 0 L 800 0 L 800 115 Q 400 95 0 115 Z" fill="white" />
              <path d="M 0 115 Q 400 95 800 115" stroke="${pdfAccentColor}" stroke-width="2" fill="none" />
            </svg>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 4mm;">
              ${companyLogo ? `<img src="${getSafeImageUrl(companyLogo)}" alt="Logo" style="height: 12mm; max-width: 30mm; object-fit: contain;" />` : `<div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: var(--pdf-primary); border: 2px solid var(--pdf-accent); padding: 2px 6px;">IH</div>`}
              <div style="display: flex; flex-direction: column;">
                <span style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(companyName)}</span>
                <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(companySlogan)}</span>
              </div>
            </div>
            <div style="text-align: right; margin-top: 5mm;">
              <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(destinations)}</span>
              <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-style: italic; color: var(--pdf-accent); display: block; margin-top: 2px;">${computedTotalDays} Days / ${Math.max(1, computedTotalDays - 1)} Nights</span>
            </div>
          </div>

          <!-- Horizontal Illustration Banner -->
          <div style="height: 25mm; width: 100%; margin-top: 10mm; border-radius: 6px; border: 1.5px solid var(--pdf-accent); background-image: url('${pdfHeaderBanner || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800'}'); background-size: cover; background-position: center; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(15, 61, 47, 0.55), rgba(15, 61, 47, 0.08));"></div>
            <div style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: white; text-align: left;">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin: 0 0 2px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Terms & Policies</h3>
              <p style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 600; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 1px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Important guidelines and cancellation terms</p>
            </div>
          </div>

          <!-- Content -->
          <div class="page-content" style="margin-top: 6mm;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; height: 145mm; max-height: 145mm; overflow: hidden;">
              
              <!-- Left Side: Terms and Conditions -->
              <div style="display: flex; flex-direction: column; background: white; border: 1.5px solid #efe4d2; border-radius: 8px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); height: 145mm; max-height: 145mm; box-sizing: border-box; overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 6px; border-bottom: 1.5px solid var(--pdf-primary); padding-bottom: 6px; margin-bottom: 10px;">
                  ${svgDocument}
                  <h4 style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: var(--pdf-primary); text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">Terms & Conditions</h4>
                </div>
                <div class="policy-text terms-text" style="font-family: 'EB Garamond', serif; color: #444; max-height: 110mm; overflow: hidden; padding-right: 5px; flex: 1;">
                  ${itinerary.packageTerms || itinerary.termsHtml || `
                    <p>&bull; All rates are subject to availability at the time of actual booking confirmation.</p>
                    <p>&bull; Standard check-in time at hotels is 14:00 hrs and check-out is 11:00 hrs.</p>
                    <p>&bull; Any increase in government taxes, fuel costs or airline fares will be charged extra.</p>
                    <p>&bull; Personal expenses like laundry, phone calls, drinks and entry tickets are not included.</p>
                    <p>&bull; Imagica Holidays reserves the right to rearrange day-wise schedules due to weather/traffic.</p>
                  `}
                </div>
              </div>

              <!-- Right Side: Booking & Cancellation Policies -->
              <div style="display: flex; flex-direction: column; gap: 15px; height: 145mm; max-height: 145mm; box-sizing: border-box;">
                <!-- Payment Policy -->
                <div style="display: flex; flex-direction: column; background: white; border: 1.5px solid #efe4d2; border-radius: 8px; padding: 12px 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); height: 65mm; max-height: 65mm; box-sizing: border-box; overflow: hidden;">
                  <div style="display: flex; align-items: center; gap: 6px; border-bottom: 1.5px solid var(--pdf-primary); padding-bottom: 4px; margin-bottom: 8px;">
                    ${svgCreditCard}
                    <h4 style="font-family: 'Playfair Display', serif; font-size: 12px; font-weight: 700; color: var(--pdf-primary); text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">Payment Policy</h4>
                  </div>
                  <div class="policy-text" style="font-family: 'EB Garamond', serif; color: #444; max-height: 45mm; overflow: hidden; padding-right: 5px; flex: 1;">
                    ${itinerary.paymentPolicyHtml || `
                      <p>&bull; 25% of the total package cost is required to initiate bookings.</p>
                      <p>&bull; 50% of the total package cost is due 30 days prior to departure.</p>
                      <p>&bull; Remaining 25% is due 15 days prior to arrival at the destination.</p>
                      <p>&bull; For peak season travel, 100% advance payment may be required at confirmation.</p>
                    `}
                  </div>
                </div>

                <!-- Cancellation Policy -->
                <div style="display: flex; flex-direction: column; background: white; border: 1.5px solid #efe4d2; border-radius: 8px; padding: 12px 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); height: 65mm; max-height: 65mm; box-sizing: border-box; overflow: hidden;">
                  <div style="display: flex; align-items: center; gap: 6px; border-bottom: 1.5px solid var(--pdf-primary); padding-bottom: 4px; margin-bottom: 8px;">
                    ${svgShield}
                    <h4 style="font-family: 'Playfair Display', serif; font-size: 12px; font-weight: 700; color: var(--pdf-primary); text-transform: uppercase; margin: 0; letter-spacing: 0.5px;">Cancellation Policy</h4>
                  </div>
                  <div class="policy-text" style="font-family: 'EB Garamond', serif; color: #444; max-height: 45mm; overflow: hidden; padding-right: 5px; flex: 1;">
                    ${itinerary.cancellationPolicyHtml || `
                      <p>&bull; Cancellation 30 days or more before departure: 10% of total cost is non-refundable.</p>
                      <p>&bull; Cancellation 15 to 29 days before departure: 50% of total package cost is charged.</p>
                      <p>&bull; Cancellation less than 15 days before departure: 100% of package cost is charged.</p>
                      <p>&bull; Peak season bookings (Oct-Jan, Apr-Jun) are completely non-refundable once confirmed.</p>
                    `}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Bottom Silhouette Background -->
          ${pdfBottomSilhouette ? `<img src="${pdfBottomSilhouette}" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 32mm; object-fit: cover; object-position: center bottom; opacity: 1.0; pointer-events: none;" />` : `
          <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; opacity: 0.15; pointer-events: none;">
            <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
            <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
          </svg>
          `}

          <!-- Standard Footer -->
          ${standardFooterHtml}
        </div>

        <!-- PAGE 7: EXQUISITE DIAMOND GALLERY -->
        <div class="page">
          <!-- Curved Top Header -->
          <div class="page-header" style="height: 34mm;">
            <svg viewBox="0 0 800 130" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;">
              <path d="M 0 0 L 800 0 L 800 115 Q 400 95 0 115 Z" fill="white" />
              <path d="M 0 115 Q 400 95 800 115" stroke="${pdfAccentColor}" stroke-width="2" fill="none" />
            </svg>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 4mm;">
              ${companyLogo ? `<img src="${getSafeImageUrl(companyLogo)}" alt="Logo" style="height: 12mm; max-width: 30mm; object-fit: contain;" />` : `<div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: var(--pdf-primary); border: 2px solid var(--pdf-accent); padding: 2px 6px;">IH</div>`}
              <div style="display: flex; flex-direction: column;">
                <span style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 0.5px; text-transform: uppercase;">${escapeHtml(companyName)}</span>
                <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 600; color: #888; letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(companySlogan)}</span>
              </div>
            </div>
            <div style="text-align: right; margin-top: 5mm;">
              <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(destinations)}</span>
              <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-style: italic; color: var(--pdf-accent); display: block; margin-top: 2px;">${computedTotalDays} Days / ${Math.max(1, computedTotalDays - 1)} Nights</span>
            </div>
          </div>

          <!-- Content -->
          <div class="page-content" style="margin-top: 10mm; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2mm; text-align: left; border-bottom: 1.5px solid var(--pdf-accent); padding-bottom: 4px;">
              <span style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 0.5px; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                ${svgCamera} Visual Gallery
              </span>
              <span style="font-family: 'Satisfy', cursive; font-size: 15px; color: var(--pdf-accent);">Capturing Memories for Lifetime</span>
            </div>

            <!-- Rectangular Photo Mosaic Grid -->
            <!-- Row 1: Large left (2/3) + Tall right (1/3) -->
            <div style="display: flex; gap: 6px; height: 78mm; margin-top: 4mm;">
              <!-- Large Feature Photo -->
              <div style="flex: 2; border-radius: 6px; overflow: hidden; border: none; position: relative;">
                <div style="width: 100%; height: 100%; background-image: url('${gridImages[0]}'); background-size: cover; background-position: center;"></div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(15,61,47,0.6), transparent); padding: 8px 10px;">
                  <span style="font-family: 'Satisfy', cursive; font-size: 11px; color: white;">Discover ${escapeHtml(destinations.split(' &amp; ')[0] || destinations)}</span>
                </div>
              </div>
              <!-- Right stacked 2 photos -->
              <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                <div style="flex: 1; border-radius: 6px; overflow: hidden; border: none;">
                  <div style="width: 100%; height: 100%; background-image: url('${gridImages[1]}'); background-size: cover; background-position: center;"></div>
                </div>
                <div style="flex: 1; border-radius: 6px; overflow: hidden; border: none;">
                  <div style="width: 100%; height: 100%; background-image: url('${gridImages[2]}'); background-size: cover; background-position: center;"></div>
                </div>
              </div>
            </div>
            <!-- Row 2: 3 equal photos -->
            <div style="display: flex; gap: 6px; height: 60mm; margin-top: 6px;">
              <div style="flex: 1; border-radius: 6px; overflow: hidden; border: none; position: relative;">
                <div style="width: 100%; height: 100%; background-image: url('${gridImages[3]}'); background-size: cover; background-position: center;"></div>
                <div style="position: absolute; inset: 0; background: rgba(15,61,47,0.08);"></div>
              </div>
              <div style="flex: 1; border-radius: 6px; overflow: hidden; border: 2.5px solid var(--pdf-primary); position: relative;">
                <div style="width: 100%; height: 100%; background-image: url('${gridImages[4]}'); background-size: cover; background-position: center;"></div>
                <!-- Center badge -->
                <div style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); background: var(--pdf-primary); border: 1.5px solid var(--pdf-accent); border-radius: 20px; padding: 3px 10px; white-space: nowrap;">
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 0.5px;">Imagica Holidays</span>
                </div>
              </div>
              <div style="flex: 1; border-radius: 6px; overflow: hidden; border: none; position: relative;">
                <div style="width: 100%; height: 100%; background-image: url('${gridImages[0]}'); background-size: cover; background-position: center;"></div>
                <div style="position: absolute; inset: 0; background: rgba(15,61,47,0.08);"></div>
              </div>
            </div>

            <!-- Signature/Closing Note -->
            <div style="margin-top: 5mm; text-align: center; position: relative; z-index: 5;">
              <div style="width: 50px; height: 1px; background: var(--pdf-accent); margin: 0 auto 5px;"></div>
              <span style="font-family: 'Satisfy', cursive; font-size: 17px; color: var(--pdf-accent); display: block; margin-bottom: 2px;">
                "Travel leaves you speechless, then turns you into a storyteller."
              </span>
              <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: var(--pdf-primary); text-transform: uppercase; letter-spacing: 2px;">${escapeHtml(companyName)} &bull; Curating Dreams</span>
            </div>
          </div>

          <!-- Bottom Silhouette Background -->
          ${pdfBottomSilhouette ? `<img src="${pdfBottomSilhouette}" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 32mm; object-fit: cover; object-position: center bottom; opacity: 1.0; pointer-events: none;" />` : `
          <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; opacity: 0.15; pointer-events: none;">
            <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
            <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
          </svg>
          `}

          <!-- Standard Footer -->
          ${standardFooterHtml}
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
    const asTemplate = req.body?.asTemplate === true;
    const itinerary = await itineraryService.duplicate(req.params.id, req.user.id, asTemplate);
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
    const settings = await orgSettingService.getAllSettings();
    const html = generateItineraryHtml(itinerary, settings);
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

const exportHtml = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.getExportData(req.params.id);
    const settings = await orgSettingService.getAllSettings();
    const html = generateItineraryHtml(itinerary, settings);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Itinerary HTML Error:', err);
    next(err);
  }
};

const exportHtmlByShareSlug = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.getByShareSlug(req.params.slug);
    const settings = await orgSettingService.getAllSettings();
    const html = generateItineraryHtml(itinerary, settings);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Itinerary Share HTML Error:', err);
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
  exportHtml,
  exportHtmlByShareSlug,
  generateItineraryHtml,
};
