// ============================================================
// Seed Script — Migrate constants.ts data into the database
// Run: node seed-website-content.js
// ============================================================

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ── Parse the journeys array from constants.ts ──
function parseJourneysFromConstants() {
  const filePath = path.resolve(__dirname, '../../imagicaholidays-01/src/lib/constants.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract the journeys array
  const match = content.match(/export const journeys\s*=\s*(\[[\s\S]*?\n\];)/);
  if (!match) throw new Error('Could not find journeys array in constants.ts');
  
  // Clean TypeScript-specific syntax and eval as JSON
  let jsonStr = match[1];
  // The data is already valid JSON-like, just need to eval it
  const journeys = eval(jsonStr);
  return journeys;
}

// ── Trending destinations data (from TrendingPopup.tsx) ──
const TRENDING_DATA = [
  {
    region: "Northern Frontiers",
    title: "Kedarnath",
    tagline: "The Sacred Spiritual Peaks",
    image: "https://images.pexels.com/photos/19195937/pexels-photo-19195937.jpeg?auto=compress&cs=tinysrgb&w=1200",
    lastUpdated: "April 22, 2026",
    link: "/destinations/gangtok",
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

async function main() {
  console.log('🌱 Starting website content seed...\n');

  // ── Seed Journeys ──
  let journeys;
  try {
    journeys = parseJourneysFromConstants();
    console.log(`📋 Found ${journeys.length} journeys in constants.ts`);
  } catch (e) {
    console.error('❌ Failed to parse constants.ts:', e.message);
    return;
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < journeys.length; i++) {
    const j = journeys[i];
    
    // Check if already exists
    const existing = await prisma.websiteJourney.findUnique({ where: { slug: j.id } });
    if (existing) {
      console.log(`  ⏭️  Skipping "${j.title}" (slug: ${j.id}) — already exists`);
      skipped++;
      continue;
    }

    // Create journey with days
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
    console.log(`  ✅ Created "${j.title}" with ${j.itinerary?.length || 0} days`);
    created++;
  }

  console.log(`\n📦 Journeys: ${created} created, ${skipped} skipped\n`);

  // ── Seed Trending Destinations ──
  let tCreated = 0;
  let tSkipped = 0;

  for (const t of TRENDING_DATA) {
    const existing = await prisma.trendingDestination.findFirst({
      where: { title: t.title, region: t.region },
    });
    if (existing) {
      console.log(`  ⏭️  Skipping trending "${t.title}" — already exists`);
      tSkipped++;
      continue;
    }

    await prisma.trendingDestination.create({ data: t });
    console.log(`  ✅ Created trending "${t.title}"`);
    tCreated++;
  }

  console.log(`\n🔥 Trending: ${tCreated} created, ${tSkipped} skipped`);
  console.log('\n✨ Seed complete!\n');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
