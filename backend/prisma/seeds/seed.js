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
  { key: 'users.view', label: 'View Users', module: 'users' },
  { key: 'users.manage', label: 'Manage Users', module: 'users' },
  { key: 'query.view_all', label: 'View all queries', module: 'queries' },
  { key: 'query.view_assigned', label: 'View assigned queries', module: 'queries' },
  { key: 'query.create', label: 'Create query', module: 'queries' },
  { key: 'query.edit_all', label: 'Edit all queries', module: 'queries' },
  { key: 'query.edit_own', label: 'Edit own queries', module: 'queries' },
  { key: 'query.delete', label: 'Delete queries', module: 'queries' },
  { key: 'query.assign', label: 'Assign queries', module: 'queries' },
  { key: 'query.status_change', label: 'Change query status', module: 'queries' },
  { key: 'proposal.view_all', label: 'View all proposals', module: 'proposals' },
  { key: 'proposal.view_assigned', label: 'View assigned proposals', module: 'proposals' },
  { key: 'proposal.create', label: 'Create proposal', module: 'proposals' },
  { key: 'proposal.edit_all', label: 'Edit all proposals', module: 'proposals' },
  { key: 'proposal.edit_own', label: 'Edit own proposals', module: 'proposals' },
  { key: 'proposal.delete', label: 'Delete proposals', module: 'proposals' },
  { key: 'proposal.send', label: 'Send proposals', module: 'proposals' },
  { key: 'tour.view_all', label: 'View all tours', module: 'tours' },
  { key: 'tour.view_assigned', label: 'View assigned tours', module: 'tours' },
  { key: 'tour.create', label: 'Create tour', module: 'tours' },
  { key: 'tour.edit_all', label: 'Edit all tours', module: 'tours' },
  { key: 'tour.edit_own', label: 'Edit own tours', module: 'tours' },
  { key: 'tour.delete', label: 'Delete tours', module: 'tours' },
  { key: 'tour.status_change', label: 'Change tour status', module: 'tours' },
  { key: 'tour.cancel', label: 'Cancel tour', module: 'tours' },
  { key: 'tour.edit_ops', label: 'Edit ops details', module: 'tours' },
  { key: 'payment.view_all', label: 'View all payments', module: 'payments' },
  { key: 'payment.view_assigned', label: 'View assigned payments', module: 'payments' },
  { key: 'payment.create', label: 'Create payment', module: 'payments' },
  { key: 'payment.edit_all', label: 'Edit all payments', module: 'payments' },
  { key: 'payment.edit_own', label: 'Edit own payments', module: 'payments' },
  { key: 'payment.delete', label: 'Delete payments', module: 'payments' },
  { key: 'payment.verify', label: 'Verify payments', module: 'payments' },
  { key: 'payment.bank', label: 'Bank payments', module: 'payments' },
  { key: 'report.view_sales', label: 'View sales reports', module: 'reports' },
  { key: 'report.view_finance', label: 'View finance reports', module: 'reports' },
  { key: 'report.view_ops', label: 'View ops reports', module: 'reports' },
  { key: 'report.export', label: 'Export reports', module: 'reports' },
  { key: 'master.view', label: 'View masters', module: 'masters' },
  { key: 'master.manage_destinations', label: 'Manage destinations', module: 'masters' },
  { key: 'master.manage_hotels', label: 'Manage hotels', module: 'masters' },
  { key: 'master.manage_vendors', label: 'Manage vendors', module: 'masters' },
  { key: 'master.manage_settings', label: 'Manage settings', module: 'masters' },
  { key: 'cancellation.view_all', label: 'View all cancellations', module: 'cancellations' },
  { key: 'cancellation.view_assigned', label: 'View assigned cancellations', module: 'cancellations' },
  { key: 'cancellation.create', label: 'Create cancellation', module: 'cancellations' },
  { key: 'cancellation.process', label: 'Process cancellation', module: 'cancellations' },
  { key: 'integration.view_logs', label: 'View integration logs', module: 'integrations' },
  { key: 'integration.manage_settings', label: 'Manage integration settings', module: 'integrations' },
  { key: 'activity.view_logs', label: 'View activity logs', module: 'activity' },
];

async function main() {
  console.log('🌱 Starting database seed...');

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

  console.log('  -> Mapping permissions to roles');
  
  // Helper to map permissions
  const mapPermissions = async (roleObj, permKeys) => {
    if (!roleObj) return;
    for (const key of permKeys) {
      if (!createdPerms[key]) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roleObj.id, permissionId: createdPerms[key].id } },
        update: {},
        create: { roleId: roleObj.id, permissionId: createdPerms[key].id, granted: true }
      });
    }
  };

  // Admin: All permissions
  await mapPermissions(createdRoles['admin'], Object.keys(createdPerms));

  // Sales Manager: query.*, proposal.* (except maybe hard deletes)
  const salesMgrPerms = Object.keys(createdPerms).filter(k => 
    k.startsWith('query.') || k.startsWith('proposal.') || k === 'users.view'
  );
  await mapPermissions(createdRoles['sales_manager'], salesMgrPerms);
  
  // Sales Exec: own leads only
  const salesExecPerms = [
    'query.view_assigned', 'query.create', 'query.edit_own', 'query.status_change',
    'proposal.view_assigned', 'proposal.create', 'proposal.edit_own', 'proposal.send'
  ];
  await mapPermissions(createdRoles['sales_exec'], salesExecPerms);

  // Ops: tour.* and view proposals
  const opsPerms = Object.keys(createdPerms).filter(k => k.startsWith('tour.'));
  opsPerms.push('proposal.view_all', 'master.view');
  await mapPermissions(createdRoles['ops'], opsPerms);

  // Accounts: payment.* and view tours/proposals
  const accountsPerms = Object.keys(createdPerms).filter(k => k.startsWith('payment.'));
  accountsPerms.push('tour.view_all', 'proposal.view_all', 'cancellation.view_all', 'cancellation.process');
  await mapPermissions(createdRoles['accounts'], accountsPerms);

  // Field Agent: tour.view_assigned only
  await mapPermissions(createdRoles['field_agent'], ['tour.view_assigned']);

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
        roleId: createdRoles['admin'].id,
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
