const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Use centralized config where possible; Brevo-specific env vars are read here
// because config/index.js uses the generic SMTP_* keys for a different purpose.
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT, 10) || 587,
  secure: false, // Port 587 uses STARTTLS, not SSL
  pool: true,           // Reuse TCP connections (avoids 3-8s handshake per email)
  maxConnections: 5,    // Up to 5 concurrent SMTP connections
  maxMessages: 100,     // Recycle connection after 100 messages
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

// Verify SMTP connection on startup (non-blocking)
transporter.verify()
  .then(() => logger.info('[Mailer] SMTP connection pool ready'))
  .catch((err) => logger.error('[Mailer] SMTP verification failed:', err.message));

const sendMail = async (options) => {
  // Ensure from address uses env vars if not explicitly provided
  const fromAddress = options.from || `"${process.env.EMAIL_FROM_NAME || 'Imagica Holidays'}" <${process.env.EMAIL_FROM || 'noreply@imagicaholidays.com'}>`;
  
  const mailOptions = {
    ...options,
    from: fromAddress,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  transporter,
  sendMail
};
