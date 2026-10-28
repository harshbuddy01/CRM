// ============================================================
// TravelCRM — Email Service (Nodemailer + Brevo SMTP)
// ============================================================

const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.BREVO_SMTP_PORT || '587', 10);
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
 */
async function sendVoucherEmail({ to, subject, voucherNumber, recipientName, pdfUrl, hotelName }) {
  const transporter = getTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || 'Imagica Holidays';
  const fromEmail = process.env.EMAIL_FROM || 'info@imagicaholidays.com';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; color: white; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
        .body { padding: 32px; color: #334155; line-height: 1.6; font-size: 15px; }
        .voucher-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px 24px; margin: 24px 0; text-align: center; }
        .voucher-number { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 1px; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Voucher is Ready</h1>
        </div>
        <div class="body">
          <p>Dear <strong>${recipientName || 'Guest'}</strong>,</p>
          <p>Please find your travel voucher details below${hotelName ? ` for <strong>${hotelName}</strong>` : ''}.</p>
          <div class="voucher-box">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;font-weight:600;text-transform:uppercase;">Voucher Number</div>
            <div class="voucher-number">${voucherNumber}</div>
          </div>
          <p>Click the button below to view and download your voucher PDF:</p>
          <div style="text-align:center;">
            <a href="${pdfUrl}" class="btn">View / Download Voucher</a>
          </div>
        </div>
        <div class="footer">
          Imagica Holidays Concierge &bull; Delivering Memorable Journeys
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  });
}

/**
 * Pre-Tour (Day -2) Excitement & Balance Reminder Email
 */
