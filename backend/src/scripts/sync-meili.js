// ============================================================
// TravelCRM — Meilisearch Initial Sync Script
// Manual migration to populate search indexes
// ============================================================

require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { syncToMeili } = require('../utils/meilisearch');

const prisma = new PrismaClient();

async function runSync() {
  console.log('🚀 [MeiliSync] Starting manual data push...');

  try {
    // 1. Sync Destinations
    const destinations = await prisma.destination.findMany({
      where: { isActive: true },
      include: { destinationCms: true }
    });
    
    const destDocs = destinations.map(d => ({
      id: d.id,
      name: d.name,
      country: d.country,
      description: d.destinationCms?.seoDesc || d.description,
      image: d.destinationCms?.heroImage,
      isActive: d.isActive
    }));

    if (destDocs.length > 0) {
      await syncToMeili('destinations', destDocs);
      console.log(`✅ [MeiliSync] ${destDocs.length} Destinations synced.`);
    }

    // 2. Sync Itineraries (Public proposals/templates)
    const itineraries = await prisma.itinerary.findMany({
      include: { 
        days: { include: { destination: true } }
      }
    });

    const itinDocs = itineraries.map(i => ({
      id: i.id,
      title: i.title,
      description: i.description,
      image: i.coverPhotoUrl,
      totalDays: i.days.length,
      sellingPrice: Number(i.sellingPrice || i.totalCost || 0),
      curreny: i.currency || 'INR',
      destinations: [...new Set(i.days.map(d => d.destination?.name).filter(Boolean))],
      createdAt: i.createdAt
    }));

    if (itinDocs.length > 0) {
      await syncToMeili('itineraries', itinDocs);
      console.log(`✅ [MeiliSync] ${itinDocs.length} Itineraries synced.`);
    }

    console.log('🏁 [MeiliSync] Manual push complete!');
  } catch (error) {
    console.error('❌ [MeiliSync] Fatal Migration Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runSync();
