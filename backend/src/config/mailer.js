const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: process.env.BREVO_SMTP_PORT || 587,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const sendMail = async (options) => {
  // Ensure from address uses env vars if not explicitly provided
  const fromAddress = options.from || `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`;
  
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
