const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { sendMail } = require('./src/config/mailer');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting admin credential update...');

  // 1. Find the admin user
  let admin = await prisma.user.findFirst({
    where: { email: 'admin@travelcrm.com' },
  });

  if (!admin) {
    admin = await prisma.user.findFirst({
      where: { email: 'anish629028@gmail.com' }, // in case already updated
    });
    if(!admin) {
      console.error('❌ Admin user not found.');
      process.exit(1);
    }
  }

  // 2. Hash the new password
  const plainPassword = 'anish@123#';
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  // 3. Update the user record
  const updatedUser = await prisma.user.update({
    where: { id: admin.id },
    data: {
      email: 'anish629028@gmail.com',
      passwordHash: passwordHash,
      name: 'Anish',
    },
  });

  console.log(`✅ Admin user updated: ${updatedUser.email}`);

  // 4. Send the email with credentials
  console.log('📧 Sending credential email to Anish...');
  
  const loginUrl = process.env.FRONTEND_URL || 'https://portal.imagicaholidays.com';

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-top: 0;">Welcome to TravelCRM</h2>
      <p style="color: #475569; line-height: 1.6;">Your system administrator account has been set up successfully. Please keep these credentials secure.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>System Identity:</strong> Anish (System Owner)</p>
        <p style="margin: 0 0 10px 0;"><strong>Username / Email:</strong> anish629028@gmail.com</p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> ${plainPassword}</p>
      </div>

      <a href="${loginUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access CRM Dashboard</a>
      
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated security notification. Do not reply to this email.</p>
    </div>
  `;

  try {
    await sendMail({
      to: 'anish629028@gmail.com',
      subject: 'Security: Your TravelCRM Executive Access',
      html: emailHtml
    });
    console.log('✅ Email sent successfully!');
  } catch(e) {
    console.warn('⚠️ Could not send email due to mailer error:', e.message);
  }

  console.log('✅ Update completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
