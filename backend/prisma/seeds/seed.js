// ============================================================
// TravelCRM — Database Seed Script
// ============================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const roles = [
  { name: 'admin', label: 'Administrator', description: 'Full system access' },
  { name: 'sales_manager', label: 'Sales Manager', description: 'Can view/reassign all sales leads' },
  { name: 'sales_exec', label: 'Sales Executive', description: 'Can only view own leads' },
  { name: 'ops', label: 'Operations', description: 'Manages tours' },
  { name: 'accounts', label: 'Accounts', description: 'Records payments' },
  { name: 'field_agent', label: 'Field Agent', description: 'Mobile-only field worker' },
];

const permissions = [
  // User Management
  { key: 'users.manage', label: 'Manage Users', module: 'users' },
  // Queries
  { key: 'query.view_all', label: 'View all queries', module: 'queries' },
  { key: 'query.create', label: 'Create new query', module: 'queries' },
  { key: 'query.edit_all', label: 'Edit any query', module: 'queries' },
  { key: 'query.assign', label: 'Assign queries to agents', module: 'queries' },
  { key: 'query.delete', label: 'Delete queries', module: 'queries' },
  // ... more permissions can be seeded later for proposals/tours/payments
];

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Roles
  console.log('  -> Seeding roles');
  const createdRoles = {};
  for (const roleDef of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {},
      create: roleDef,
    });
    createdRoles[role.name] = role;
  }

  // 2. Seed Permissions
  console.log('  -> Seeding permissions');
  const createdPerms = {};
  for (const permDef of permissions) {
    const perm = await prisma.permission.upsert({
      where: { key: permDef.key },
      update: {},
      create: permDef,
    });
    createdPerms[perm.key] = perm;
  }

  // 3. Map Admin to ALL permissions
  console.log('  -> Mapping permissions to roles');
  const adminRole = createdRoles['admin'];
  for (const permKey in createdPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: createdPerms[permKey].id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: createdPerms[permKey].id,
        granted: true,
      },
    });
  }

  // Example: Sales Manager gets query view_all and assign
  const salesMgr = createdRoles['sales_manager'];
  for (const key of ['query.view_all', 'query.create', 'query.assign']) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: salesMgr.id, permissionId: createdPerms[key].id } },
      update: {}, create: { roleId: salesMgr.id, permissionId: createdPerms[key].id, granted: true }
    });
  }
  
  // Example: Sales Exec gets create
  const salesExec = createdRoles['sales_exec'];
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: salesExec.id, permissionId: createdPerms['query.create'].id } },
    update: {}, create: { roleId: salesExec.id, permissionId: createdPerms['query.create'].id, granted: true }
  });

  // 4. Seed Default Admin User
  console.log('  -> Seeding admin user');
  const adminEmail = 'admin@travelcrm.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await prisma.user.create({
      data: {
        name: 'System Admin',
        email: adminEmail,
        passwordHash,
        roleId: adminRole.id,
      },
    });
    console.log(`     Created admin user: ${adminEmail} / 'Admin@123'`);
  }

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
