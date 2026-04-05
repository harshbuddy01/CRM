// ============================================================
// TravelCRM — Artisanal Floral Invitation (V2)
// ============================================================

/**
 * Wraps email body content in a handcrafted journal-style floral frame.
 * @param {Object} options - { subject, bodyContent, agentSignature, inviteType }
 */
const getArtisanalEmailFrame = (options) => {
  const { subject, bodyContent, agentSignature, inviteType } = options;
  
  // Hand-drawn Floral SVG Vine (Simplified for max email compatibility)
  const floralVine = `
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 110C30 90 40 60 40 40C40 20 20 10 10 10M10 10C20 20 40 30 60 30C80 30 100 20 110 10M40 40C50 50 70 60 90 60C110 60 120 50 120 40" stroke="#a5813b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
      <path d="M15 15C18 12 22 12 25 15C28 18 28 22 25 25C22 28 18 28 15 25C12 22 12 18 15 15Z" fill="#a5813b" opacity="0.2"/>
      <path d="M95 55C98 52 102 52 105 55C108 58 108 62 105 65C102 68 98 68 95 65C92 62 92 58 95 55Z" fill="#a5813b" opacity="0.2"/>
    </svg>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject || 'A Message from Imagica Holidays'}</title>
      <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Pinyon+Script&display=swap');

        body {
          margin: 0; padding: 0; 
          width: 100% !important;
          background-color: #f7f3ee; /* Warmer parchment base */
          font-family: 'EB Garamond', 'Garamond', Georgia, serif;
          font-size: 19px;
          line-height: 1.7;
          color: #2c2419;
        }

        .letter-wrapper {
          width: 100%;
          background-color: #f7f3ee;
          padding: 60px 0;
        }

        .journal-page {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          position: relative;
          padding: 80px 60px;
          border: 1px solid #e2ddd3;
          box-shadow: 0 15px 45px rgba(0,0,0,0.04);
        }

        /* Hand-drawn corner ornaments */
        .floral-top { position: absolute; top: 0; right: 0; transform: scale(0.8); }
        .floral-bottom { position: absolute; bottom: 0; left: 0; transform: scale(0.8) rotate(180deg); }

        .invitation-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .journey-call {
          font-family: 'Pinyon Script', cursive;
          font-size: 48px;
          color: #a5813b;
          margin: 0;
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.4em;
          color: #9b8a70;
          margin-top: 10px;
          font-weight: 700;
        }

        .main-content {
          color: #3e3325;
          margin: 40px 0;
          text-align: justify;
        }

        .decorative-divider {
          text-align: center;
          margin: 40px 0;
        }

        .dot { height: 4px; width: 4px; background-color: #a5813b; border-radius: 50%; display: inline-block; margin: 0 4px; opacity: 0.5; }

        .signature-block {
          margin-top: 60px;
          border-top: 1px solid #f2efea;
          padding-top: 40px;
        }

        .hand-signed {
          font-family: 'Pinyon Script', cursive;
          font-size: 34px;
          color: #8c6d31;
          margin-bottom: 5px;
        }

        .agent-badge {
          font-family: 'EB Garamond', serif;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: #a5813b;
          font-weight: 700;
        }

        .footer-note {
          text-align: center;
          margin-top: 50px;
          font-size: 11px;
          color: #a39889;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        a { color: #a5813b; font-weight: 700; text-decoration: none; border-bottom: 1px solid rgba(165, 129, 59, 0.3); }

        @media screen and (max-width: 600px) {
          .journal-page { padding: 50px 30px !important; }
          .journey-call { font-size: 38px !important; }
          .main-content { font-size: 18px !important; }
        }
      </style>
    </head>
    <body>
      <div class="letter-wrapper">
        <div class="journal-page">
          
          <div class="floral-top">${floralVine}</div>
          <div class="floral-bottom">${floralVine}</div>

          <div class="invitation-header">
            <h1 class="journey-call">
              ${inviteType === 'proposal' ? 'Your Journey Awaits' : 'Greetings from the Peaks'}
            </h1>
            <div class="brand-subtitle">IMAGICA HOLIDAYS • ARTISANAL TRAVEL</div>
          </div>

          <div class="main-content">
            ${bodyContent}
          </div>

          <div class="decorative-divider">
            <span class="dot"></span><span class="dot" style="opacity: 0.8; height: 6px; width: 6px;"></span><span class="dot"></span>
          </div>

          <div class="signature-block">
            <div class="hand-signed">Caring for your adventure,</div>
            <div class="agent-badge">Team Imagica Holidays</div>
            <div style="margin-top: 15px; font-size: 13px; color: #7c6d58; line-height: 1.5;">
              ${agentSignature || '<strong>Imagica Holidays</strong><br>Siliguri, West Bengal • Curating the Finest Trails'}
            </div>
          </div>

          <div class="footer-note">
            Each trail tells a unique story.
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getArtisanalEmailFrame };
