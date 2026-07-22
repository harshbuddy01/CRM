// ============================================================
// TravelCRM — Demo Database Privacy Sanitizer
// ============================================================
// Wipes out all real personal customer data, real agency names,
// client phone numbers, emails, and staff details, replacing them
// with 100% synthetic, anonymous demo data.
// ============================================================

const prisma = require('../config/prisma');

async function sanitizeDatabase() {
  console.log('[Sanitizer] Starting complete database anonymization & privacy scrub...');

  try {
    // 1. Sanitize Clients
    const clients = await prisma.client.findMany();
    console.log(`[Sanitizer] Sanitizing ${clients.length} client records...`);
    for (let i = 0; i < clients.length; i++) {
      await prisma.client.update({
        where: { id: clients[i].id },
        data: {
          name: `Demo Traveler ${i + 1}`,
          email: `client${i + 1}@demo-crm.app`,
          phone: `+91 98765 ${10000 + i}`,
          address: 'Demo City, India',
          city: 'Demo City',
          notes: 'Standard demo client profile.',
        },
      });
    }

    // 2. Sanitize Queries (Leads)
    const queries = await prisma.query.findMany();
    console.log(`[Sanitizer] Sanitizing ${queries.length} lead query records...`);
    for (let i = 0; i < queries.length; i++) {
      await prisma.query.update({
        where: { id: queries[i].id },
        data: {
          name: `Demo Traveler ${i + 1}`,
          email: `traveler${i + 1}@demo-crm.app`,
          phone: `+91 98765 ${10000 + i}`,
          campaignName: 'Demo Marketing Campaign',
        },
      });
    }

    // 3. Sanitize B2B Partners / Agents
    const agentModel = prisma.b2BAgent || prisma.b2bAgent;
    if (agentModel) {
      const agents = await agentModel.findMany();
      console.log(`[Sanitizer] Sanitizing ${agents.length} B2B partner records...`);
      for (let i = 0; i < agents.length; i++) {
        await agentModel.update({
          where: { id: agents[i].id },
          data: {
            companyName: `Demo Travel Partner ${i + 1}`,
            contactPerson: `Partner Manager ${i + 1}`,
            email: `partner${i + 1}@demo-crm.app`,
            mobile: `+91 98000 ${20000 + i}`,
            address: 'Demo Trade Center',
            city: 'Demo Metropolis',
            gstNumber: `27DEMO${1000 + i}A1Z5`,
            panNumber: `DEMOP${1000 + i}X`,
            bankName: 'Demo National Bank',
            bankAccount: `990011223344${i}`,
            bankIfsc: 'DEMO0001234',
          },
        });
      }
    }

    // 5. Sanitize Global Org Settings & Company Profile
    console.log('[Sanitizer] Sanitizing Global Settings & Org Profiles...');
    const orgSettings = await prisma.orgSetting.findMany();
    for (const setting of orgSettings) {
      await prisma.orgSetting.update({
        where: { id: setting.id },
        data: {
          companyName: 'StreamKart TravelCRM (Demo)',
          companyEmail: 'support@streamkart.shop',
          companyPhone: '+91 98000 11223',
          companyAddress: 'Demo Tech Park, Suite 100, Bengaluru, Karnataka – 560001',
          websiteUrl: 'https://streamkart.shop',
          emailSignature: 'Best regards,\nStreamKart CRM Demo Support\nEmail: support@streamkart.shop | Web: https://streamkart.shop',
        },
      });
    }

    // If no OrgSetting exists, create default generic demo setting
    if (orgSettings.length === 0) {
      await prisma.orgSetting.create({
        data: {
          companyName: 'StreamKart TravelCRM (Demo)',
          companyEmail: 'support@streamkart.shop',
          companyPhone: '+91 98000 11223',
          companyAddress: 'Demo Tech Park, Suite 100, Bengaluru, Karnataka – 560001',
          websiteUrl: 'https://streamkart.shop',
          emailSignature: 'Best regards,\nStreamKart CRM Demo Support\nEmail: support@streamkart.shop | Web: https://streamkart.shop',
        }
      });
    }

    // 6. Sanitize Branches
    const branches = await prisma.branch.findMany();
    for (let i = 0; i < branches.length; i++) {
      await prisma.branch.update({
        where: { id: branches[i].id },
        data: {
          name: `Demo Branch ${i + 1}`,
          code: `DEMO-BR-${i + 1}`,
          address: 'Demo Trade Avenue',
          city: 'Demo City',
          email: `branch${i + 1}@demo-crm.app`,
          phone: `+91 98000 ${50000 + i}`,
        }
      });
    }

    // 7. Sanitize Email Templates signatures
    const templates = await prisma.emailTemplate.findMany();
    for (const t of templates) {
      await prisma.emailTemplate.update({
        where: { id: t.id },
        data: {
          bodyHtml: t.bodyHtml?.replace(/Imagica Holidays/gi, 'StreamKart CRM Demo')?.replace(/info\.imagicaholidays@gmail\.com/gi, 'support@streamkart.shop') || t.bodyHtml,
        }
      });
    }

    // 8. Sanitize all User Display Names (so personal user names don't show up in topbar/sidebar)
    const users = await prisma.user.findMany({ include: { role: true } });
    for (const u of users) {
      await prisma.user.update({
        where: { id: u.id },
        data: {
          name: u.isDemo ? 'Demo User' : (u.role?.name === 'admin' ? 'Demo Admin' : `Demo ${u.role?.label || 'Staff'}`),
        }
      });
    }

    // 9. Sanitize Query Notes
    const notes = await prisma.queryNote.findMany();
    console.log(`[Sanitizer] Sanitizing ${notes.length} query notes...`);
    for (const note of notes) {
      await prisma.queryNote.update({
        where: { id: note.id },
        data: {
          note: 'Demo follow-up note: Client requested customized itinerary details.',
        },
      });
    }

    // 10. Scrub Activity & Integration Logs containing raw payloads
    console.log('[Sanitizer] Clearing sensitive activity & integration logs...');
    await prisma.activityLog.deleteMany({});
    await prisma.integrationLog.deleteMany({});

    console.log('[Sanitizer] ✅ Database successfully anonymized and scrubbed for privacy!');
  } catch (error) {
    console.error('[Sanitizer] ❌ Error during database sanitization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  sanitizeDatabase();
}

module.exports = { sanitizeDatabase };
