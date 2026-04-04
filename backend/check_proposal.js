const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const proposalId = "2af5e3af-1680-4131-89d1-cd2c1ece7ed4";
  const p = await prisma.proposal.findUnique({ where: { id: proposalId } });
  console.log("Proposal:", p);
}
main().catch(console.error).finally(() => prisma.$disconnect());
