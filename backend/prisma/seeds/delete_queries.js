// ============================================================
// TravelCRM — Specific Queries & Associated Data Cleanup Seed
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const codes = ['QRY-2026-004', 'QRY-2026-003', 'QRY-2026-002', 'QRY-2026-001'];
  console.log(`🌱 Starting database cleanup for queries: ${codes.join(', ')}`);

  // Find target queries
  const queries = await prisma.query.findMany({
    where: {
      queryCode: { in: codes }
    }
  });

  if (queries.length === 0) {
    console.log('⚠️ No matching queries found in database.');
    return;
  }

  const queryIds = queries.map(q => q.id);
  const clientIds = queries.map(q => q.clientId).filter(Boolean);
  
  console.log(`Found ${queries.length} queries to clean up: ${queries.map(q => `${q.queryCode} (${q.name})`).join(', ')}`);

  // 1. Delete Vouchers
  const vch = await prisma.voucher.deleteMany({ where: { queryId: { in: queryIds } } });
  console.log(`- Deleted ${vch.count} vouchers.`);

  // 2. Delete BookingServices
  const bs = await prisma.bookingService.deleteMany({ where: { queryId: { in: queryIds } } });
  console.log(`- Deleted ${bs.count} booking services.`);

  // 3. Delete Payments
  const p = await prisma.payment.deleteMany({ where: { queryId: { in: queryIds } } });
  console.log(`- Deleted ${p.count} payments.`);

  // 4. Delete Invoices
  const inv = await prisma.invoice.deleteMany({ where: { queryId: { in: queryIds } } });
  console.log(`- Deleted ${inv.count} invoices.`);

  // 5. Delete VendorPayments
  const vp = await prisma.vendorPayment.deleteMany({ where: { queryId: { in: queryIds } } });
  console.log(`- Deleted ${vp.count} vendor payments.`);

  // 6. Delete Tours
  const t = await prisma.tour.deleteMany({ where: { queryId: { in: queryIds } } });
  console.log(`- Deleted ${t.count} tours.`);

  // 7. Delete ProposalDays and Proposals
  const pd = await prisma.proposalDay.deleteMany({ where: { proposal: { queryId: { in: queryIds } } } });
  console.log(`- Deleted ${pd.count} proposal days.`);
  
  const prop = await prisma.proposal.deleteMany({ where: { queryId: { in: queryIds } } });
  console.log(`- Deleted ${prop.count} proposals.`);

  // 8. Delete QueryNotes
  const qn = await prisma.queryNote.deleteMany({ where: { queryId: { in: queryIds } } });
  console.log(`- Deleted ${qn.count} query notes.`);

  // 9. Delete QueryDocuments
  const qd = await prisma.queryDocument.deleteMany({ where: { queryId: { in: queryIds } } });
  console.log(`- Deleted ${qd.count} query documents.`);

  // 10. Delete Queries
  const qDel = await prisma.query.deleteMany({ where: { id: { in: queryIds } } });
  console.log(`- Deleted ${qDel.count} queries.`);

  // 11. Delete Clients if not linked to any other queries
  if (clientIds.length > 0) {
    console.log('Checking for associated clients to clean up...');
    let deletedClientsCount = 0;
    for (const clientId of clientIds) {
      const otherQueriesCount = await prisma.query.count({
        where: { clientId, NOT: { queryCode: { in: codes } } }
      });
      if (otherQueriesCount === 0) {
        await prisma.client.delete({ where: { id: clientId } });
        deletedClientsCount++;
      }
    }
    console.log(`- Cleaned up ${deletedClientsCount} client records.`);
  }

  console.log('✅ Database cleanup completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
