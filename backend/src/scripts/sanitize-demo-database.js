// ============================================================
// TravelCRM — Demo Database Privacy Sanitizer (v3 – final)
// ============================================================
// Scrubs ALL personal data: org_settings key-value pairs, users,
// clients, queries, agents, branches, email templates, logs.
// ============================================================

const prisma = require('../config/prisma');

const DEMO_SETTINGS = {
  companyName: 'StreamKart TravelCRM',
  companyEmail: 'support@streamkart.shop',
  companyPhone: '+91 98000 11223',
  companyAddress: 'Demo Tech Park, Suite 100, Bengaluru, Karnataka – 560001',
  websiteUrl: 'https://streamkart.shop',
  emailSignature: '<p>Best regards,<br><strong>StreamKart CRM Demo Team</strong><br>Email: support@streamkart.shop | Web: https://streamkart.shop</p>',
  contactEmail: 'support@streamkart.shop',
  contactPhone: '+91 98000 11223',
  bankAccountName: 'StreamKart Pvt. Ltd.',
  bankName: 'Demo National Bank',
  bankAccountNumber: '990011223344556',
  bankIfsc: 'DEMO0001234',
  gstNumber: '27AAAAA0000A1Z5',
  panNumber: 'AAAAA0000A',
  companyLogo: '',
};

