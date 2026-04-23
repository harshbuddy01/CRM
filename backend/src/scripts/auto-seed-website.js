// ============================================================
// Auto-Seed — Website Content
// Runs on server startup. If tables are empty, seeds them
// from the embedded JSON data. Idempotent & safe.
// ============================================================

const prisma = require('../config/prisma');
const journeys = require('../data/seed-journeys.json');

const TRENDING_DATA = [
  {
    region: "Northern Frontiers",
    title: "Kedarnath",
    tagline: "The Sacred Spiritual Peaks",
    image: "https://images.pexels.com/photos/19195937/pexels-photo-19195937.jpeg?auto=compress&cs=tinysrgb&w=1200",
    lastUpdated: "April 22, 2026",
    link: "/destinations/kedarnath",
    sequence: 0,
  },
  {
    region: "South India Heritage",
    title: "Munnar",
    tagline: "Tropical Tea Sanctuaries",
    image: "https://images.pexels.com/photos/13691355/pexels-photo-13691355.jpeg?auto=compress&cs=tinysrgb&w=1200",
    lastUpdated: "April 22, 2026",
    link: "/destinations/munnar",
    sequence: 1,
  },
  {
    region: "Royal Rajasthan",
    title: "Udaipur",
    tagline: "The City of Lakes & Palaces",
    image: "https://images.pexels.com/photos/20340331/pexels-photo-20340331.jpeg?auto=compress&cs=tinysrgb&w=1200",
    lastUpdated: "April 22, 2026",
    link: "/destinations/udaipur",
    sequence: 2,
  }
];

async function autoSeedWebsiteContent() {
  try {
    // Check if we already have data
    const journeyCount = await prisma.websiteJourney.count();
    const trendingCount = await prisma.trendingDestination.count();

    if (journeyCount > 0 && trendingCount > 0) {
      console.log(`✅ Website content already seeded (${journeyCount} journeys, ${trendingCount} trending). Skipping.`);
      return;
    }

    console.log('🌱 Auto-seeding website content...');

    // Seed journeys if empty
    if (journeyCount === 0) {
      for (let i = 0; i < journeys.length; i++) {
        const j = journeys[i];
        await prisma.websiteJourney.create({
          data: {
            slug: j.id,
            title: j.title,
            regions: j.regions,
            durationNights: j.durationNights,
            durationDays: j.durationDays,
            pricePerGuest: j.pricePerGuest,
            originalPrice: j.originalPrice,
            departurePort: j.departurePort,
            returnPort: j.returnPort,
            departureDate: j.departureDate,
            returnDate: j.returnDate,
            ports: j.ports,
            countries: j.countries,
            vehicle: j.vehicle,
            badges: j.badges,
            images: j.images,
            mapImage: j.mapImage || null,
            overview: j.overview || null,
            isActive: true,
            sequence: i,
            days: {
              create: (j.itinerary || []).map((day, idx) => ({
                dayNumber: idx + 1,
                title: day.title,
                date: day.date,
                time: day.time,
                description: day.description || null,
                image: day.image || null,
              })),
            },
          },
        });
      }
      console.log(`  ✅ Seeded ${journeys.length} journeys with itinerary days`);
    }

    // Seed trending if empty
    if (trendingCount === 0) {
      for (const t of TRENDING_DATA) {
        await prisma.trendingDestination.create({ data: t });
      }
      console.log(`  ✅ Seeded ${TRENDING_DATA.length} trending destinations`);
    }

    console.log('✨ Auto-seed complete!');
  } catch (err) {
    // Non-fatal — don't crash the server if seeding fails
    console.error('⚠️ Auto-seed website content failed (non-fatal):', err.message);
  }
}

module.exports = { autoSeedWebsiteContent };
