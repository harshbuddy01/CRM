const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const itineraries = await prisma.itinerary.findMany({
    where: { deletedAt: null, isTemplate: true },
    select: {
      id: true,
      title: true,
      isTemplate: true,
      _count: { select: { days: true } }
    },
    take: 10
  });
  console.log("Master Templates Counts:", itineraries);
}
main().catch(console.error).finally(() => prisma.$disconnect());
