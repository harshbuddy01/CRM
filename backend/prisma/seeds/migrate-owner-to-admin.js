// ============================================================
// TravelCRM — Migrate Owner to Admin
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting migration: Unifying Owner and Admin roles...');

  // 1. Get the admin role
  const adminRole = await prisma.role.findFirst({
    where: { name: 'admin' },
  });

  if (!adminRole) {
    console.error('❌ Admin role not found. Cannot proceed.');
    process.exit(1);
  }

  // 2. Get the owner role
  const ownerRole = await prisma.role.findFirst({
    where: { name: 'owner' },
  });

  if (!ownerRole) {
    console.log('✅ Owner role does not exist. Nothing to do.');
    return;
  }

  // 3. Update all users with owner role to have admin role
  console.log(`  -> Moving users from owner to admin role...`);
  const result = await prisma.user.updateMany({
    where: { roleId: ownerRole.id },
    data: { roleId: adminRole.id },
  });
  console.log(`     Updated ${result.count} users.`);

  // 4. Delete orphaned permissions and overrides for the owner role
  console.log(`  -> Cleaning up old owner role permissions...`);
  await prisma.rolePermission.deleteMany({
    where: { roleId: ownerRole.id },
  });

  // 5. Delete the owner role itself
  console.log(`  -> Deleting the owner role...`);
  await prisma.role.delete({
    where: { id: ownerRole.id },
  });

  console.log('✅ Migration completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
