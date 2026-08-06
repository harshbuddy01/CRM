// ============================================================
// TravelCRM — Clean Minimalist Luxury Travel Proposal Template
// Inspired by Virtuoso & Black Tomato Luxury Travel Design
// ============================================================

/**
 * Optimizes image URLs by injecting compression parameters (Cloudinary / Unsplash)
 * Uses XML/HTML escaped amp (&amp;) to ensure robust parsing across mail clients.
 */
const getOptimizedImageUrl = (url, width = 300) => {
  if (!url) return '';
  
  // 1. Optimize Cloudinary URLs
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/')) {
      return url.replace('/upload/', `/upload/w_${width},c_scale,q_auto,f_auto/`);
    }
  }
  
  // 2. Optimize Unsplash URLs
  if (url.includes('images.unsplash.com')) {
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?auto=format&amp;fit=crop&amp;w=${width}&amp;q=60`;
  }
  
  return url;
};

const getArtisanalEmailFrame = (options) => {
  const { 
    subject, 
    bodyContent, 
    inviteType = 'proposal',
    pdfDownloadUrl = '',
    viewOnlineUrl = '',
    companyLogoUrl = '',
    companyName = process.env.APP_NAME || 'Imagica Holidays',
    companySlogan = 'CURATED JOURNEYS. LASTING MEMORIES.',
    companyPhone = '8910759317',
    companyEmail = 'info@imagicaholidays.com',
    companyWebsite = 'imagicaholidays.com',
    headerTitle = 'Bespoke Travel Proposal'
  } = options;

  // Resolve relative logo URL to absolute URL using backend API_URL env prefix
  let logoUrl = companyLogoUrl || '';
  if (logoUrl && !logoUrl.startsWith('http://') && !logoUrl.startsWith('https://') && !logoUrl.startsWith('data:')) {
    const backendUrl = (process.env.API_URL || 'https://api.imagicaholidays.com').replace(/\/$/, '');
    const separator = logoUrl.startsWith('/') ? '' : '/';
    logoUrl = `${backendUrl}${separator}${logoUrl}`;
  }

  // Get optimized URLs for instant client loading
  const optimizedLogoUrl = getOptimizedImageUrl(logoUrl, 320);
  const optimizedHeroUrl = getOptimizedImageUrl('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', 600);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject || 'A Message from ' + companyName}</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #faf9f6 !important; }
    
    .body-font { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; }
    .serif-font { font-family: 'Cormorant Garamond', Georgia, serif; }

    @media screen and (max-width: 620px) {
      .main-container { width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 30px 20px !important; }
      
      /* Responsive Header */
      .mobile-hide { display: none !important; }
      .mobile-center-logo { width: 100% !important; display: block !important; text-align: center !important; }
      .header-padding { padding: 20px !important; }

      /* Arched Image Responsive Scaling */
      .outer-arch {
        width: 90% !important;
        border-radius: 180px 180px 0 0 !important;
        padding: 8px !important;
      }
      .hero-image {
        border-radius: 170px 170px 0 0 !important;
      }

      /* Stack columns inside card */
      .grid-col { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 15px !important; }
      
      /* 2x2 Value Props Grid on Mobile */
      .val-prop { display: inline-block !important; width: 48% !important; margin-bottom: 25px !important; border: none !important; vertical-align: top !important; }
      .val-prop-border { border-left: none !important; }
      
      /* Stack Footer columns */
      .footer-col { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; border-left: none !important; margin-bottom: 25px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f6;">
  <!-- MAIN OUTER TABLE -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf9f6; padding: 40px 0;">
    <tr>
      <td align="center">
        
        <!-- MAIN CONTAINER CARD -->
        <table border="0" cellpadding="0" cellspacing="0" width="620" class="main-container" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid #ebdcc5;">
          
          <!-- 1. SOPHISTICATED BRAND HEADER (RESPONSIVE MULTI-COLUMN) -->
          <tr>
            <td class="header-padding" style="background-color: #ffffff; padding: 30px 40px; border-bottom: 1px solid #f3ece0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Left Branding Text (Hidden on Mobile) -->
                  <td width="30%" align="left" class="mobile-hide body-font" style="font-size: 9px; color: #a5813b; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.5;">
                    Curated Journeys<br/><span style="color: #64748b; font-weight: 500;">Lasting Memories</span>
                  </td>
                  
                  <!-- Center Logo Container (Explicit Width to prevent collapse) -->
                  <td width="40%" align="center" class="mobile-center-logo">
                    ${optimizedLogoUrl ? `
                      <div style="display: block; margin: 0 auto; text-align: center; width: 150px; max-width: 100%;">
                        <img src="${optimizedLogoUrl}" alt="${companyName}" width="150" style="width: 100% !important; height: auto !important; display: block; margin: 0 auto; object-fit: contain;" />
                      </div>
                    ` : `
                      <div style="border: 1px solid #b89249; padding: 10px 20px; display: inline-block; background-color: #0b1a12;">
                        <div class="serif-font" style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 3px; text-transform: uppercase; line-height: 1.1;">
                          IMAGICA
                        </div>
                        <div class="serif-font" style="font-size: 8px; letter-spacing: 5px; font-weight: 500; color: #b89249; text-transform: uppercase; margin-top: 2px; line-height: 1;">
                          HOLIDAYS
                        </div>
                      </div>
                    `}
                  </td>
                  
                  <!-- Right Branding Text (Hidden on Mobile) -->
                  <td width="30%" align="right" class="mobile-hide body-font" style="font-size: 9px; color: #a5813b; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.5;">
                    Your Journey<br/><span style="color: #64748b; font-weight: 500;">Our Passion</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. HIGH-END EDITORIAL ARCHED GALLERY FRAME (ANTI-COLLAPSE RESPONSIVE) -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 40px 0 40px; text-align: center;">
              
              <!-- Outer Arch Border (Explicit width resolves circular dependency collapse on mobile) -->
              <div class="outer-arch" style="border: 1px solid #ebdcc5; border-radius: 300px 300px 0 0; padding: 12px; display: inline-block; width: 450px; max-width: 95%; box-sizing: border-box; margin: 0 auto; text-align: center;">
                
                <!-- Arched Image with Gold Border directly on the img tag (prevents collapses & stretching) -->
                <img class="hero-image" src="${optimizedHeroUrl}" width="450" style="display: block; width: 100% !important; height: auto !important; border: 3px solid #b89249; border-radius: 300px 300px 0 0; object-fit: cover;" alt="Majestic Alps" />
                
              </div>
              
              <!-- Elegant Quote Divider -->
              <div style="margin-top: 25px; margin-bottom: 5px; text-align: center;">
                <div style="color: #b89249; font-size: 14px; margin-bottom: 8px;">❖</div>
                <div class="serif-font" style="font-size: 24px; font-style: italic; color: #0b1a12; font-weight: 400; line-height: 1.4; max-width: 480px; margin: 0 auto;">
                  "To travel is to live, to live is to remember."
                </div>
                <div style="width: 40px; height: 1px; background-color: #b89249; margin: 15px auto 0 auto;"></div>
              </div>

            </td>
          </tr>

          <!-- 3. MAIN EDITORIAL BODY -->
          <tr>
            <td class="content-padding" style="padding: 35px 50px 40px 50px; background-color: #ffffff;">
              
              <!-- Greeting & Body Text -->
              <div class="body-font" style="font-size: 15px; line-height: 1.85; color: #2d3748; margin-bottom: 35px;">
                ${bodyContent}
              </div>

              <!-- 4. INVITE CARD WITH MINIMALIST STATIONERY DESIGN -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #ebdcc5; border-radius: 8px; background-color: #faf9f6; padding: 25px 30px; margin-top: 35px;">
                <tr>
                  <td>
                    <div style="border-left: 2px solid #b89249; padding-left: 15px; margin-bottom: 20px;">
                      <div class="serif-font" style="font-size: 20px; font-weight: 700; color: #0b1a12; letter-spacing: 0.5px;">Your Personal Concierge</div>
                      <div class="body-font" style="font-size: 8.5px; font-weight: 700; letter-spacing: 1.5px; color: #b89249; text-transform: uppercase; margin-top: 2px;">IMAGICA HOLIDAYS &bull; PRIVATE SERVICES</div>
                    </div>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <!-- Left Column -->
                        <td width="50%" valign="top" class="grid-col" style="padding-right: 15px;">
                          <div class="body-font" style="font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">Bookings Desk</div>
                          <div class="body-font" style="font-size: 14px; color: #1a202c; font-weight: 600; margin-bottom: 15px;">
                            ${companyPhone} <a href="https://wa.me/91${companyPhone.replace(/\D/g, '')}" style="text-decoration: none; font-size: 13px;">💬</a>
                          </div>

                          <div class="body-font" style="font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">Finance Support</div>
                          <div class="body-font" style="font-size: 14px; color: #1a202c; font-weight: 600;">
                            7889006633
                          </div>
                        </td>

                        <!-- Right Column -->
                        <td width="50%" valign="top" class="grid-col" style="padding-left: 15px;">
                          <div class="body-font" style="font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">Email Address</div>
                          <div class="body-font" style="font-size: 14px; color: #1a202c; font-weight: 600; margin-bottom: 15px;">
                            <a href="mailto:${companyEmail}" style="color: #0b1a12; text-decoration: underline;">${companyEmail}</a>
                          </div>

                          <div class="body-font" style="font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px;">Digital Portal</div>
                          <div class="body-font" style="font-size: 14px; color: #1a202c; font-weight: 600;">
                            <a href="https://${companyWebsite}" target="_blank" style="color: #0b1a12; text-decoration: underline;">${companyWebsite}</a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- 5. CALL TO ACTION BUTTONS -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 35px;">
                ${viewOnlineUrl ? `
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${viewOnlineUrl}" target="_blank" class="body-font" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #c59b27 0%, #a5813b 100%); color: #ffffff; text-align: center; padding: 18px 24px; border-radius: 4px; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; box-shadow: 0 4px 15px rgba(197,155,39,0.25);">
                      View Bespoke Itinerary &nbsp;&nbsp; →
                    </a>
                  </td>
                </tr>
                ` : ''}
                
                ${pdfDownloadUrl ? `
                <tr>
                  <td align="center" style="padding-bottom: 25px;">
                    <a href="${pdfDownloadUrl}" download target="_blank" class="body-font" style="display: block; width: 100%; box-sizing: border-box; background-color: #ffffff; color: #0b1a12; text-align: center; padding: 17px 24px; border-radius: 4px; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border: 1px solid #ebdcc5;">
                      Download Proposal PDF &nbsp;&nbsp; →
                    </a>
                  </td>
                </tr>
                ` : ''}

                <tr>
                  <td align="center">
                    <div class="body-font" style="font-size: 11px; color: #94a3b8; text-align: center; letter-spacing: 0.5px;">
                      🛡️ Secure Link. Active for 14 days.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- 6. VALUE PROPOSITION ROW (WITH GOLD SVG VECTORS) -->
          <tr>
            <td style="background-color: #faf9f6; border-top: 1px solid #ebdcc5; padding: 40px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <div class="serif-font" style="font-size: 24px; font-weight: 500; color: #b89249; font-style: italic;">The Imagica Distinction</div>
                    <div style="width: 25px; height: 1px; background-color: #b89249; margin: 10px auto 0 auto;"></div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <!-- 1st Badges -->
                        <td width="25%" align="center" valign="top" class="val-prop">
                          <div style="margin-bottom: 12px;">
                            <!-- Gold Map Pin SVG -->
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b89249" stroke-width="1.5" style="display: block; margin: 0 auto;">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                              <circle cx="12" cy="9" r="2.5" fill="#b89249"/>
                            </svg>
                          </div>
                          <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #1a202c; text-transform: uppercase; line-height: 1.4;">Curated<br/>Destinations</div>
                        </td>
                        
                        <!-- 2nd Badges -->
                        <td width="25%" align="center" valign="top" class="val-prop val-prop-border" style="border-left: 1px solid #e6dec9;">
                          <div style="margin-bottom: 12px;">
                            <!-- Gold Compass SVG -->
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b89249" stroke-width="1.5" style="display: block; margin: 0 auto;">
                              <circle cx="12" cy="12" r="9"/>
                              <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="#b89249"/>
                            </svg>
                          </div>
                          <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #1a202c; text-transform: uppercase; line-height: 1.4;">Bespoke<br/>Itineraries</div>
                        </td>
                        
                        <!-- 3rd Badges -->
                        <td width="25%" align="center" valign="top" class="val-prop val-prop-border" style="border-left: 1px solid #e6dec9;">
                          <div style="margin-bottom: 12px;">
                            <!-- Gold Support SVG -->
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b89249" stroke-width="1.5" style="display: block; margin: 0 auto;">
                              <path d="M3 18c0-3.87 3.13-7 7-7h4c3.87 0 7 3.13 7 7M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                            </svg>
                          </div>
                          <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #1a202c; text-transform: uppercase; line-height: 1.4;">Concierge<br/>Assistance</div>
                        </td>
                        
                        <!-- 4th Badges -->
                        <td width="25%" align="center" valign="top" class="val-prop val-prop-border" style="border-left: 1px solid #e6dec9;">
                          <div style="margin-bottom: 12px;">
                            <!-- Gold Medal SVG -->
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b89249" stroke-width="1.5" style="display: block; margin: 0 auto;">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                          </div>
                          <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #1a202c; text-transform: uppercase; line-height: 1.4;">Uncompromising<br/>Value</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 7. EDITORIAL SLATE DARK FOOTER -->
          <tr>
            <td style="background-color: #0b1a12; padding: 50px 40px 30px 40px; border-top: 3px solid #b89249;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Footer Left Column -->
                  <td width="55%" valign="top" class="footer-col" style="padding-right: 25px;">
                    <div style="margin-bottom: 15px;">
                      ${optimizedLogoUrl ? `
                        <div style="display: block; text-align: left; width: 140px; max-width: 100%;">
                          <img src="${optimizedLogoUrl}" alt="${companyName}" width="140" style="width: 100% !important; height: auto !important; display: block; object-fit: contain; filter: brightness(0) invert(1);" />
                        </div>
                      ` : `
                        <div class="serif-font" style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 3px; line-height: 1;">
                          IMAGICA<br/><span style="font-size: 9px; letter-spacing: 5px; font-weight: 400; color: #b89249;">HOLIDAYS</span>
                        </div>
                      `}
                    </div>
                    <p class="body-font" style="color: #8da298; font-size: 12px; line-height: 1.7; margin: 0 0 20px 0;">
                      Designing exceptional luxury travel experiences around the globe. Curating memories that stay with you forever.
                    </p>
                    
                    <!-- SVG Social Links (No cheap Emojis) -->
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 15px;">
                          <a href="#" style="text-decoration: none;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b89249" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                          </a>
                        </td>
                        <td style="padding-right: 15px;">
                          <a href="#" style="text-decoration: none;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b89249" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                            </svg>
                          </a>
                        </td>
                        <td>
                          <a href="#" style="text-decoration: none;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b89249" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                            </svg>
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Footer Right Column -->
                  <td width="45%" valign="top" class="footer-col" style="padding-left: 20px; border-left: 1px solid #1c3629;">
                    <div class="serif-font" style="color: #b89249; font-size: 15px; font-weight: 600; margin-bottom: 15px; letter-spacing: 0.5px;">Bespoke Inquiries</div>
                    <table border="0" cellpadding="0" cellspacing="0" class="body-font" style="font-size: 12px; color: #8da298; line-height: 1.8;">
                      <tr>
                        <td style="color: #b89249; font-weight: 600; padding-bottom: 6px; padding-right: 8px;">M:</td>
                        <td style="color: #cbd5e1; padding-bottom: 6px;">${companyPhone}</td>
                      </tr>
                      <tr>
                        <td style="color: #b89249; font-weight: 600; padding-bottom: 6px; padding-right: 8px;">E:</td>
                        <td style="padding-bottom: 6px;"><a href="mailto:${companyEmail}" style="color: #cbd5e1; text-decoration: none;">${companyEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="color: #b89249; font-weight: 600; padding-right: 8px;">W:</td>
                        <td><a href="https://${companyWebsite}" style="color: #cbd5e1; text-decoration: none;">${companyWebsite}</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Bottom Copyright Line -->
                <tr>
                  <td colspan="2" align="center" style="padding-top: 40px;">
                    <div style="border-top: 1px solid #1c3629; padding-top: 20px; text-align: center;">
                      <span class="body-font" style="color: #556e61; font-size: 10px; letter-spacing: 1px;">
                        &copy; ${new Date().getFullYear()} ${companyName.toUpperCase()}. ALL RIGHTS RESERVED.
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
