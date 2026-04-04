const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function purgeData() {
  console.log('--- DATA PURGE STARTED ---');
  
  try {
    // 1. Find the target Query
    const query = await prisma.query.findFirst({
      where: {
        OR: [
          { queryCode: 'QRY-2026-001' },
          { name: { contains: 'KUMAR HARSH ANAND', mode: 'insensitive' } }
        ]
      },
      include: {
        proposals: true,
        tours: true
      }
    });

    if (!query) {
      console.log('No query found matching QRY-2026-001 or KUMAR HARSH ANAND.');
      return;
    }

    const qId = query.id;
    const tourIds = query.tours.map(t => t.id);
    const proposalIds = query.proposals.map(p => p.id);

    console.log(`Found Query: ${query.queryCode} / ${query.name} (ID: ${qId})`);
    console.log(`Related Tours: ${tourIds.length}`);
    console.log(`Related Proposals: ${proposalIds.length}`);

    // --- DELETION SEQUENCE (Bottom-Up) ---

    // 1. Tour Cancellations
    const tourCancel = await prisma.tourCancellation.deleteMany({
      where: { tourId: { in: tourIds } }
    });
    console.log(`- Deleted ${tourCancel.count} TourCancellations`);

    // 2. Vendor Payments
    const vendorPay = await prisma.vendorPayment.deleteMany({
      where: { queryId: qId }
    });
    console.log(`- Deleted ${vendorPay.count} VendorPayments`);

    // 3. Booking Services (Child of Query and ProposalDay)
    const bookingSvc = await prisma.bookingService.deleteMany({
      where: { queryId: qId }
    });
    console.log(`- Deleted ${bookingSvc.count} BookingServices`);

    // 4. Payments
    const payments = await prisma.payment.deleteMany({
      where: { queryId: qId }
    });
    console.log(`- Deleted ${payments.count} Payments`);

    // 5. Invoices
    const invoices = await prisma.invoice.deleteMany({
      where: { queryId: qId }
    });
    console.log(`- Deleted ${invoices.count} Invoices`);

    // 6. Tours
    const tours = await prisma.tour.deleteMany({
      where: { queryId: qId }
    });
    console.log(`- Deleted ${tours.count} Tours`);

    // 7. Vouchers
    const vouchers = await prisma.voucher.deleteMany({
      where: { queryId: qId }
    });
    console.log(`- Deleted ${vouchers.count} Vouchers`);

    // 8. Documents
    const docs = await prisma.queryDocument.deleteMany({
      where: { queryId: qId }
    });
    console.log(`- Deleted ${docs.count} Documents`);

    // 9. Email Logs
    const emails = await prisma.emailLog.deleteMany({
      where: { queryId: qId }
    });
    console.log(`- Deleted ${emails.count} EmailLogs`);

    // 10. Proposals & ProposalDays (Cascade usually handles but let's be safe)
    await prisma.proposalDay.deleteMany({
      where: { proposalId: { in: proposalIds } }
    });
    const proposals = await prisma.proposal.deleteMany({
      where: { queryId: qId }
    });
    console.log(`- Deleted ${proposals.count} Proposals`);

    // 11. Notes
    const notes = await prisma.queryNote.deleteMany({
      where: { queryId: qId }
    });
    console.log(`- Deleted ${notes.count} Notes`);

    // 12. FINALLY: The Query itself
    const deletedQuery = await prisma.query.delete({
      where: { id: qId }
    });
    console.log(`--- SUCCESS: Query ${deletedQuery.queryCode} deleted permanently. ---`);

  } catch (error) {
    console.error('ERROR DURING PURGE:', error);
  } finally {
    await prisma.$disconnect();
  }
}

purgeData();
