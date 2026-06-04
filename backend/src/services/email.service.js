// ============================================================
// TravelCRM — Email Service (Nodemailer + Brevo SMTP)
// ============================================================

const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.BREVO_SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.BREVO_SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials are not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return _transporter;
}

/**
 * Send an email with a voucher PDF link.
 * @param {object} opts
 * @param {string} opts.to - Recipient email address
 * @param {string} opts.subject - Email subject
 * @param {string} opts.voucherNumber - e.g. VCH-2026-001
 * @param {string} opts.recipientName - Guest or supplier name
 * @param {string} opts.pdfUrl - Public URL to download the PDF
 * @param {string} opts.hotelName - Optional hotel name
 */
async function sendVoucherEmail({ to, subject, voucherNumber, recipientName, pdfUrl, hotelName }) {
  const transporter = getTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || 'TravelCRM';
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.BREVO_SMTP_USER;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: #1e3a8a; color: white; padding: 28px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
        .body { padding: 32px; color: #374151; line-height: 1.6; }
        .voucher-box { background: #f9f6f0; border: 1px solid #e5e0d8; border-radius: 6px; padding: 16px 20px; margin: 20px 0; text-align: center; }
        .voucher-number { font-size: 20px; font-weight: bold; color: #1e3a8a; letter-spacing: 1px; }
        .btn { display: inline-block; background: #1e3a8a; color: white !important; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: bold; font-size: 15px; margin: 20px 0; }
        .footer { background: #f3f4f6; padding: 16px 32px; text-align: center; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Voucher is Ready</h1>
        </div>
        <div class="body">
          <p>Dear <strong>${recipientName || 'Guest'}</strong>,</p>
          <p>Please find your voucher details below${hotelName ? ` for <strong>${hotelName}</strong>` : ''}.</p>
          <div class="voucher-box">
            <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">VOUCHER NUMBER</div>
            <div class="voucher-number">${voucherNumber}</div>
          </div>
          <p>Click the button below to view and download your voucher PDF:</p>
          <div style="text-align:center;">
            <a href="${pdfUrl}" class="btn">View / Download Voucher</a>
          </div>
          <p style="color:#6b7280;font-size:13px;">If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${pdfUrl}" style="color:#1e3a8a;">${pdfUrl}</a></p>
        </div>
        <div class="footer">
          This is an automated message from TravelCRM. Please do not reply to this email.
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  });

  return info;
}

module.exports = { sendVoucherEmail };
