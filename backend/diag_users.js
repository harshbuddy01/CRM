const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: { select: { name: true } } }
  });
  console.log('--- USER LIST ---');
  users.forEach(u => {
    console.log(`ID: ${u.id} | Name: ${u.name} | Email: "${u.email}" | Role: ${u.role?.name}`);
  });
  console.log('--- END ---');

  const amanEmail = 'amanasha481@gmail.com';
  const ownerRole = await prisma.role.findUnique({ where: { name: 'owner' } });
  
  if (ownerRole) {
    const res = await prisma.user.updateMany({
      where: { email: { equals: amanEmail, mode: 'insensitive' } },
      data: { roleId: ownerRole.id }
    });
    console.log(`Force updated ${res.count} users to owner role.`);
  }
}

checkUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
