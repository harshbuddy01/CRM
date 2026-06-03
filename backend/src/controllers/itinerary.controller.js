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

/**
 * Helper to get a safe image URL for PDF rendering.
 */
const getSafeImageUrl = (url) => {
  if (!url) return '';
  // Ensure protocol is present
  if (url.startsWith('//')) return `https:${url}`;
  return url;
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

  const guestName = itinerary.proposals?.[0]?.query?.name || 'Harsh';

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

  const defaultCoverBase64 = loadCoverImageBase64();
  const coverImageUrl = itinerary.coverPhotoUrl 
    ? getSafeImageUrl(itinerary.coverPhotoUrl) 
    : (defaultCoverBase64 || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop');

  const getItineraryImages = () => {
    const images = [];
    if (itinerary.coverPhotoUrl) images.push(getSafeImageUrl(itinerary.coverPhotoUrl));
    days.forEach((day) => {
      if (day.imageUrl) images.push(getSafeImageUrl(day.imageUrl));
      const events = day.events || [];
      events.forEach((ev) => {
        if (ev.imageUrl) images.push(getSafeImageUrl(ev.imageUrl));
      });
    });
    const fallbacks = [
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop'
    ];
    while (images.length < 5) {
      images.push(fallbacks[images.length]);
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
        <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(15, 61, 47, 0.6), rgba(15, 61, 47, 0.1));"></div>
        <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; gap: 8px; background: rgba(15, 61, 47, 0.85); border: 1px solid var(--pdf-accent); border-radius: 30px; padding: 4px 20px; color: white;">
          <span style="font-size: 11px;">📅</span>
          <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Day Wise Itinerary</span>
        </div>
      </div>

      <!-- Content -->
      <div class="page-content" style="margin-top: 4mm; position: relative;">
        <!-- Day and Date Info Section -->
        <div style="display: flex; gap: 15px; align-items: flex-start; margin-bottom: 3mm; text-align: left;">
          <!-- Day Badge Ribbon -->
          <div style="width: 20mm; height: 18mm; background: var(--pdf-primary); border: 1.5px solid var(--pdf-accent); border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; flex-shrink: 0; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <span style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 800; line-height: 1;">${dayOrdinal}</span>
            <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 700; text-transform: uppercase; color: var(--pdf-accent); letter-spacing: 0.5px; margin-top: 2px;">Day</span>
          </div>
          
          <div>
            <span style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              <span>📅</span> <span>${dayDateStr}</span>
            </span>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--pdf-primary); margin: 0 0 2px 0; line-height: 1.25;">
              ${escapeHtml(day.title || 'Sightseeing & Leisure')}
            </h3>
            <span style="font-family: 'EB Garamond', serif; font-size: 10px; color: #666; font-style: italic; display: block;">
              📍 Approx Distance: ${escapeHtml(dayMeta.distance)} &bull; Est. Travel Time: ${escapeHtml(dayMeta.duration)}
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
        <div style="font-family: 'EB Garamond', serif; font-size: 12.5px; line-height: 1.5; color: #333; text-align: justify; height: 44mm; overflow: hidden; margin-bottom: 4mm;">
          ${escapeHtml(day.description || 'Spend the day exploring local sights and experiencing the unique culture and cuisine. Relax at your leisure and enjoy the beautiful mountain scenery.')}
        </div>

        <!-- Day Info Badges Bar -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: auto; padding-top: 8px; border-top: 1px dashed #efe4d2;">
          <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 4px; text-align: center; display: flex; flex-direction: column; justify-content: center; height: 12mm; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
            <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px;">📏 Distance</span>
            <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-weight: 600; color: var(--pdf-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px;">${escapeHtml(dayMeta.distance)}</span>
          </div>
          <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 4px; text-align: center; display: flex; flex-direction: column; justify-content: center; height: 12mm; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
            <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">⏱️ Est. Time</span>
            <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-weight: 600; color: var(--pdf-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px;">${escapeHtml(dayMeta.duration)}</span>
          </div>
          <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 4px; text-align: center; display: flex; flex-direction: column; justify-content: center; height: 12mm; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
            <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">🚗 Transfer</span>
            <span style="font-family: 'EB Garamond', serif; font-size: 9.5px; font-weight: 600; color: var(--pdf-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px;">${escapeHtml(dayMeta.transfer)}</span>
          </div>
          <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 4px; text-align: center; display: flex; flex-direction: column; justify-content: center; height: 12mm; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
            <span style="font-family: 'Montserrat', sans-serif; font-size: 6px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">🏨 Overnight Stay</span>
            <span style="font-family: 'EB Garamond', serif; font-size: 9.5px; font-weight: 600; color: var(--pdf-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px;">${escapeHtml(dayMeta.stay)}</span>
          </div>
        </div>
      </div>

      <!-- Bottom Silhouette Background -->
      ${pdfBottomSilhouette ? `<div style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; background-image: url('${pdfBottomSilhouette}'); background-size: cover; background-position: center; opacity: 0.15; pointer-events: none;"></div>` : `
      <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; opacity: 0.15; pointer-events: none;">
        <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
        <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
      </svg>
      `}

      <!-- Standard Footer -->
      <div class="page-footer">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-family: 'Montserrat', sans-serif; font-size: 8px; color: white; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
          <span>🌐 ${escapeHtml(companyWeb)}</span>
          <span>📞 ${escapeHtml(companyPhone)}</span>
          <span>✉️ ${escapeHtml(companyEmail)}</span>
        </div>
      </div>
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
            height: 14mm;
            background: var(--pdf-primary);
            border-top: 2px solid var(--pdf-accent);
            padding: 0 15mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 10;
          }
          
          .page-content {
            width: 100%;
            height: 100%;
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
              <div style="background: white; border-radius: 8px; border: 1.5px solid var(--pdf-accent); box-shadow: 0 8px 24px rgba(0,0,0,0.06); display: grid; grid-template-columns: repeat(4, 1fr); align-items: center; text-align: center; padding: 12px 10px;">
                <div style="border-right: 1px solid #efe4d2; display: flex; flex-direction: column; align-items: center;">
                  <span style="font-size: 10px; margin-bottom: 2px;">📅</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Departure</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); margin-top: 2px;">
                    ${fromDate ? new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Season TBD'}
                  </span>
                </div>
                <div style="border-right: 1px solid #efe4d2; display: flex; flex-direction: column; align-items: center;">
                  <span style="font-size: 10px; margin-bottom: 2px;">⏱️</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Duration</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); margin-top: 2px;">
                    ${computedTotalDays} Days
                  </span>
                </div>
                <div style="border-right: 1px solid #efe4d2; display: flex; flex-direction: column; align-items: center;">
                  <span style="font-size: 10px; margin-bottom: 2px;">👥</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Guests</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); margin-top: 2px; line-height: 1.1;">
                    ${itinerary.adults || 2} Adults
                  </span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <span style="font-size: 10px; margin-bottom: 2px;">🎟️</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Trip ID</span>
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
              <div style="text-align: right; margin-top: 5mm;">
                <span style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1px; text-transform: uppercase;">${escapeHtml(titleFallback)}</span>
                <span style="font-family: 'EB Garamond', serif; font-size: 10px; font-style: italic; color: var(--pdf-accent); display: block; margin-top: 2px;">${computedTotalDays} Days / ${Math.max(1, computedTotalDays - 1)} Nights</span>
              </div>
            </div>

            <!-- Hero Image with Overlay -->
            <div style="height: 125mm; width: 100%; margin-top: 28mm; position: relative; background-image: url('${pdfCoverPhoto || coverImageUrl}'); background-size: cover; background-position: center; border-bottom: 2px solid var(--pdf-accent);">
              <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(15, 61, 47, 0.25), rgba(15, 61, 47, 0.75));"></div>
              <div style="position: absolute; bottom: 15mm; left: 15mm; color: white; text-align: left; max-width: 75%;">
                <h2 style="font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 800; color: white; margin: 0; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.1; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                  ${escapeHtml(titleFallback).replace('&', '<br/>&')}
                </h2>
                <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
                  <div style="width: 40px; height: 1px; background: var(--pdf-accent);"></div>
                  <span style="color: var(--pdf-accent); font-size: 8px;">🌾</span>
                  <div style="width: 40px; height: 1px; background: var(--pdf-accent);"></div>
                </div>
                <p style="font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 500; color: #f4f7f2; margin: 0; line-height: 1.4; text-shadow: 0 2px 4px rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 0.5px;">
                  ${escapeHtml(subtitleFallback).replace('•', '<br/>•')}
                </p>
              </div>
            </div>

            <!-- Overlapping Meta Card -->
            <div style="position: absolute; top: 140mm; left: 15mm; right: 15mm; height: 22mm; background: white; border-radius: 8px; border: 1.5px solid var(--pdf-accent); box-shadow: 0 8px 20px rgba(0,0,0,0.06); z-index: 10; display: grid; grid-template-columns: repeat(4, 1fr); align-items: center; text-align: center; padding: 0 10px;">
              <div style="border-right: 1px solid #efe4d2; height: 14mm; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                  <span style="font-size: 10px; color: var(--pdf-accent);">📅</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Departure</span>
                </div>
                <span style="font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: var(--pdf-primary);">
                  ${fromDate ? new Date(fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Season TBD'}
                </span>
              </div>
              <div style="border-right: 1px solid #efe4d2; height: 14mm; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                  <span style="font-size: 10px; color: var(--pdf-accent);">⏱️</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Duration</span>
                </div>
                <span style="font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: var(--pdf-primary);">
                  ${computedTotalDays} Days / ${Math.max(1, computedTotalDays - 1)} Nights
                </span>
              </div>
              <div style="border-right: 1px solid #efe4d2; height: 14mm; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                  <span style="font-size: 10px; color: var(--pdf-accent);">👥</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Guests</span>
                </div>
                <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); line-height: 1.1;">
                  ${itinerary.adults || 2} Adults ${itinerary.children ? `<br/><span style="font-family: 'Montserrat', sans-serif; font-size: 7px; color: var(--pdf-accent);">${itinerary.children} Child</span>` : ''}
                </span>
              </div>
              <div style="height: 14mm; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                  <span style="font-size: 10px; color: var(--pdf-accent);">🎟️</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Trip ID</span>
                </div>
                <span style="font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: var(--pdf-primary);">
                  ${itinerary.queryCode || itinerary.id?.slice(0, 8).toUpperCase() || 'TBD'}
                </span>
              </div>
            </div>

            <!-- Bottom Columns: Consultant & About -->
            <div style="margin-top: 18mm; padding: 0 15mm; display: flex; justify-content: space-between; align-items: flex-start; gap: 30px; text-align: left;">
              <div style="width: 48%; border-right: 1px solid #efe4d2; padding-right: 20px;">
                <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Travel Consultant</span>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: #efe4d2; border: 1.5px solid var(--pdf-accent); display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 14px;">👤</span>
                  </div>
                  <div>
                    <span style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: var(--pdf-primary); display: block;">Aditya Patel</span>
                    <span style="font-family: 'EB Garamond', serif; font-size: 10px; color: var(--pdf-accent); font-style: italic;">Holiday Specialist</span>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: #444; font-family: 'EB Garamond', serif;">
                  <span>📞 ${escapeHtml(companyPhone)}</span>
                  <span>✉️ ${escapeHtml(companyEmail)}</span>
                </div>
              </div>

              <div style="width: 48%; display: flex; flex-direction: column; justify-content: space-between; height: 30mm;">
                <div>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">About This Journey</span>
                  <p style="font-family: 'EB Garamond', serif; font-size: 12px; color: #444; line-height: 1.4; margin: 0; text-align: justify;">
                    Experience the perfect blend of serene tea gardens, majestic mountains, spiritual heritage, and charming hill towns. A journey curated to give you unforgettable memories.
                  </p>
                </div>
                <div style="font-family: 'Satisfy', cursive; font-size: 15px; color: var(--pdf-accent); border-top: 1px dashed #efe4d2; padding-top: 4px; text-align: right; margin-top: auto;">
                  Let's plan your perfect escape!
                </div>
              </div>
            </div>

            <!-- Bottom Silhouette Background -->
            ${pdfBottomSilhouette ? `<div style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 25mm; background-image: url('${pdfBottomSilhouette}'); background-size: cover; background-position: center; opacity: 0.15; pointer-events: none;"></div>` : `
            <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 25mm; opacity: 0.15; pointer-events: none;">
              <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
              <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
            </svg>
            `}

            <!-- Bottom Footer Bar -->
            <div class="page-footer">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-family: 'Montserrat', sans-serif; font-size: 8px; color: white; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
                <span>🌐 ${escapeHtml(companyWeb)}</span>
                <span>📞 ${escapeHtml(companyPhone)}</span>
                <span>✉️ ${escapeHtml(companyEmail)}</span>
              </div>
            </div>
          `}

        <!-- PAGE 2: WELCOME & ACCOMMODATION -->
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
          <div class="page-content" style="margin-top: 10mm;">
            <!-- Greeting & Background Watermark -->
            <div style="position: relative; text-align: left; margin-bottom: 4mm;">
              <!-- Faint Train Background Watermark -->
              ${pdfWatermark ? `<div style="position: absolute; right: 0; top: -10mm; width: 45mm; height: 35mm; background-image: url('${pdfWatermark}'); background-size: contain; background-repeat: no-repeat; opacity: 0.12; pointer-events: none;"></div>` : `
              <svg viewBox="0 0 100 80" style="position: absolute; right: 0; top: -5mm; width: 40mm; height: 30mm; opacity: 0.08; fill: var(--pdf-primary); pointer-events: none;">
                <path d="M10 50 L90 50 L90 52 L10 52 Z M20 30 L45 30 L40 50 L25 50 Z M48 30 L70 30 L65 50 L53 50 Z M75 35 L85 35 L80 50 L77 50 Z M15 45 C15 40, 20 40, 20 45 Z" />
              </svg>
              `}
              <h2 style="font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--pdf-primary); margin: 0 0 2px 0;">
                Hello ${escapeHtml(guestName)},
              </h2>
              <p style="font-family: 'EB Garamond', serif; font-size: 13.5px; color: #444; line-height: 1.45; margin: 0;">
                Thank you for choosing ${escapeHtml(companyName)}.<br/>
                We have carefully curated this journey through the tea gardens, monasteries and mountain landscapes of ${escapeHtml(destinations)}.<br/>
                Below is your accommodation and travel summary.
              </p>
            </div>

            <!-- TRIP SUMMARY Card -->
            <div style="background: white; border: 1.5px solid #efe4d2; border-radius: 8px; margin-bottom: 5mm; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
              <div style="background: var(--pdf-primary); padding: 4px 15px; color: white; text-align: left; font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                Trip Summary
              </div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); align-items: center; text-align: center; padding: 10px 5px; height: 16mm;">
                <div style="border-right: 1px solid #efe4d2; height: 10mm; display: flex; flex-direction: column; justify-content: center;">
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Destination</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px;">${escapeHtml(destinations)}</span>
                </div>
                <div style="border-right: 1px solid #efe4d2; height: 10mm; display: flex; flex-direction: column; justify-content: center;">
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Travel Dates</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 9px; font-weight: 700; color: var(--pdf-primary);">${dateString}</span>
                </div>
                <div style="border-right: 1px solid #efe4d2; height: 10mm; display: flex; flex-direction: column; justify-content: center;">
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Guests</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 9px; font-weight: 700; color: var(--pdf-primary);">${itinerary.adults || 2} Adults ${itinerary.children ? `• ${itinerary.children} Child` : ''}</span>
                </div>
                <div style="height: 10mm; display: flex; flex-direction: column; justify-content: center;">
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Trip ID</span>
                  <span style="font-family: 'Playfair Display', serif; font-size: 10px; font-weight: 700; color: var(--pdf-primary);">${itinerary.queryCode || itinerary.id?.slice(0, 8).toUpperCase() || 'TBD'}</span>
                </div>
              </div>
            </div>

            <!-- ACCOMMODATION section -->
            <div style="background: white; border: 1.5px solid #efe4d2; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 5mm;">
              <div style="background: var(--pdf-primary); padding: 4px 15px; color: white; text-align: left; font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                <span>🏨</span> <span>Your Accommodation</span>
              </div>
              
              <!-- Stay Detail Grid -->
              ${(() => {
                if (stays.length === 0) return `<div style="padding: 15px; font-style: italic; color: #666;">No accommodation settings specified. Stays will be managed as per flow.</div>`;
                const firstStay = stays[0];
                const stayImage = firstStay.imageUrl ? getSafeImageUrl(firstStay.imageUrl) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop';
                const hotelName = firstStay.metadata?.hotelName || firstStay.title || 'Premium Hotel';
                const roomType = firstStay.metadata?.roomType || 'Deluxe Room';
                const mealPlan = firstStay.metadata?.mealPlan || 'Breakfast + Dinner Included';
                const destination = firstStay.destination || 'Sikkim';
                const nightsCount = firstStay.metadata?.nights || 3;
                
                const checkInDate = fromDate 
                  ? new Date(new Date(fromDate).getTime() + (firstStay.dayNumber - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Day ' + firstStay.dayNumber;
                
                const checkOutDate = fromDate
                  ? new Date(new Date(fromDate).getTime() + (firstStay.dayNumber - 1 + nightsCount) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Day ' + (firstStay.dayNumber + nightsCount);

                return `
                <div style="display: flex; height: 50mm;">
                  <!-- Left side: Image and details bar -->
                  <div style="width: 48%; position: relative; border-right: 1.5px solid #efe4d2;">
                    <div style="height: 40mm; background-image: url('${stayImage}'); background-size: cover; background-position: center;"></div>
                    <!-- Check-in / out bar -->
                    <div style="height: 10mm; background: var(--pdf-primary); display: grid; grid-template-columns: repeat(3, 1fr); align-items: center; text-align: center; color: white; font-family: 'Montserrat', sans-serif; font-size: 6px;">
                      <div style="border-right: 0.5px solid rgba(255,255,255,0.2); height: 7mm; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-weight: 500; opacity: 0.8; text-transform: uppercase;">Check-in</span>
                        <span style="font-weight: 700; margin-top: 1px;">${checkInDate}</span>
                      </div>
                      <div style="border-right: 0.5px solid rgba(255,255,255,0.2); height: 7mm; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-weight: 500; opacity: 0.8; text-transform: uppercase;">Check-out</span>
                        <span style="font-weight: 700; margin-top: 1px;">${checkOutDate}</span>
                      </div>
                      <div style="height: 7mm; display: flex; flex-direction: column; justify-content: center;">
                        <span style="font-weight: 500; opacity: 0.8; text-transform: uppercase;">Nights</span>
                        <span style="font-weight: 700; margin-top: 1px;">${nightsCount} Night${nightsCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Right side: Hotel specifications -->
                  <div style="width: 52%; padding: 12px 18px; display: flex; flex-direction: column; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                      <span style="font-size: 10px; color: var(--pdf-accent);">📍</span>
                      <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(destination)}</span>
                    </div>
                    <h3 style="font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--pdf-primary); margin: 0 0 4px 0; line-height: 1.2;">
                      ${escapeHtml(hotelName)}
                    </h3>
                    <div style="display: flex; gap: 2px; margin-bottom: 12px; font-size: 10px; color: var(--pdf-accent);">
                      ⭐⭐⭐⭐⭐
                    </div>
                    
                    <div style="border-top: 1px dashed #efe4d2; padding-top: 10px;">
                      <span style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 5px;">Stay Details</span>
                      <ul style="margin: 0; padding: 0 0 0 12px; font-family: 'EB Garamond', serif; font-size: 12.5px; color: #444; display: flex; flex-direction: column; gap: 4px;">
                        <li><strong>Room Type</strong>: ${escapeHtml(roomType)}</li>
                        <li><strong>Meal Plan</strong>: ${escapeHtml(mealPlan)}</li>
                        <li><strong>Inclusions</strong>: Double Sharing Room & Taxes</li>
                        <li><strong>Stay Duration</strong>: ${nightsCount} Nights Overnight</li>
                      </ul>
                    </div>
                  </div>
                </div>
                `;
              })()}
            </div>

            <!-- WHY YOU'LL LOVE THIS STAY -->
            <div style="text-align: center; margin-bottom: 5mm;">
              <span style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; position: relative;">
                Why You'll Love This Stay
                <div style="width: 30px; height: 1px; background: var(--pdf-accent); display: inline-block; margin: 0 10px; vertical-align: middle;"></div>
                🌾
                <div style="width: 30px; height: 1px; background: var(--pdf-accent); display: inline-block; margin: 0 10px; vertical-align: middle;"></div>
              </span>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 6px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
                  <span style="font-size: 14px; display: block; margin-bottom: 3px;">🏔️</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: var(--pdf-primary); display: block; margin-bottom: 2px;">Scenic Surroundings</span>
                  <span style="font-family: 'EB Garamond', serif; font-size: 9.5px; color: #666; line-height: 1.25; display: block;">Beautiful views of hills and mist-covered valleys.</span>
                </div>
                <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 6px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
                  <span style="font-size: 14px; display: block; margin-bottom: 3px;">📍</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: var(--pdf-primary); display: block; margin-bottom: 2px;">Prime Location</span>
                  <span style="font-family: 'EB Garamond', serif; font-size: 9.5px; color: #666; line-height: 1.25; display: block;">Centrally located, close to local viewpoints.</span>
                </div>
                <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 6px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
                  <span style="font-size: 14px; display: block; margin-bottom: 3px;">👨‍👩‍👧‍👦</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: var(--pdf-primary); display: block; margin-bottom: 2px;">Family Friendly</span>
                  <span style="font-family: 'EB Garamond', serif; font-size: 9.5px; color: #666; line-height: 1.25; display: block;">Spacious rooms with comfortable amenities.</span>
                </div>
                <div style="background: white; border: 1px solid #efe4d2; border-radius: 6px; padding: 6px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
                  <span style="font-size: 14px; display: block; margin-bottom: 3px;">🍜</span>
                  <span style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 700; color: var(--pdf-primary); display: block; margin-bottom: 2px;">Local Experiences</span>
                  <span style="font-family: 'EB Garamond', serif; font-size: 9.5px; color: #666; line-height: 1.25; display: block;">Enjoy delicious local cuisine and warm hospitality.</span>
                </div>
              </div>
            </div>

            <!-- PACKAGE VALUE section -->
            ${sellingPrice ? `
            <div style="margin-top: auto; margin-bottom: 2mm; text-align: center;">
              <div style="display: inline-block; background: white; border: 1.5px solid var(--pdf-accent); border-radius: 8px; padding: 8px 30px; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
                <span style="position: absolute; left: 6px; top: 50%; transform: translateY(-50%) rotate(-45deg); font-size: 20px; color: var(--pdf-accent); opacity: 0.6;">🌿</span>
                <span style="position: absolute; right: 6px; top: 50%; transform: translateY(-50%) rotate(45deg); font-size: 20px; color: var(--pdf-accent); opacity: 0.6;">🌿</span>
                
                <span style="font-family: 'Montserrat', sans-serif; font-size: 7px; font-weight: 700; color: var(--pdf-primary); letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 2px;">Package Value</span>
                <span style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: var(--pdf-primary); line-height: 1;">
                  ₹${sellingPrice.toLocaleString('en-IN')}/-
                </span>
                <span style="font-family: 'EB Garamond', serif; font-size: 9px; color: #666; font-style: italic; display: block; margin-top: 1px;">Inclusive of GST</span>
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Bottom Silhouette Background -->
          ${pdfBottomSilhouette ? `<div style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; background-image: url('${pdfBottomSilhouette}'); background-size: cover; background-position: center; opacity: 0.15; pointer-events: none;"></div>` : `
          <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; opacity: 0.15; pointer-events: none;">
            <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
            <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
          </svg>
          `}

          <!-- Standard Footer -->
          <div class="page-footer">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-family: 'Montserrat', sans-serif; font-size: 8px; color: white; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
              <span>🌐 ${escapeHtml(companyWeb)}</span>
              <span>📞 ${escapeHtml(companyPhone)}</span>
              <span>✉️ ${escapeHtml(companyEmail)}</span>
            </div>
          </div>
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

          <!-- Horizontal Illustration Banner -->
          <div style="height: 36mm; width: 100%; margin-top: 10mm; border-radius: 6px; border: 1.5px solid var(--pdf-accent); background-image: url('${pdfHeaderBanner || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800'}'); background-size: cover; background-position: center; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(15, 61, 47, 0.6), rgba(15, 61, 47, 0.1));"></div>
            <div style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: white; text-align: left;">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin: 0 0 2px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Transportation</h3>
              <p style="font-family: 'Montserrat', sans-serif; font-size: 7.5px; font-weight: 600; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 1px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Curated transit details & fleet services</p>
            </div>
          </div>

          <!-- Content -->
          <div class="page-content" style="margin-top: 4mm;">
            <div style="background: var(--pdf-primary); padding: 4px 15px; color: white; text-align: left; font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px 4px 0 0;">
              🚍 Transportation Used: Private SUV (Innova / Xylo / Similar)
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

                    let icon = '🚗';
                    if (tr.dayNumber === 1) icon = '🚂';
                    else if (tr.dayNumber === totalDays) icon = '🛫';
                    else if (tr.dayNumber % 2 === 0) icon = '🔭';
                    else icon = '⛰️';

                    return `
                    <tr style="border-bottom: 1px solid #efe4d2; background: ${idx % 2 === 1 ? '#fafcf9' : 'white'};">
                      <td style="padding: 10px 12px; vertical-align: middle; text-align: center;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--pdf-primary); border: 1.5px solid var(--pdf-accent); display: flex; align-items: center; justify-content: center; color: white; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; margin: 0 auto 3px;">
                          ${icon}
                        </div>
                        <span style="font-family: 'Montserrat', sans-serif; font-size: 6.5px; font-weight: 700; color: #888; text-transform: uppercase; display: block;">${dayDate}</span>
                      </td>
                      <td style="padding: 10px 15px; vertical-align: middle; text-align: left;">
                        <h4 style="font-family: 'Playfair Display', serif; font-size: 12.5px; font-weight: 700; color: var(--pdf-primary); margin: 0 0 3px 0; line-height: 1.2;">
                          ${escapeHtml(tr.title || `Day ${tr.dayNumber} Transit`)}
                        </h4>
                        <p style="font-family: 'EB Garamond', serif; font-size: 12px; color: #555; margin: 0; line-height: 1.4;">
                          ${escapeHtml(tr.description || 'Private transfers as per route.')}
                        </p>
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
          ${pdfBottomSilhouette ? `<div style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; background-image: url('${pdfBottomSilhouette}'); background-size: cover; background-position: center; opacity: 0.15; pointer-events: none;"></div>` : `
          <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; opacity: 0.15; pointer-events: none;">
            <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
            <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
          </svg>
          `}

          <!-- Standard Footer -->
          <div class="page-footer">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-family: 'Montserrat', sans-serif; font-size: 8px; color: white; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
              <span>🌐 ${escapeHtml(companyWeb)}</span>
              <span>📞 ${escapeHtml(companyPhone)}</span>
              <span>✉️ ${escapeHtml(companyEmail)}</span>
            </div>
          </div>
        </div>

        ${daysHtml}

        <!-- PAGE 5: TERMS & GALLERY -->
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
          <div class="page-content" style="margin-top: 10mm;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3mm; text-align: left;">
              <span style="font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 700; color: var(--pdf-accent); letter-spacing: 1px; text-transform: uppercase;">Visual Gallery</span>
              <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 600; color: #888;">Memories & Sights</span>
            </div>

            <!-- Gallery Grid -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 5mm;">
              ${gridImages.slice(0, 4).map((img) => `
                <div style="height: 25mm; background-image: url('${img}'); background-size: cover; background-position: center; border-radius: 4px; border: 1.5px solid #efe4d2; box-shadow: 0 2px 8px rgba(0,0,0,0.02);"></div>
              `).join('')}
            </div>

            <!-- Policy Section -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; height: 95mm; overflow: hidden; margin-bottom: 5mm;">
              <div style="display: flex; flex-direction: column;">
                <div style="background: var(--pdf-primary); border-left: 3px solid var(--pdf-accent); padding: 4px 10px; margin-bottom: 8px; border-radius: 0 3px 3px 0;">
                  <h4 style="font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; margin: 0; letter-spacing: 1px;">Package Inclusions</h4>
                </div>
                <div style="font-family: 'EB Garamond', serif; font-size: 11px; line-height: 1.4; color: #444; overflow: auto; padding-right: 5px;">
                  ${itinerary.inclusionsHtml || '<p>&bull; Accommodation as per selection<br/>&bull; Daily breakfast at all hotels<br/>&bull; Private transfers & sightseeing as per itinerary<br/>&bull; Driver allowances, toll taxes, and parking fees</p>'}
                </div>
              </div>
              
              <div style="display: flex; flex-direction: column;">
                <div style="background: #5c1d1d; border-left: 3px solid var(--pdf-accent); padding: 4px 10px; margin-bottom: 8px; border-radius: 0 3px 3px 0;">
                  <h4 style="font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; margin: 0; letter-spacing: 1px;">Package Exclusions</h4>
                </div>
                <div style="font-family: 'EB Garamond', serif; font-size: 11px; line-height: 1.4; color: #444; overflow: auto; padding-right: 5px;">
                  ${itinerary.exclusionsHtml || '<p>&bull; Airfare / Train fare to destination<br/>&bull; Personal expenses like laundry, phone calls, tips<br/>&bull; Entry fees at sightseeing points & adventure activity costs<br/>&bull; Any meal not specified in inclusions</p>'}
                </div>
              </div>
            </div>

            <!-- T&C Section -->
            ${itinerary.packageTerms ? `
            <div style="border-top: 1px dashed #efe4d2; padding-top: 8px; text-align: left; height: 35mm; overflow: hidden; margin-top: auto;">
              <span style="font-family: 'Montserrat', sans-serif; font-size: 8px; font-weight: 700; color: var(--pdf-accent); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Terms & Conditions</span>
              <div style="font-family: 'EB Garamond', serif; font-size: 10px; line-height: 1.35; color: #666; overflow: auto; padding-right: 5px;">
                ${itinerary.packageTerms}
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Bottom Silhouette Background -->
          ${pdfBottomSilhouette ? `<div style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; background-image: url('${pdfBottomSilhouette}'); background-size: cover; background-position: center; opacity: 0.15; pointer-events: none;"></div>` : `
          <svg viewBox="0 0 800 100" preserveAspectRatio="none" style="position: absolute; bottom: 12mm; left: 0; width: 100%; height: 20mm; opacity: 0.15; pointer-events: none;">
            <path d="M0 100 L50 70 L120 85 L200 60 L280 75 L380 45 L480 70 L580 50 L680 80 L800 65 L800 100 Z" fill="#94a3b8" />
            <path d="M0 100 L80 80 L160 90 L240 70 L340 85 L440 60 L540 80 L640 70 L720 90 L800 75 L800 100 Z" fill="#cbd5e1" />
          </svg>
          `}

          <!-- Standard Footer -->
          <div class="page-footer">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-family: 'Montserrat', sans-serif; font-size: 8px; color: white; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
              <span>🌐 ${escapeHtml(companyWeb)}</span>
              <span>📞 ${escapeHtml(companyPhone)}</span>
              <span>✉️ ${escapeHtml(companyEmail)}</span>
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
  generateItineraryHtml,
};