async function sanitizeDatabase() {
  console.log('[Sanitizer v3] Starting complete database anonymization...\n');

  try {
    // ── 1. Scrub org_settings key-value table ──
    console.log('[1/10] Scrubbing org_settings key-value pairs...');
    for (const [key, value] of Object.entries(DEMO_SETTINGS)) {
      await prisma.orgSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    console.log(`  ✅ Upserted ${Object.keys(DEMO_SETTINGS).length} org setting keys.\n`);

    // ── 2. Scrub ALL user display names ──
    const users = await prisma.user.findMany({ include: { role: true } });
    console.log(`[2/10] Sanitizing ${users.length} user records...`);
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const roleName = u.role?.label || u.role?.name || 'Staff';
      await prisma.user.update({
        where: { id: u.id },
        data: {
          name: `Demo ${roleName}`,
          mobile: `+91 97000 ${String(30000 + i).padStart(5, '0')}`,
          mobile2: null,
          twoFactorCode: null,
          twoFactorSessionId: null,
        },
      });
    }
    console.log(`  ✅ Sanitized ${users.length} user records.\n`);

    // ── 3. Scrub clients ──
    const clients = await prisma.client.findMany();
    console.log(`[3/10] Sanitizing ${clients.length} client records...`);
    for (let i = 0; i < clients.length; i++) {
      await prisma.client.update({
        where: { id: clients[i].id },
        data: {
          name: `Demo Traveler ${i + 1}`,
          phone: `+91 98765 ${String(10000 + i).padStart(5, '0')}`,
          email: `client${i + 1}@demo-crm.app`,
          whatsapp: `+91 98765 ${String(10000 + i).padStart(5, '0')}`,
          mobile2: null,
          address: 'Demo City, India',
          city: 'Demo City',
          passportNumber: null,
        },
      });
    }
    console.log(`  ✅ Sanitized ${clients.length} client records.\n`);

    // ── 4. Scrub queries/leads ──
    const queries = await prisma.query.findMany();
    console.log(`[4/10] Sanitizing ${queries.length} lead records...`);
    for (let i = 0; i < queries.length; i++) {
      await prisma.query.update({
        where: { id: queries[i].id },
        data: {
          name: `Demo Traveler ${i + 1}`,
          phone: `+91 98765 ${String(10000 + i).padStart(5, '0')}`,
          email: `traveler${i + 1}@demo-crm.app`,
        },
      });
    }
    console.log(`  ✅ Sanitized ${queries.length} lead records.\n`);

    // ── 5. Scrub B2B agents ──
    const agents = await prisma.b2BAgent.findMany();
    console.log(`[5/10] Sanitizing ${agents.length} B2B agent records...`);
    for (let i = 0; i < agents.length; i++) {
      await prisma.b2BAgent.update({
        where: { id: agents[i].id },
        data: {
          companyName: `Demo Travel Partner ${i + 1}`,
          contactPerson: `Partner Contact ${i + 1}`,
          email: `partner${i + 1}@demo-crm.app`,
          email2: null,
          mobile: `+91 98000 ${String(20000 + i).padStart(5, '0')}`,
          mobile2: null,
          gstNumber: null,
          panNumber: null,
          bankName: null,
          bankAccount: null,
          bankIfsc: null,
          notes: null,
        },
      });
    }
    console.log(`  ✅ Sanitized ${agents.length} B2B agent records.\n`);

    // ── 6. Scrub branches ──
    const branches = await prisma.branch.findMany();
    console.log(`[6/10] Sanitizing ${branches.length} branch records...`);
    for (let i = 0; i < branches.length; i++) {
      await prisma.branch.update({
        where: { id: branches[i].id },
        data: {
          name: `Demo Branch ${i + 1}`,
          address: 'Demo Trade Avenue, Demo City',
          city: 'Demo City',
        },
      });
    }
    console.log(`  ✅ Sanitized ${branches.length} branch records.\n`);

    // ── 7. Scrub email templates (field is bodyRichText, not bodyHtml) ──
    const templates = await prisma.emailTemplate.findMany();
    console.log(`[7/10] Sanitizing ${templates.length} email templates...`);
    for (const t of templates) {
      let cleaned = (t.bodyRichText || '')
        .replace(/Imagica\s*Holidays/gi, 'StreamKart CRM')
        .replace(/info\.imagicaholidays@gmail\.com/gi, 'support@streamkart.shop')
        .replace(/imagicaholidays/gi, 'streamkart')
        .replace(/\+91\s*\d{5}\s*\d{5}/g, '+91 98000 11223');
      let cleanSubject = (t.subject || '')
        .replace(/Imagica\s*Holidays/gi, 'StreamKart CRM')
        .replace(/imagicaholidays/gi, 'streamkart');
      await prisma.emailTemplate.update({
        where: { id: t.id },
        data: { bodyRichText: cleaned, subject: cleanSubject },
      });
    }
    console.log(`  ✅ Sanitized ${templates.length} email templates.\n`);

    // ── 8. Scrub query notes ──
    const notes = await prisma.queryNote.findMany();
    console.log(`[8/10] Sanitizing ${notes.length} query notes...`);
    for (const note of notes) {
      await prisma.queryNote.update({
        where: { id: note.id },
        data: { note: 'Demo follow-up: Client requested customized itinerary details.' },
      });
    }
    console.log(`  ✅ Sanitized ${notes.length} query notes.\n`);

    // ── 9. Wipe activity & integration logs ──
    console.log('[9/10] Clearing activity & integration logs...');
    const actDel = await prisma.activityLog.deleteMany({});
    const intDel = await prisma.integrationLog.deleteMany({});
    console.log(`  ✅ Deleted ${actDel.count} activity logs, ${intDel.count} integration logs.\n`);

    // ── 10. Scrub suppliers ──
    const suppliers = await prisma.supplier.findMany();
    console.log(`[10/10] Sanitizing ${suppliers.length} supplier records...`);
    for (let i = 0; i < suppliers.length; i++) {
      await prisma.supplier.update({
        where: { id: suppliers[i].id },
        data: {
          companyName: `Demo Supplier ${i + 1}`,
          contactPerson: `Demo Contact ${i + 1}`,
          email: `supplier${i + 1}@demo-crm.app`,
          phone: `+91 98000 ${String(60000 + i).padStart(5, '0')}`,
        },
      });
    }
    console.log(`  ✅ Sanitized ${suppliers.length} supplier records.\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅  DATABASE FULLY ANONYMIZED!  All personal data removed.');
    console.log('═══════════════════════════════════════════════════════');
  } catch (error) {
    console.error('[Sanitizer v3] ❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  sanitizeDatabase();
}

module.exports = { sanitizeDatabase };
