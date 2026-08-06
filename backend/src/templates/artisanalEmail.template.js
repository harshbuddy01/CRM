// ============================================================
// TravelCRM — Premium Proposal Email Template (Gmail Compatible)
// ============================================================

const getArtisanalEmailFrame = (options) => {
  const { 
    subject, 
    bodyContent, 
    inviteType = 'proposal',
    pdfDownloadUrl = '',
    viewOnlineUrl = '',
    companyLogoUrl = '',
    companyName = process.env.APP_NAME || 'Imagica Holidays',
    companySlogan = 'CURATED JOURNEYS, LASTING MEMORIES.',
    companyPhone = '8910759317',
    companyEmail = 'info@imagicaholidays.com',
    companyWebsite = 'imagicaholidays.com',
    headerTitle = 'Your Journey Awaits'
  } = options;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject || 'A Message from ' + companyName}</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f1ea !important; }
    
    .body-font { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; }
    .serif-font { font-family: 'Playfair Display', Georgia, serif; }

    @media screen and (max-width: 620px) {
      .main-container { width: 100% !important; }
      .side-leaf { display: none !important; }
      .grid-col { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; margin-bottom: 20px !important; }
      .footer-col { display: block !important; width: 100% !important; text-align: left !important; margin-bottom: 25px !important; border: none !important; padding: 0 !important; }
      .val-prop { display: block !important; width: 100% !important; margin-bottom: 20px !important; border: none !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f1ea;">
  <!-- MAIN OUTER TABLE -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f1ea;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        
        <!-- SIDE LEAF DECORATION WRAPPER -->
        <table border="0" cellpadding="0" cellspacing="0" width="700" class="main-container">
          <tr>
            <!-- LEFT LEAF ARTWORK -->
            <td width="25" class="side-leaf" valign="middle" align="right" style="padding-right: 5px;">
              <svg width="30" height="200" viewBox="0 0 40 250" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.35">
                <path d="M35 10C20 50 5 100 5 150C5 200 25 230 35 240M35 10C25 30 10 70 20 110M35 10C15 20 5 40 10 70" stroke="#a5813b" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </td>

            <!-- MAIN CARD CONTAINER -->
            <td width="650" align="center" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e8e3d8;">
              
              <!-- 1. TOP BRAND HEADER -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; padding: 18px 30px;">
                <tr>
                  <td width="32%" align="left" class="body-font" style="font-size: 10px; color: #4b5563; font-weight: 500;">
                    Curated journeys. <span style="color: #b38b3f; font-weight: 600;">Lasting memories.</span>
                  </td>
                  <td width="36%" align="center">
                    ${companyLogoUrl ? `
                      <img src="${companyLogoUrl}" alt="${companyName}" style="max-height: 40px; display: block; margin: 0 auto;" />
                    ` : `
                      <div style="background-color: #0d1520; padding: 10px 18px; border-radius: 3px; display: inline-block;">
                        <span class="serif-font" style="font-size: 13px; color: #ffffff; font-weight: 700; letter-spacing: 3.5px; text-transform: uppercase;">
                          IMAGICA<br/><span style="font-size: 8px; letter-spacing: 5px; font-weight: 400; color: #d1d5db;">HOLIDAYS</span>
                        </span>
                      </div>
                    `}
                  </td>
                  <td width="32%" align="right" class="body-font" style="font-size: 10px; color: #4b5563; font-weight: 500;">
                    Your Journey, <span style="color: #b38b3f; font-weight: 600;">Our Passion.</span>
                  </td>
                </tr>
              </table>

              <!-- 2. HERO IMAGE WITH TROPICAL RESORT & GOLD CURVE -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="position: relative; background-color: #0b1a28;">
                    <!-- Hero Image Banner -->
                    <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop" width="650" style="width: 100%; max-width: 650px; height: auto; display: block;" alt="Your Journey Awaits" />
                  </td>
                </tr>
                <!-- Gold Curved Border Graphic -->
                <tr>
                  <td style="line-height: 0; font-size: 0; background-color: #ffffff;">
                    <svg width="100%" height="30" viewBox="0 0 650 30" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0C150 25 500 25 650 0V30H0V0Z" fill="#ffffff"/>
                      <path d="M0 2C150 27 500 27 650 2" stroke="#d4af37" stroke-width="3" fill="none"/>
                    </svg>
                  </td>
                </tr>
              </table>

              <!-- 3. MAIN BODY CONTENT -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 10px 45px 35px 45px; background-color: #ffffff;">
                <tr>
                  <td align="left" class="body-font" style="font-size: 15px; line-height: 1.7; color: #2d3748;">
                    ${bodyContent}
                  </td>
                </tr>

                <!-- 4. CONTACT PARTNER CARD -->
                <tr>
                  <td style="padding-top: 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #ebdcc5; border-radius: 12px; overflow: hidden; background-color: #fdfbf7;">
                      <tr>
                        <!-- Gold Bookmark Ribbon -->
                        <td width="55" valign="top" align="center" style="background-color: #b38b3f; padding-top: 20px; padding-bottom: 20px;">
                          <div class="serif-font" style="color: #ffffff; font-size: 26px; font-weight: 600; line-height: 1;">I</div>
                          <div style="width: 12px; height: 1px; background-color: rgba(255,255,255,0.4); margin: 8px auto;"></div>
                        </td>
                        
                        <!-- Details Grid -->
                        <td valign="top" style="padding: 22px 25px;">
                          <div style="margin-bottom: 18px;">
                            <span class="serif-font" style="font-size: 19px; font-weight: 600; color: #a5813b;">${companyName} 💼</span><br/>
                            <span class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #718096; text-transform: uppercase;">YOUR TRAVEL PARTNER</span>
                          </div>

                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <!-- Left Column -->
                              <td width="50%" valign="top" class="grid-col" style="padding-right: 10px;">
                                <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                                  <tr>
                                    <td width="34" valign="center">
                                      <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #f7ede0; text-align: center; line-height: 26px; font-size: 13px;">📞</div>
                                    </td>
                                    <td class="body-font">
                                      <span style="font-size: 11px; color: #718096; font-weight: 500;">Bookings</span><br/>
                                      <span style="font-size: 13px; color: #1a202c; font-weight: 600;">${companyPhone} <span style="color: #25d366; font-size: 12px;">💬</span></span>
                                    </td>
                                  </tr>
                                </table>

                                <table border="0" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="34" valign="center">
                                      <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #f7ede0; text-align: center; line-height: 26px; font-size: 13px;">💳</div>
                                    </td>
                                    <td class="body-font">
                                      <span style="font-size: 11px; color: #718096; font-weight: 500;">Finance</span><br/>
                                      <span style="font-size: 13px; color: #1a202c; font-weight: 600;">7889006633</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>

                              <!-- Right Column -->
                              <td width="50%" valign="top" class="grid-col" style="padding-left: 10px;">
                                <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                                  <tr>
                                    <td width="34" valign="center">
                                      <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #f7ede0; text-align: center; line-height: 26px; font-size: 13px;">✉️</div>
                                    </td>
                                    <td class="body-font">
                                      <span style="font-size: 11px; color: #718096; font-weight: 500;">Mail</span><br/>
                                      <a href="mailto:${companyEmail}" style="font-size: 13px; color: #2b6cb0; font-weight: 600; text-decoration: none;">${companyEmail}</a>
                                    </td>
                                  </tr>
                                </table>

                                <table border="0" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="34" valign="center">
                                      <div style="width: 26px; height: 26px; border-radius: 50%; background-color: #f7ede0; text-align: center; line-height: 26px; font-size: 13px;">🌐</div>
                                    </td>
                                    <td class="body-font">
                                      <span style="font-size: 11px; color: #718096; font-weight: 500;">Web</span><br/>
                                      <a href="https://${companyWebsite}" style="font-size: 13px; color: #2b6cb0; font-weight: 600; text-decoration: none;">${companyWebsite}</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 5. ACTION BUTTONS -->
                <tr>
                  <td style="padding-top: 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      ${viewOnlineUrl ? `
                      <tr>
                        <td align="center" style="padding-bottom: 14px;">
                          <a href="${viewOnlineUrl}" target="_blank" class="body-font" style="display: block; width: 100%; box-sizing: border-box; background-color: #b38b3f; color: #ffffff; text-align: center; padding: 16px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(179,139,63,0.25);">
                            👁️ VIEW PROPOSAL ONLINE &nbsp;&nbsp; →
                          </a>
                        </td>
                      </tr>
                      ` : ''}
                      
                      ${pdfDownloadUrl ? `
                      <tr>
                        <td align="center" style="padding-bottom: 20px;">
                          <a href="${pdfDownloadUrl}" download target="_blank" class="body-font" style="display: block; width: 100%; box-sizing: border-box; background-color: #0d1520; color: #ffffff; text-align: center; padding: 16px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                            📄 DOWNLOAD YOUR PROPOSAL PDF &nbsp;&nbsp; →
                          </a>
                        </td>
                      </tr>
                      ` : ''}

                      <tr>
                        <td align="center">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #edf2f7; border-radius: 8px; background-color: #faf8f5; padding: 10px;">
                            <tr>
                              <td align="center" class="body-font" style="font-size: 12px; color: #718096;">
                                🛡️ For your security, this link is valid for 14 days only.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- 6. VALUE PROPOSITION BANNER -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fcf9f2; border-top: 1px solid #f0e6d6; padding: 35px 30px;">
                <tr>
                  <td align="center" style="padding-bottom: 25px;">
                    <span class="serif-font" style="font-size: 24px; font-weight: 500; color: #a5813b; font-style: italic;">Caring for your adventure,</span><br/>
                    <span class="body-font" style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #4a5568; text-transform: uppercase; margin-top: 6px; display: inline-block;">TEAM IMAGICA HOLIDAYS</span>
                    <div style="color: #d4af37; font-size: 10px; margin-top: 6px;">❖</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="25%" align="center" valign="top" class="val-prop">
                          <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d4af37; text-align: center; line-height: 38px; font-size: 18px; margin-bottom: 10px; display: inline-block;">📍</div>
                          <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1px; color: #2d3748; text-transform: uppercase; line-height: 1.4;">HANDPICKED<br/>DESTINATIONS</div>
                        </td>
                        <td width="25%" align="center" valign="top" class="val-prop" style="border-left: 1px solid #e2e8f0;">
                          <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d4af37; text-align: center; line-height: 38px; font-size: 18px; margin-bottom: 10px; display: inline-block;">🧭</div>
                          <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1px; color: #2d3748; text-transform: uppercase; line-height: 1.4;">CUSTOM<br/>ITINERARIES</div>
                        </td>
                        <td width="25%" align="center" valign="top" class="val-prop" style="border-left: 1px solid #e2e8f0;">
                          <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d4af37; text-align: center; line-height: 38px; font-size: 18px; margin-bottom: 10px; display: inline-block;">🎧</div>
                          <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1px; color: #2d3748; text-transform: uppercase; line-height: 1.4;">24/7<br/>ASSISTANCE</div>
                        </td>
                        <td width="25%" align="center" valign="top" class="val-prop" style="border-left: 1px solid #e2e8f0;">
                          <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d4af37; text-align: center; line-height: 38px; font-size: 18px; margin-bottom: 10px; display: inline-block;">🏅</div>
                          <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1px; color: #2d3748; text-transform: uppercase; line-height: 1.4;">BEST VALUE<br/>GUARANTEE</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- 7. DARK NAVY PREMIUM FOOTER -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c1523; padding: 40px 35px 25px 35px;">
                <tr>
                  <!-- Footer Left Column -->
                  <td width="34%" valign="top" class="footer-col" style="padding-right: 15px;">
                    <div class="serif-font" style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: 2px; margin-bottom: 12px;">
                      IMAGICA<br/><span style="font-size: 10px; letter-spacing: 4px; font-weight: 400; color: #a0aec0;">HOLIDAYS</span>
                    </div>
                    <p class="body-font" style="color: #a0aec0; font-size: 11px; line-height: 1.6; margin: 0 0 16px 0;">
                      Crafting journeys that last a lifetime. Creating memories that stay forever.
                    </p>
                    <div>
                      <span style="font-size: 16px; margin-right: 8px;">📷</span>
                      <span style="font-size: 16px; margin-right: 8px;">📘</span>
                      <span style="font-size: 16px;">▶️</span>
                    </div>
                  </td>

                  <!-- Footer Middle Column -->
                  <td width="33%" valign="top" class="footer-col" style="padding: 0 15px; border-left: 1px solid #1a2638;">
                    <div class="body-font" style="color: #b38b3f; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px;">Get in touch</div>
                    <table border="0" cellpadding="0" cellspacing="0" class="body-font" style="font-size: 11px; color: #cbd5e0;">
                      <tr>
                        <td width="20" style="padding-bottom: 8px;">📞</td>
                        <td style="padding-bottom: 8px;">8910759317</td>
                      </tr>
                      <tr>
                        <td width="20" style="padding-bottom: 8px;">✉️</td>
                        <td style="padding-bottom: 8px;">info@imagicaholidays.com</td>
                      </tr>
                      <tr>
                        <td width="20">🌐</td>
                        <td>imagicaholidays.com</td>
                      </tr>
                    </table>
                  </td>

                  <!-- Footer Right Column -->
                  <td width="33%" valign="top" align="center" class="footer-col" style="padding-left: 15px; border-left: 1px solid #1a2638;">
                    <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=300&auto=format&fit=crop" width="160" style="border-radius: 8px; width: 100%; max-width: 160px; height: auto; display: block; margin-bottom: 8px; border: 1px solid #2d3748;" alt="Scenery" />
                    <span class="body-font" style="color: #e2e8f0; font-size: 10px; font-weight: 500;">Every trail tells a unique story.</span>
                    <div style="color: #b38b3f; font-size: 9px; margin-top: 4px;">— 🍁 —</div>
                  </td>
                </tr>

                <!-- Bottom Copyright Line -->
                <tr>
                  <td colspan="3" align="center" style="padding-top: 30px;">
                    <div style="border-top: 1px solid #1a2638; padding-top: 18px;">
                      <span class="body-font" style="color: #718096; font-size: 10px;">
                        &copy; 2024 Imagica Holidays. All rights reserved.
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

            </td>

            <!-- RIGHT LEAF ARTWORK -->
            <td width="25" class="side-leaf" valign="middle" align="left" style="padding-left: 5px;">
              <svg width="30" height="200" viewBox="0 0 40 250" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.35">
                <path d="M5 10C20 50 35 100 35 150C35 200 15 230 5 240M5 10C15 30 30 70 20 110M5 10C25 20 35 40 30 70" stroke="#a5813b" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = { getArtisanalEmailFrame };
