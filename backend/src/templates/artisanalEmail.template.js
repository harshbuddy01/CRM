// ============================================================
// TravelCRM — Artisanal Floral Invitation (V3 - Bulletproof)
// ============================================================

/**
 * Wraps email body content in a table-based journal-style floral frame for max compatibility.
 * @param {Object} options - { subject, bodyContent, agentSignature, inviteType }
 */
const getArtisanalEmailFrame = (options) => {
  const { subject, bodyContent, agentSignature, inviteType } = options;
  
  // Hand-drawn Floral Decorative Element (Top Right)
  const floralTop = `
    <div style="text-align: right; line-height: 0;">
      <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 110C30 90 40 60 40 40C40 20 20 10 10 10M10 10C20 20 40 30 60 30C80 30 100 20 110 10M40 40C50 50 70 60 90 60C110 60 120 50 120 40" stroke="#a5813b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
      </svg>
    </div>
  `;

  // Hand-drawn Floral Decorative Element (Bottom Left)
  const floralBottom = `
    <div style="text-align: left; line-height: 0;">
      <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg);">
        <path d="M10 110C30 90 40 60 40 40C40 20 20 10 10 10M10 10C20 20 40 30 60 30C80 30 100 20 110 10M40 40C50 50 70 60 90 60C110 60 120 50 120 40" stroke="#a5813b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
      </svg>
    </div>
  `;

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${subject || 'A Message from Imagica Holidays'}</title>
      <style type="text/css">
        /* Premium Typography Imports */
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Pinyon+Script&display=swap');
        
        /* Client-specific Styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }

        /* Reset Styles */
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f7f3ee !important; }
        
        @media screen and (max-width: 600px) {
          .content-table { width: 100% !important; border-radius: 0 !important; }
          .body-content { padding: 40px 25px !important; }
          .header-text { font-size: 38px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f7f3ee;">
      <!-- Main Wrapper Table -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f3ee;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            
            <!-- Letter Concept Table -->
            <table border="0" cellpadding="0" cellspacing="0" width="600" class="content-table" style="background-color: #ffffff; border: 1px solid #e2ddd3; box-shadow: 0 15px 45px rgba(0,0,0,0.05);">
              
              <!-- Floral Header Row -->
              <tr>
                <td align="right" style="padding: 0; font-size: 0; line-height: 0;">
                  ${floralTop}
                </td>
              </tr>

              <!-- Main Content Row -->
              <tr>
                <td class="body-content" style="padding: 40px 60px 40px 60px;">
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <!-- Journal Invitation Header -->
                    <tr>
                      <td align="center" style="padding-bottom: 30px;">
                        <span style="font-family: 'Pinyon Script', cursive, serif; font-size: 48px; color: #a5813b; display: block;" class="header-text">
                          ${inviteType === 'proposal' ? 'Your Journey Awaits' : 'Greetings from the Peaks'}
                        </span>
                        <span style="font-family: 'EB Garamond', serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4em; color: #9b8a70; margin-top: 10px; display: block;">
                          IMAGICA HOLIDAYS • ARTISANAL TRAVEL
                        </span>
                      </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                      <td style="font-family: 'EB Garamond', serif; font-size: 19px; line-height: 1.7; color: #2c2419; text-align: left;">
                        ${bodyContent}
                      </td>
                    </tr>

                    <!-- Decorative Divider -->
                    <tr>
                      <td align="center" style="padding: 40px 0;">
                        <span style="color: #a5813b; opacity: 0.5;">● &nbsp; <span style="font-size: 1.2em;">●</span> &nbsp; ●</span>
                      </td>
                    </tr>

                    <!-- Signature Block -->
                    <tr>
                      <td style="border-top: 1px solid #f2efea; padding-top: 30px;">
                        <span style="font-family: 'Pinyon Script', cursive, serif; font-size: 34px; color: #8c6d31; display: block;">
                          Caring for your adventure,
                        </span>
                        <span style="font-family: 'EB Garamond', serif; font-size: 13px; text-transform: uppercase; letter-spacing: 0.25em; color: #a5813b; font-weight: bold; margin-top: 5px; display: block;">
                          Team Imagica Holidays
                        </span>
                        <div style="margin-top: 15px; font-family: 'EB Garamond', serif; font-size: 14px; color: #7c6d58; line-height: 1.5;">
                          ${agentSignature || '<strong>Imagica Holidays</strong><br>Siliguri, West Bengal • Curating the Finest Trails'}
                        </div>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Floral Footer Row -->
              <tr>
                <td align="left" style="padding: 0; font-size: 0; line-height: 0;">
                  ${floralBottom}
                </td>
              </tr>
            </table>

            <!-- Sub-Footer -->
            <table border="0" cellpadding="0" cellspacing="0" width="600" class="content-table">
              <tr>
                <td align="center" style="padding: 30px 20px; font-family: 'EB Garamond', serif; font-size: 11px; color: #a39889; text-transform: uppercase; letter-spacing: 0.15em;">
                  Each trail tells a unique story.
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = { getArtisanalEmailFrame };
