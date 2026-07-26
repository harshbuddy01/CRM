const { enqueueEmailJob } = require('../services/queue.service');

/**
 * Send bulk email campaign by pushing email jobs to BullMQ queue
 */
const sendCampaign = async (req, res, next) => {
  try {
    const { emails, subject, content, fromName } = req.body;
    if (!emails || !subject || !content) {
      return res.status(400).json({ success: false, message: 'Emails, subject, and content are required' });
    }

    // Parse emails from comma/newline/semicolon/space separated string
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rawEmails = emails.split(/[\s,;\n\r]+/).map(e => e.trim()).filter(Boolean);
    const validEmails = [...new Set(rawEmails.filter(e => emailRegex.test(e)))];

    if (validEmails.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid email addresses found' });
    }

    // Check if SMTP is configured
    const host = process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST;
    const user = process.env.SMTP_USER || process.env.BREVO_SMTP_USER;
    const pass = process.env.SMTP_PASS || process.env.BREVO_SMTP_PASS;
    if (!host || !user || !pass) {
      return res.status(400).json({ success: false, message: 'SMTP credentials are not configured. Please add SMTP settings to your .env file.' });
    }

    const fromEmail = process.env.EMAIL_FROM || user;
    const fromHeader = fromName ? `"${fromName}" <${fromEmail}>` : `"${process.env.EMAIL_FROM_NAME || 'TravelCRM'}" <${fromEmail}>`;

    // Enqueue a job for each email
    for (const email of validEmails) {
      await enqueueEmailJob(null, email, subject, content, null, fromHeader);
    }

    res.json({
      success: true,
      message: `Successfully enqueued campaign to ${validEmails.length} recipients.`,
      recipientCount: validEmails.length,
      invalidCount: rawEmails.length - validEmails.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Check if SMTP settings are configured in the environment
 */
const getSmtpStatus = async (req, res, next) => {
  try {
    const host = process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST;
    const user = process.env.SMTP_USER || process.env.BREVO_SMTP_USER;
    const pass = process.env.SMTP_PASS || process.env.BREVO_SMTP_PASS;
    const isConfigured = !!(host && user && pass);

    res.json({
      success: true,
      configured: isConfigured,
      details: isConfigured ? {
        host,
        user: user.includes('@') 
          ? user.replace(/^(.)(.*)(.@.*)$/, (_, first, middle, last) => first + '*'.repeat(middle.length) + last)
          : user.substring(0, 3) + '***'
      } : null
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendCampaign,
  getSmtpStatus,
};
