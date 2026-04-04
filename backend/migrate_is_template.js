const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Migrating existing itineraries...");
  
  // Find itineraries that are used in proposals (these are definitely client copies)
  const proposalItineraries = await prisma.proposal.findMany({ select: { itineraryId: true } });
  const clientItineraryIds = proposalItineraries.map(p => p.itineraryId);
  
  // Set isTemplate false for linked ones (already default, but just in case)
  const res1 = await prisma.itinerary.updateMany({
    where: { id: { in: clientItineraryIds } },
    data: { isTemplate: false }
  });
  console.log(`Updated ${res1.count} client itineraries to isTemplate=false`);
  
  // Set isTemplate true for ALL other active ones
  const res2 = await prisma.itinerary.updateMany({
    where: {
      id: { notIn: clientItineraryIds },
      deletedAt: null
    },
    data: { isTemplate: true }
  });
  console.log(`Updated ${res2.count} unlinked itineraries to isTemplate=true (Masters)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
