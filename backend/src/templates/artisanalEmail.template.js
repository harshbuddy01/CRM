// ============================================================
// TravelCRM — Premium Proposal Email Template
// ============================================================

const getArtisanalEmailFrame = (options) => {
  const { 
    subject, 
    bodyContent, 
    agentSignature, 
    inviteType = 'proposal',
    pdfDownloadUrl = '',
    viewOnlineUrl = '',
    companyLogoUrl = '',
    companyName = process.env.APP_NAME || 'Imagica Holidays',
    companySlogan = 'CURATED JOURNEYS. LASTING MEMORIES.',
    companyPhone = '+91 8910759317',
    companyEmail = 'info@imagicaholidays.com',
    companyWebsite = 'imagicaholidays.com',
    headerTitle = 'Your Journey Awaits'
  } = options;
  
  const displayTitle = headerTitle || 'Your Journey Awaits';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject || \`A Message from \${companyName}\`}</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #faf9f6 !important; }
    
    .body-font { font-family: 'Plus Jakarta Sans', Arial, sans-serif; }
    .heading-font { font-family: 'Playfair Display', Georgia, serif; }
    
    .btn-gold:hover { background-color: #8a6a2c !important; }
    .btn-navy:hover { background-color: #0d1624 !important; }

    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .header-col { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 10px !important; }
      .contact-grid td { display: block !important; width: 100% !important; margin-bottom: 15px !important; }
      .value-props td { display: block !important; width: 100% !important; margin-bottom: 20px !important; }
      .footer-col { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 25px !important; }
      .hero-text { font-size: 42px !important; }
      .content-padding { padding: 30px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f6;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf9f6; background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png');">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        
        <!-- Main Email Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="650" class="container" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
          
          <!-- TOP HEADER BAR -->
          <tr>
            <td style="padding: 20px 30px; background-color: #ffffff;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="30%" class="header-col" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; color: #4b5563; font-weight: 500;">
                    Curated journeys. <span style="color: #a5813b;">Lasting memories.</span>
                  </td>
                  <td width="40%" class="header-col" align="center">
                    <div style="background-color: #111928; padding: 12px 20px; border-radius: 4px; display: inline-block;">
                      <span style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #ffffff; font-weight: 700; letter-spacing: 2px;">
                        ${companyName.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td width="30%" class="header-col" align="right" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; color: #4b5563; font-weight: 500;">
                    Your Journey, <span style="color: #a5813b;">Our Passion.</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO IMAGE -->
          <tr>
            <td background="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200" bgcolor="#e8f0f2" valign="middle" style="background-size: cover; background-position: center; height: 350px; text-align: center; border-bottom: 6px solid #a5813b;">
              <!--[if gte mso 9]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:650px;height:350px;">
                <v:fill type="tile" src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200" color="#e8f0f2" />
                <v:textbox inset="0,0,0,0">
              <![endif]-->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 60px 20px; background: rgba(0,0,0,0.15);">
                    <h1 class="heading-font" style="margin: 0; color: #ffffff; font-size: 52px; font-weight: 700; text-shadow: 0 2px 15px rgba(0,0,0,0.3);">${displayTitle}</h1>
                    <p class="body-font" style="margin: 15px 0 0 0; color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
                      ${companyName} • ${companySlogan}
                    </p>
                  </td>
                </tr>
              </table>
              <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->
            </td>
          </tr>

          <!-- MAIN CONTENT AREA -->
          <tr>
            <td class="content-padding" style="padding: 45px 50px; background-color: #ffffff;">
              
              <!-- Greeting & Dynamic Body (passed from controller) -->
              <div class="body-font" style="font-size: 15px; line-height: 1.6; color: #374151;">
                ${bodyContent}
              </div>

              <!-- CONTACT CARD -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 35px; border: 1px solid #f3e8d6; border-radius: 12px; overflow: hidden; background-color: #fdfbf7;">
                <tr>
                  <td width="60" valign="top" style="background-color: #a5813b; text-align: center; padding: 25px 0;">
                    <span class="heading-font" style="color: #ffffff; font-size: 24px; font-weight: 600;">I</span>
                  </td>
                  <td valign="top" style="padding: 25px 30px;">
                    <div style="margin-bottom: 20px;">
                      <span class="heading-font" style="font-size: 20px; font-weight: 600; color: #a5813b;">${companyName} 🧳</span><br/>
                      <span class="body-font" style="font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #6b7280; text-transform: uppercase;">Your Travel Partner</span>
                    </div>
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="contact-grid">
                      <tr>
                        <td width="50%" valign="top" style="padding-bottom: 20px;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" valign="top" style="font-size: 18px;">📞</td>
                              <td class="body-font">
                                <span style="font-size: 12px; color: #6b7280; font-weight: 600;">Bookings</span><br/>
                                <span style="font-size: 14px; color: #111928; font-weight: 600;">${companyPhone}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="50%" valign="top" style="padding-bottom: 20px;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" valign="top" style="font-size: 18px;">✉️</td>
                              <td class="body-font">
                                <span style="font-size: 12px; color: #6b7280; font-weight: 600;">Mail</span><br/>
                                <a href="mailto:${companyEmail}" style="font-size: 14px; color: #2563eb; font-weight: 600; text-decoration: none;">${companyEmail}</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" valign="top">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" valign="top" style="font-size: 18px;">💳</td>
                              <td class="body-font">
                                <span style="font-size: 12px; color: #6b7280; font-weight: 600;">Finance</span><br/>
                                <span style="font-size: 14px; color: #111928; font-weight: 600;">7889006633</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="50%" valign="top">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" valign="top" style="font-size: 18px;">🌐</td>
                              <td class="body-font">
                                <span style="font-size: 12px; color: #6b7280; font-weight: 600;">Web</span><br/>
                                <a href="https://${companyWebsite}" style="font-size: 14px; color: #2563eb; font-weight: 600; text-decoration: none;">${companyWebsite}</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ACTION BUTTONS -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 35px;">
                ${viewOnlineUrl ? \`
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <a href="\${viewOnlineUrl}" class="btn-gold body-font" style="display: block; width: 100%; box-sizing: border-box; background-color: #a5813b; color: #ffffff; text-align: center; padding: 18px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                      👁️ View Proposal Online &nbsp; →
                    </a>
                  </td>
                </tr>
                \` : ''}
                ${pdfDownloadUrl ? \`
                <tr>
                  <td align="center" style="padding-bottom: 25px;">
                    <a href="\${pdfDownloadUrl}" class="btn-navy body-font" style="display: block; width: 100%; box-sizing: border-box; background-color: #111928; color: #ffffff; text-align: center; padding: 18px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                      📄 Download Your Proposal PDF &nbsp; →
                    </a>
                  </td>
                </tr>
                \` : ''}
                <tr>
                  <td align="center">
                    <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center;">
                      <span class="body-font" style="font-size: 12px; color: #4b5563;">
                        🛡️ For your security, this link is valid for 14 days only.
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- VALUE PROPS SECTION -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(to bottom, #fdfbf7, #f7f3ee); border-top: 1px solid #f3e8d6;">
              <div align="center" style="margin-bottom: 30px;">
                <span class="heading-font" style="font-size: 24px; font-weight: 600; color: #a5813b; font-style: italic;">Caring for your adventure,</span><br/>
                <span class="body-font" style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #4b5563; text-transform: uppercase; margin-top: 8px; display: inline-block;">TEAM ${companyName.toUpperCase()}</span>
                <div style="margin-top: 10px; color: #a5813b;">❖</div>
              </div>

              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="value-props">
                <tr>
                  <td width="25%" align="center" valign="top" style="padding: 0 10px;">
                    <div style="font-size: 28px; margin-bottom: 10px; color: #a5813b;">📍</div>
                    <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1px; color: #374151; text-transform: uppercase;">Handpicked<br/>Destinations</div>
                  </td>
                  <td width="25%" align="center" valign="top" style="padding: 0 10px; border-left: 1px solid #e5e7eb;">
                    <div style="font-size: 28px; margin-bottom: 10px; color: #a5813b;">🧭</div>
                    <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1px; color: #374151; text-transform: uppercase;">Custom<br/>Itineraries</div>
                  </td>
                  <td width="25%" align="center" valign="top" style="padding: 0 10px; border-left: 1px solid #e5e7eb;">
                    <div style="font-size: 28px; margin-bottom: 10px; color: #a5813b;">🎧</div>
                    <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1px; color: #374151; text-transform: uppercase;">24/7<br/>Assistance</div>
                  </td>
                  <td width="25%" align="center" valign="top" style="padding: 0 10px; border-left: 1px solid #e5e7eb;">
                    <div style="font-size: 28px; margin-bottom: 10px; color: #a5813b;">🏅</div>
                    <div class="body-font" style="font-size: 9px; font-weight: 700; letter-spacing: 1px; color: #374151; text-transform: uppercase;">Best Value<br/>Guarantee</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DARK FOOTER -->
          <tr>
            <td style="background-color: #111928; padding: 40px 40px 20px 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="33%" class="footer-col" valign="top" style="padding-right: 20px;">
                    <div style="margin-bottom: 15px;">
                      <span class="heading-font" style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 2px;">
                        ${companyName.toUpperCase()}
                      </span>
                    </div>
                    <p class="body-font" style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 20px 0;">
                      Crafting journeys that last a lifetime. Creating memories that stay forever.
                    </p>
                    <div style="font-size: 16px;">
                      <a href="#" style="text-decoration: none; margin-right: 10px;">📸</a>
                      <a href="#" style="text-decoration: none; margin-right: 10px;">👍</a>
                      <a href="#" style="text-decoration: none;">▶️</a>
                    </div>
                  </td>
                  
                  <td width="33%" class="footer-col" valign="top" style="padding: 0 20px; border-left: 1px dotted #374151; border-right: 1px dotted #374151;">
                    <h4 class="body-font" style="color: #a5813b; font-size: 13px; font-weight: 600; margin: 0 0 15px 0;">Get in touch</h4>
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="20" style="padding-bottom: 10px; font-size: 12px;">📞</td>
                        <td class="body-font" style="padding-bottom: 10px; color: #d1d5db; font-size: 12px;">${companyPhone}</td>
                      </tr>
                      <tr>
                        <td width="20" style="padding-bottom: 10px; font-size: 12px;">✉️</td>
                        <td class="body-font" style="padding-bottom: 10px; color: #d1d5db; font-size: 12px;">${companyEmail}</td>
                      </tr>
                      <tr>
                        <td width="20" style="font-size: 12px;">🌐</td>
                        <td class="body-font" style="color: #d1d5db; font-size: 12px;">${companyWebsite}</td>
                      </tr>
                    </table>
                  </td>
                  
                  <td width="34%" class="footer-col" valign="top" align="center" style="padding-left: 20px;">
                    <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=300" alt="Landscape" width="100%" style="border-radius: 8px; border: 1px solid #374151; display: block; margin-bottom: 10px;" />
                    <span class="body-font" style="color: #f3f4f6; font-size: 11px;">Every trail tells a unique story.</span>
                    <div style="color: #a5813b; font-size: 10px; margin-top: 5px;">— 🍁 —</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="3" align="center" style="padding-top: 30px;">
                    <div style="border-top: 1px solid #1f2937; padding-top: 20px;">
                      <span class="body-font" style="color: #6b7280; font-size: 10px;">
                        &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
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
</html>`;
};

module.exports = { getArtisanalEmailFrame };Frame };
