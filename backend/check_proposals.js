const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qId = "56f43237-675f-4a9a-80ad-f3be1b7d8962";
  const p = await prisma.proposal.findMany({ where: { queryId: qId } });
  console.log("Proposals for query:", p);
}
main().catch(console.error).finally(() => prisma.$disconnect());
