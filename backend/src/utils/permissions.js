// ============================================================
// TravelCRM — Permission Resolver
// ============================================================
// Uses Prisma ORM queries instead of raw SQL to avoid
// compatibility issues with Prisma $extends.
// ============================================================

const { PrismaClient } = require('@prisma/client');

// Use a plain PrismaClient for raw-style lookups (no $extends interference)
let rawPrisma;
if (process.env.NODE_ENV === 'production') {
  rawPrisma = new PrismaClient();
} else {
  if (!global.__rawPrisma) {
    global.__rawPrisma = new PrismaClient();
  }
  rawPrisma = global.__rawPrisma;
}

async function getUserPermissions(userId) {
  // Get user's role
  const user = await rawPrisma.user.findUnique({
    where: { id: userId },
    select: { roleId: true },
  });

  if (!user) return {};

  // Get role-based permissions
  const rolePerms = await rawPrisma.rolePermission.findMany({
    where: { roleId: user.roleId },
    include: { permission: { select: { key: true } } },
  });

  const perms = {};
  for (const rp of rolePerms) {
    perms[rp.permission.key] = rp.granted;
  }

  // Get user-specific overrides
  const overrides = await rawPrisma.userPermissionOverride.findMany({
    where: { userId },
    include: { permission: { select: { key: true } } },
  });

  for (const override of overrides) {
    perms[override.permission.key] = override.granted;
  }

  return perms;
}

module.exports = { getUserPermissions };
