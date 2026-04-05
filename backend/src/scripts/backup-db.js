// ============================================================
// TravelCRM — Snapshot Tool (Daily Backup)
// Full JSON dump of high-value models
// ============================================================

require('dotenv').config({ path: '.env' });
const prisma = require('../config/prisma');
const { uploadToVault } = require('../utils/vault');

async function runSnapshot() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `snapshot-${timestamp}.json`;

  console.log(`🚀 [Vault] Starting snapshot: ${filename}`);

  try {
    // Collect all data in parallel
    const [itineraries, destinations, hotels, queries, users] = await Promise.all([
      prisma.itinerary.findMany({ include: { days: { include: { events: true } }, galleryImages: true } }),
      prisma.destination.findMany(),
      prisma.hotel.findMany(),
      prisma.query.findMany(),
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } }), // Selective fields for security
    ]);

    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        count: {
          itineraries: itineraries.length,
          destinations: destinations.length,
          hotels: hotels.length,
          queries: queries.length,
          users: users.length,
        },
      },
      data: {
        itineraries,
        destinations,
        hotels,
        queries,
        users,
      },
    };

    const content = JSON.stringify(backupData, null, 2);
    
    // Secure it in the vault
    await uploadToVault(filename, content);

    console.log('🏁 [Vault] Backup successful!');
  } catch (error) {
    console.error('❌ [VaultError] Fatal snapshot failure:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  runSnapshot();
}

module.exports = runSnapshot;
