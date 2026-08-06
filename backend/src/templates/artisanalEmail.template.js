// ============================================================
// TravelCRM — Clean Modern Gradient Email Template
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
    headerTitle = 'Your Travel Proposal'
  } = options;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject || 'A Message from ' + companyName}</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
    
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9 !important; }
    
    .body-font { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; }
    .serif-font { font-family: 'Playfair Display', Georgia, serif; }

    @media screen and (max-width: 620px) {
      .container-table { width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 25px 20px !important; }
      .grid-col { display: block !important; width: 100% !important; padding: 0 !important; margin-bottom: 15px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
  <!-- OUTER WRAPPER -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        
        <!-- MAIN GRADIENT CARD CONTAINER -->
        <table border="0" cellpadding="0" cellspacing="0" width="640" class="container-table" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(15,23,42,0.08); border: 1px solid #e2e8f0;">
          
          <!-- 1. SLEEK GRADIENT HEADER WITH LARGE LOGO -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%); padding: 40px 30px; border-bottom: 4px solid #c59b27;">
              <!-- CRM LOGO (LARGE DISPLAY) -->
              <div style="margin-bottom: 15px;">
                ${companyLogoUrl ? `
                  <img src="${companyLogoUrl}" alt="${companyName}" style="max-height: 75px; max-width: 280px; width: auto; height: auto; display: block; margin: 0 auto; object-fit: contain;" />
                ` : `
                  <span class="serif-font" style="font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 3px; display: block;">
                    ${companyName.toUpperCase()}
                  </span>
                `}
              </div>
              
              <!-- SLOGAN / SUBTITLE -->
              <div class="body-font" style="font-size: 11px; font-weight: 600; color: #cbd5e1; letter-spacing: 2.5px; text-transform: uppercase;">
                ${companyName} &bull; <span style="color: #fbbf24;">${companySlogan}</span>
              </div>
            </td>
          </tr>

          <!-- 2. MAIN BODY CONTENT AREA -->
          <tr>
            <td class="content-padding" style="padding: 40px 45px; background-color: #ffffff;">
              
              <!-- CRM Dynamic Email Text / Body -->
              <div class="body-font" style="font-size: 15px; line-height: 1.7; color: #334155; margin-bottom: 30px;">
                ${bodyContent}
              </div>

              <!-- 3. ACTION BUTTONS (VIEW ONLINE & DOWNLOAD PDF) -->
              ${(viewOnlineUrl || pdfDownloadUrl) ? `
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 25px; margin-bottom: 35px;">
                ${viewOnlineUrl ? `
                <tr>
                  <td align="center" style="padding-bottom: 14px;">
                    <a href="${viewOnlineUrl}" target="_blank" class="body-font" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; text-align: center; padding: 17px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(217,119,6,0.3);">
                      👁️ VIEW PROPOSAL ONLINE &nbsp; →
                    </a>
                  </td>
                </tr>
                ` : ''}

                ${pdfDownloadUrl ? `
                <tr>
                  <td align="center" style="padding-bottom: 18px;">
                    <a href="${pdfDownloadUrl}" download target="_blank" class="body-font" style="display: block; width: 100%; box-sizing: border-box; background-color: #0f172a; color: #ffffff; text-align: center; padding: 17px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(15,23,42,0.25);">
                      📄 DOWNLOAD YOUR PROPOSAL PDF &nbsp; →
                    </a>
                  </td>
                </tr>
                ` : ''}

                <tr>
                  <td align="center">
                    <div class="body-font" style="font-size: 12px; color: #64748b; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 15px; text-align: center;">
                      🛡️ For your security, this document link is active for 14 days.
                    </div>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- 4. COMPANY CONTACT DETAILS SUMMARY CARD -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc; padding: 22px 25px;">
                <tr>
                  <td>
                    <div class="body-font" style="font-size: 12px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
                      Need assistance with your booking?
                    </div>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <!-- Left Column -->
                        <td width="50%" valign="top" class="grid-col">
                          <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                            <tr>
                              <td width="24" style="font-size: 14px;">📞</td>
                              <td class="body-font" style="font-size: 13px; color: #334155;">
                                <strong>Bookings:</strong> ${companyPhone}
                              </td>
                            </tr>
                          </table>
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="24" style="font-size: 14px;">💳</td>
                              <td class="body-font" style="font-size: 13px; color: #334155;">
                                <strong>Finance:</strong> 7889006633
                              </td>
                            </tr>
                          </table>
                        </td>

                        <!-- Right Column -->
                        <td width="50%" valign="top" class="grid-col">
                          <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                            <tr>
                              <td width="24" style="font-size: 14px;">✉️</td>
                              <td class="body-font" style="font-size: 13px;">
                                <strong>Email:</strong> <a href="mailto:${companyEmail}" style="color: #2563eb; text-decoration: none;">${companyEmail}</a>
                              </td>
                            </tr>
                          </table>
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="24" style="font-size: 14px;">🌐</td>
                              <td class="body-font" style="font-size: 13px;">
                                <strong>Web:</strong> <a href="https://${companyWebsite}" style="color: #2563eb; text-decoration: none;">${companyWebsite}</a>
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

          <!-- 5. ELEGANT DARK GRADIENT FOOTER WITH SOCIAL LINKS -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 35px 30px; text-align: center; border-top: 1px solid #334155;">
              
              <!-- Company Name in Footer -->
              <div class="serif-font" style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 2px; margin-bottom: 8px;">
                ${companyName.toUpperCase()}
              </div>

              <!-- Slogan -->
              <div class="body-font" style="font-size: 12px; color: #94a3b8; margin-bottom: 20px;">
                Crafting extraordinary journeys &bull; Creating memories that last a lifetime
              </div>

              <!-- SOCIAL MEDIA LOGOS / LINKS (INSTAGRAM, FACEBOOK, YOUTUBE, WEBSITE) -->
              <div style="margin-bottom: 25px;">
                <a href="https://instagram.com" target="_blank" style="display: inline-block; background-color: #1e293b; color: #f43f5e; padding: 10px 16px; border-radius: 20px; font-size: 12px; text-decoration: none; margin: 0 4px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; border: 1px solid #334155;">
                  📷 Instagram
                </a>
                <a href="https://facebook.com" target="_blank" style="display: inline-block; background-color: #1e293b; color: #3b82f6; padding: 10px 16px; border-radius: 20px; font-size: 12px; text-decoration: none; margin: 0 4px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; border: 1px solid #334155;">
                  📘 Facebook
                </a>
                <a href="https://youtube.com" target="_blank" style="display: inline-block; background-color: #1e293b; color: #ef4444; padding: 10px 16px; border-radius: 20px; font-size: 12px; text-decoration: none; margin: 0 4px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; border: 1px solid #334155;">
                  ▶️ YouTube
                </a>
              </div>

              <!-- Copyright -->
              <div style="border-top: 1px solid #334155; padding-top: 20px;" class="body-font">
                <span style="font-size: 11px; color: #64748b;">
                  &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
                </span>
              </div>

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
