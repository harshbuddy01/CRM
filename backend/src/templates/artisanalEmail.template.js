// ============================================================
// TravelCRM — Master Artisanal Email Template
// ============================================================

/**
 * Wraps email body content in a handcrafted journal-style frame.
 * @param {Object} options - { subject, bodyContent, agentSignature }
 */
const getArtisanalEmailFrame = (options) => {
  const { subject, bodyContent, agentSignature } = options;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject || 'A Message from Imagica Holidays'}</title>
      <style>
        /* CSS Reset for Email Clients */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        
        /* Premium Typography (Google Fonts) */
        /* Note: Web fonts may not load in all clients, so we rely on Garamond/Serif fallbacks */
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Pinyon+Script&display=swap');

        body {
          margin: 0; padding: 0; 
          width: 100% !important;
          background-color: #fcfbf9;
          font-family: 'EB Garamond', 'Garamond', Georgia, serif;
          font-size: 18px;
          line-height: 1.6;
          color: #1a1a10;
        }

        .paper-wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #fcfbf9;
          padding: 40px 0;
        }

        .content-frame {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 60px 50px;
          border: 1px solid #eeebe3;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }

        .header-logo {
          text-align: center;
          margin-bottom: 50px;
        }

        .logo-text {
          font-family: 'Pinyon Script', cursive;
          font-size: 42px;
          color: #a5813b;
          margin: 0;
        }

        .divider {
          height: 1px;
          background-color: #e5e3da;
          margin: 30px 0;
        }

        .body-text {
          color: #333333;
          margin-bottom: 40px;
        }

        .signature-section {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px dashed #e5e3da;
        }

        .hand-signed {
          font-family: 'Pinyon Script', cursive;
          font-size: 32px;
          color: #a5813b;
          margin-bottom: 8px;
        }

        .agent-info {
          font-family: 'EB Garamond', serif;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #8a6b2d;
          font-weight: 700;
        }

        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 11px;
          color: #999999;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        a { color: #a5813b; text-decoration: none; border-bottom: 1px solid rgba(165, 129, 59, 0.2); }
        
        /* Mobile Responsive adjustments */
        @media screen and (max-width: 600px) {
          .content-frame { padding: 40px 25px !important; }
          .logo-text { font-size: 36px !important; }
          .body-text { font-size: 17px !important; }
        }
      </style>
    </head>
    <body>
      <div className="paper-wrapper">
        <div className="content-frame">
          
          <div className="header-logo">
            <h1 className="logo-text">Imagica Holidays</h1>
            <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.3em; color: #888; margin-top: 5px;">Curated Himalayan Experiences</div>
          </div>

          <div className="body-text">
            ${bodyContent}
          </div>

          <div className="signature-section">
            <div className="hand-signed">Caring for your journey,</div>
            <div className="agent-info">Team Imagica</div>
            <div style="margin-top: 15px; font-size: 12px; color: #666;">
              ${agentSignature || '<strong>Imagica Holidays</strong><br>Siliguri, West Bengal • Curating the Finest Trails'}
            </div>
          </div>

          <div className="footer">
            Handcrafted Himalayan Hospitality
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getArtisanalEmailFrame };
