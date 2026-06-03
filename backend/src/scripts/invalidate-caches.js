// ============================================================
// TravelCRM — Cache Invalidation Script
// Run to invalidate PDF caches for all proposals linked to itineraries
// ============================================================

const prisma = require('../config/prisma');

async function main() {
  console.log('[Cache Invalidation] Starting cache invalidation for proposals with itineraries...');
  
  const result = await prisma.proposal.updateMany({
    where: {
      itineraryId: { not: null },
      deletedAt: null
    },
    data: {
      pdfUrl: null,
      pdfStatus: 'pending'
    }
  });

  console.log(`[Cache Invalidation] Successfully invalidated ${result.count} proposal caches.`);
}

main()
  .catch((err) => {
    console.error('[Cache Invalidation] Error occurred:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