async function sendPretourEmail({ to, guestName, destination, startDateStr, totalCost, balanceDue, tourCode }) {
  const transporter = getTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || 'Imagica Holidays';
  const fromEmail = process.env.EMAIL_FROM || 'info@imagicaholidays.com';

  const balanceSection = balanceDue > 0
    ? `
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <div style="font-size: 12px; color: #b45309; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Payment Balance Notice</div>
        <div style="font-size: 18px; font-weight: 700; color: #92400e; margin-top: 4px;">Remaining Balance: ₹${Number(balanceDue).toLocaleString('en-IN')}</div>
        <div style="font-size: 13px; color: #78350f; margin-top: 4px;">Your scheduled final payment is due prior to departure for seamless check-ins.</div>
      </div>
    `
    : `
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <div style="font-size: 14px; font-weight: 700; color: #065f46;">✅ Package Fully Paid</div>
        <div style="font-size: 13px; color: #047857; margin-top: 4px;">All financial settlements are complete. You are all set to travel!</div>
      </div>
    `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; color: #ffffff; padding: 36px 32px; text-align: center; }
        .header .brand { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #f59e0b; font-weight: 700; margin-bottom: 8px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .body { padding: 32px; color: #334155; line-height: 1.6; font-size: 15px; }
        .trip-card { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; }
        .trip-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .trip-label { color: #64748b; }
        .trip-val { font-weight: 600; color: #0f172a; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">IMAGICA HOLIDAYS</div>
          <h1>Your Journey Begins in 2 Days!</h1>
        </div>
        <div class="body">
          <p>Dear <strong>${guestName || 'Valued Traveler'}</strong>,</p>
          <p>Greetings from the Imagica Holidays team! We are thrilled to host you for your upcoming expedition to <strong>${destination}</strong> starting on <strong>${startDateStr}</strong>.</p>
          
          <div class="trip-card">
            <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
              <tr>
                <td style="color: #64748b; width: 40%;">Tour Reference:</td>
                <td style="font-weight: 700; color: #0f172a;">${tourCode}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Destination:</td>
                <td style="font-weight: 700; color: #0f172a;">${destination}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Departure Date:</td>
                <td style="font-weight: 700; color: #0f172a;">${startDateStr}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Package Total:</td>
                <td style="font-weight: 700; color: #0f172a;">₹${Number(totalCost).toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          ${balanceSection}

          <p>Our operations team is finalizing your chauffeur assignments, hotel vouchers, and permits. You will receive your daily morning logistics briefing directly each morning during your holiday.</p>
          
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            Need help or have special requests? Reach out anytime:<br>
            📞 24/7 Helpline: <strong>+91 78890 06053</strong> | 📧 <strong>info@imagicaholidays.com</strong>
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Imagica Holidays. All rights reserved.<br>
          Delivering Extraordinary Travel Experiences.
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `✨ 2 Days to Go: Your Holiday to ${destination} — Imagica Holidays`,
    html,
  });
}

/**
 * Daily Tour Logistics Morning Briefing Email
 */
async function sendDailyDispatchEmail({ to, guestName, dayNumber, dayTitle, driverInfo, hotelInfo, tourCode }) {
  const transporter = getTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || 'Imagica Holidays';
  const fromEmail = process.env.EMAIL_FROM || 'info@imagicaholidays.com';

  // Driver details box only if driver was assigned (leave blank if omitted)
  const driverBox = driverInfo?.trim()
    ? `
      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 14px 18px; margin: 14px 0;">
        <div style="font-size: 12px; color: #1d4ed8; font-weight: 700; text-transform: uppercase;">Chauffeur & Vehicle</div>
        <div style="font-size: 14px; color: #1e3a8a; font-weight: 600; margin-top: 4px;">${driverInfo.replace(/^[🚗\s:]+/, '')}</div>
      </div>
    `
    : '';

  // Hotel details box only if available
  const hotelBox = hotelInfo?.trim()
    ? `
      <div style="background: #fdf2f8; border-left: 4px solid #ec4899; border-radius: 6px; padding: 14px 18px; margin: 14px 0;">
        <div style="font-size: 12px; color: #be185d; font-weight: 700; text-transform: uppercase;">Tonight's Stay</div>
        <div style="font-size: 14px; color: #831843; font-weight: 600; margin-top: 4px;">${hotelInfo.replace(/^[🏨\s:]+/, '')}</div>
      </div>
    `
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; color: #ffffff; padding: 32px; text-align: center; }
        .header .badge { display: inline-block; background: #f59e0b; color: #0f172a; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .body { padding: 32px; color: #334155; line-height: 1.6; font-size: 15px; }
        .plan-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">DAY ${dayNumber} LOGISTICS</div>
          <h1>Good Morning, ${guestName || 'Traveler'}!</h1>
        </div>
        <div class="body">
          <p>Welcome to <strong>Day ${dayNumber}</strong> of your journey with Imagica Holidays (${tourCode}). Wishing you an exciting day of discovery ahead!</p>

          <div class="plan-box">
            <div style="font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Today's Schedule & Sightseeing</div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.4;">${dayTitle}</div>
          </div>

          ${driverBox}
          ${hotelBox}

          <p style="margin-top: 24px; font-size: 14px; color: #475569;">
            Have a pleasant journey! If you require any route coordination or on-road support, our operations team is available 24/7.
          </p>
        </div>
        <div class="footer">
          Imagica Holidays 24/7 Concierge: +91 78890 06053 &bull; info@imagicaholidays.com
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `🌟 Day ${dayNumber} Daily Briefing: ${dayTitle} — Imagica Holidays`,
    html,
  });
}

/**
 * Post-Journey Review Invitation Email
 */
async function sendReviewInviteEmail({ to, guestName, destination, reviewUrl, tourCode }) {
  const transporter = getTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || 'Imagica Holidays';
  const fromEmail = process.env.EMAIL_FROM || 'info@imagicaholidays.com';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; color: #ffffff; padding: 36px 32px; text-align: center; }
        .header .stars { font-size: 26px; color: #fbbf24; margin-bottom: 8px; letter-spacing: 4px; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .body { padding: 32px; color: #334155; line-height: 1.6; font-size: 15px; }
        .btn-review { display: inline-block; background: #d97706; color: #ffffff !important; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3); }
        .footer { background: #f8fafc; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="stars">★★★★★</div>
          <h1>Welcome Back, ${guestName || 'Traveler'}!</h1>
        </div>
        <div class="body">
          <p>Dear <strong>${guestName || 'Valued Guest'}</strong>,</p>
          <p>Thank you for choosing Imagica Holidays for your recent vacation to <strong>${destination}</strong> (${tourCode}). We sincerely hope you made unforgettable memories!</p>
          <p>Your honest feedback helps our concierge and operations team maintain the highest standards of hospitality. It takes less than 60 seconds:</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${reviewUrl}" class="btn-review">★ Rate Your Experience ★</a>
          </div>

          <p style="font-size: 13px; color: #64748b; text-align: center;">
            Direct link: <a href="${reviewUrl}" style="color: #2563eb;">${reviewUrl}</a>
          </p>

          <div style="background: #f1f5f9; border-radius: 8px; padding: 14px 18px; margin-top: 24px; font-size: 13px; color: #475569;">
            💡 <em>5-star ratings will immediately allow you to share your review on our official Google Business page.</em>
          </div>
        </div>
        <div class="footer">
          Imagica Holidays &bull; Dedicated to Extraordinary Travel Journeys<br>
          Pune &bull; Siliguri &bull; Guwahati
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `🌟 How was your trip to ${destination}? — Imagica Holidays`,
    html,
  });
}

module.exports = {
  sendVoucherEmail,
  sendPretourEmail,
  sendDailyDispatchEmail,
  sendReviewInviteEmail,
};
