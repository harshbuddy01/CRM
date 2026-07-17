const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dests = await prisma.destination.findMany({
    select: { id: true, name: true }
  });
  console.log('Available Destinations in DB:', dests);

  const destCms = await prisma.destinationCms.findMany({
    include: { destination: { select: { name: true } } }
  });
  console.log('Destination CMS entries in DB:', destCms);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
