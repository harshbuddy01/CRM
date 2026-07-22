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

    // 4. Sanitize User Profiles (Keep primary system admins, but replace any leaked user names with generic roles)
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    console.log(`[Sanitizer] Sanitizing ${users.length} system user records...`);
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const isSystemAdmin = u.email === 'harshbuddy01@gmail.com' || u.email === 'demo@streamkart.shop';
      if (!isSystemAdmin) {
        await prisma.user.update({
          where: { id: u.id },
          data: {
            name: `Demo ${u.role?.label || 'Staff'} ${i + 1}`,
            email: `staff${i + 1}@demo-crm.app`,
            mobile: `+91 97000 ${30000 + i}`,
          },
        });
      }
    }

    // 5. Sanitize Query Notes
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

    // 6. Scrub Activity & Integration Logs containing raw payloads
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
