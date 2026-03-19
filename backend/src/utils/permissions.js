const prisma = require('../config/prisma');

async function getUserPermissions(userId) {
  const rolePerms = await prisma.$queryRaw`
    SELECT p.key, rp.granted
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN users u ON u.role_id = rp.role_id
    WHERE u.id = ${userId}::uuid
  `;

  const perms = {};
  for (const row of rolePerms) { perms[row.key] = row.granted; }

  const overrides = await prisma.$queryRaw`
    SELECT p.key, upo.granted
    FROM user_permission_overrides upo
    JOIN permissions p ON p.id = upo.permission_id
    WHERE upo.user_id = ${userId}::uuid
  `;

  for (const override of overrides) { perms[override.key] = override.granted; }
  return perms;
}

module.exports = { getUserPermissions };
