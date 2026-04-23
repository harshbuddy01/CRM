// ============================================================
// Seed Script — Migrate constants.ts data into the database
// Run: node seed-website-content.js
// ============================================================

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const prisma = new PrismaClient();

// ── Parse the journeys array from constants.ts ──
function parseJourneysFromConstants() {
  const filePath = path.resolve(__dirname, '../../imagicaholidays-01/src/lib/constants.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Use bracket-balancing to safely extract the journeys array
  const token = 'export const journeys';
  const tokenIdx = content.indexOf(token);
  if (tokenIdx === -1) throw new Error('Could not find "export const journeys" in constants.ts');

  // Find the opening bracket
  const bracketStart = content.indexOf('[', tokenIdx);
  if (bracketStart === -1) throw new Error('Could not find opening "[" for journeys array');

  // Bracket-balance to find the matching closing bracket
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escaped = false;
  let endIdx = -1;

  for (let i = bracketStart; i < content.length; i++) {
    const ch = content[i];
    const nextCh = i + 1 < content.length ? content[i + 1] : '';

    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }

    if (inString) {
      if (ch === stringChar) inString = false;
      continue;
    }

    // Skip single-line comments
    if (ch === '/' && nextCh === '/') {
      const nlIdx = content.indexOf('\n', i + 2);
      if (nlIdx === -1) break;
      i = nlIdx;
      continue;
    }

    // Skip multi-line comments
    if (ch === '/' && nextCh === '*') {
      const endComment = content.indexOf('*/', i + 2);
      if (endComment === -1) break;
      i = endComment + 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }

    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }

  if (endIdx === -1) throw new Error('Could not find matching "]" for journeys array');

  const arrayStr = content.slice(bracketStart, endIdx + 1);

  // Use vm.runInNewContext with an empty sandbox to safely evaluate (no access to require, process, etc.)
  let journeys;
  try {
    journeys = vm.runInNewContext(`(${arrayStr})`, Object.create(null), { timeout: 5000 });
  } catch (e) {
    throw new Error(`Failed to parse journeys array: ${e.message}`);
  }

  // Validate the result
  if (!Array.isArray(journeys)) throw new Error('Parsed journeys is not an array');
  if (journeys.length === 0) throw new Error('Parsed journeys array is empty');

  // Validate first item has expected properties
  const first = journeys[0];
  if (!first.id || !first.title || !first.regions) {
    throw new Error('First journey item is missing required properties (id, title, regions)');
  }

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

async function main() {
  console.log('🌱 Starting website content seed...\n');

  // ── Seed Journeys ──
  let journeys;
  try {
    journeys = parseJourneysFromConstants();
    console.log(`📋 Found ${journeys.length} journeys in constants.ts`);
  } catch (e) {
    console.error('❌ Failed to parse constants.ts:', e.message);
    process.exit(1);
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
