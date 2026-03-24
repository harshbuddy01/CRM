const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAman() {
  const email = 'amanasha481@gmail.com';
  const ownerRole = await prisma.role.findUnique({ where: { name: 'owner' } });
  
  if (!ownerRole) {
    console.log('Owner role not found');
    return;
  }

  const updated = await prisma.user.updateMany({
    where: { email: { equals: email, mode: 'insensitive' } },
    data: { roleId: ownerRole.id }
  });

  console.log(`Updated ${updated.count} users to System Owner.`);
}

updateAman()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
