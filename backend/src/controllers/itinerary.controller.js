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

  const PREMIUM_ICONS = {
    accommodation: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22v-5a2 2 0 0 1 4 0v5"/><path d="M2 22h20"/><path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18"/><path d="M9 7h1"/><path d="M9 11h1"/><path d="M14 7h1"/><path d="M14 11h1"/></svg>',
    sightseeing: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>',
    transport: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-2.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1-4 0m0 0H9m-4 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1-4 0"/></svg>',
    flight: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
    meal: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
    activity: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    default: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 8 4 4-4 4"/><path d="M8 12h8"/></svg>'
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

          @media print {
            body { zoom: 0.92; } /* Slight downscale for better compression and fit */
            img { max-height: 600px; object-fit: contain; } /* Compress large gallery photos for PDF */
            .no-print { display: none; }
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
            grid-template-columns: repeat(3, 1fr); 
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
          .meta-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
          .meta-badge { 
            background: #fff; 
            border: 1px solid #d4af37; 
            color: #8b6e4b; 
            padding: 4px 12px; 
            border-radius: 4px; 
            font-size: 11px; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
          }
          .event-info .soft-note { font-family: 'EB Garamond', serif; font-size: 16px; color: #555; margin: 4px 0; font-style: italic; }
          .event-image { margin-top: 15px; }
          .event-image img { max-width: 80%; border-radius: 8px; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.08); max-height: 250px; object-fit: cover; }

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
          <!-- BRAND & CONTACT IDENTITY SECTION (TOP) -->
          <div style="padding: 20px 60px 40px; text-align: center; page-break-after: avoid; background: white;">
            <!-- Logo Placeholder Box -->
            <div style="width: 200px; height: 80px; border: 1.5px dashed #ccc; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; border-radius: 4px;">
              [ Logo Space ]
            </div>
            
            <div style="display: flex; justify-content: center; gap: 35px; font-family: 'Montserrat', sans-serif; font-size: 11px; color: #555; font-weight: 500;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width: 16px; height: 16px;" />
                <span>+91 98765 43210</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Email_icon.svg" alt="Email" style="width: 16px; height: 16px;" />
                <span>info@imagicaholidays.com</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                <span>www.imagicaholidays.com</span>
              </div>
            </div>

            <div style="display: flex; justify-content: center; gap: 35px; font-family: 'Montserrat', sans-serif; font-size: 11px; color: #555; font-weight: 500; margin-top: 15px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <span>[@instagram_username]</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b5998" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                <span>[@facebook_username]</span>
              </div>
            </div>
          </div>
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
              const dayImage = day.imageUrl;
              
              let formattedDateAttractive = '';
              if (itinerary.travelDateFrom) {
                const dayDate = new Date(itinerary.travelDateFrom);
                dayDate.setDate(dayDate.getDate() + (day.dayNumber - 1));
                
                const getOrdinalNum = (n) => n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
                const weekday = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
                const dayOfMonth = getOrdinalNum(dayDate.getDate());
                const month = dayDate.toLocaleDateString('en-US', { month: 'long' });
                const year = dayDate.getFullYear();
                
                formattedDateAttractive = `${weekday}, ${dayOfMonth} of ${month} ${year}`;
              }

              return `
              <div class="day-entry">
                <div class="day-title-wrap">
                  <span class="day-number">Day ${day.dayNumber}</span>
                  <div style="display: flex; flex-direction: column;">
                    <h3>${escapeHtml(day.title || 'In Search of Magic')}</h3>
                    ${formattedDateAttractive ? `<div style="font-family: 'Dancing Script', cursive; font-size: 20px; color: #d4af37; margin-top: 6px; letter-spacing: 1px;">${formattedDateAttractive}</div>` : ''}
                  </div>
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
            }).join('') || '<div class="handwritten" style="text-align: center; font-size: 32px; margin: 60px 0;">Your custom journey awaits...</div>'}

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

            <!-- BRAND & CONTACT IDENTITY SECTION (BOTTOM) -->
            <div style="text-align: center; padding: 40px; border-top: 1px solid #eee; margin-top: 40px; page-break-inside: avoid; background: white;">
              <!-- Logo Placeholder Box -->
              <div style="width: 200px; height: 80px; border: 1.5px dashed #ccc; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; border-radius: 4px;">
                [ Logo Space ]
              </div>
              
              <div style="display: flex; justify-content: center; gap: 35px; font-family: 'Montserrat', sans-serif; font-size: 11px; color: #555; font-weight: 500;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width: 16px; height: 16px;" />
                  <span>+91 98765 43210</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Email_icon.svg" alt="Email" style="width: 16px; height: 16px;" />
                  <span>info@imagicaholidays.com</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  <span>www.imagicaholidays.com</span>
                </div>
              </div>

              <div style="display: flex; justify-content: center; gap: 35px; font-family: 'Montserrat', sans-serif; font-size: 11px; color: #555; font-weight: 500; margin-top: 15px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  <span>[@instagram_username]</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b5998" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  <span>[@facebook_username]</span>
                </div>
              </div>
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
