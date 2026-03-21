// ============================================================
// TravelCRM — User Service
// ============================================================

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { BusinessError, NotFoundError } = require('../utils/AppError');

const listActiveAgents = async () => {
  return await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: {
        select: {
          name: true,
          label: true,
        }
      },
      isActive: true,
      isOnLeave: true,
      maxLeads: true,
      mobileOnly: true,
      createdAt: true,
      _count: {
        select: {
          assignedQueries: {
            where: { status: { notIn: ['lost', 'invalid', 'confirmed'] }, deletedAt: null }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });
};

/**
 * List ALL users with full admin detail
 */
const listAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: { select: { id: true, name: true, label: true } },
      isActive: true,
      isOnLeave: true,
      leaveUntil: true,
      maxLeads: true,
      mobileOnly: true,
      createdAt: true,
      _count: {
        select: {
          assignedQueries: {
            where: { status: { notIn: ['lost', 'invalid', 'confirmed'] }, deletedAt: null }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Create a new user (Admin only)
 */
const createUser = async (data) => {
  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmail) throw new BusinessError('A user with this email already exists');

  const role = await prisma.role.findUnique({ where: { id: data.roleId } });
  if (!role) throw new BusinessError('Invalid role ID');

  const passwordHash = await bcrypt.hash(data.password, 12);

  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      roleId: data.roleId,
      maxLeads: data.maxLeads || 50,
      mobileOnly: data.mobileOnly || false,
    },
    select: { id: true, name: true, email: true, role: { select: { name: true, label: true } } },
  });
};

/**
 * Update user details (Admin only)
 */
const updateUser = async (userId, data) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.roleId) updateData.roleId = data.roleId;
  if (data.maxLeads !== undefined) updateData.maxLeads = data.maxLeads;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.isOnLeave !== undefined) updateData.isOnLeave = data.isOnLeave;
  if (data.leaveUntil !== undefined) updateData.leaveUntil = data.leaveUntil ? new Date(data.leaveUntil) : null;
  if (data.mobileOnly !== undefined) updateData.mobileOnly = data.mobileOnly;
  if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 12);

  return await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, isActive: true, role: { select: { name: true, label: true } } },
  });
};

/**
 * Get all roles available in the system
 */
const listRoles = async () => {
  return await prisma.role.findMany({
    select: { id: true, name: true, label: true, description: true },
    orderBy: { name: 'asc' },
  });
};

/**
 * Get a user's permission overrides
 */
const getUserPermissions = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: {
        select: {
          id: true,
          name: true,
          label: true,
          rolePermissions: {
            select: {
              granted: true,
              permission: { select: { id: true, key: true, label: true, module: true } },
            }
          }
        }
      },
      permissionOverrides: {
        select: {
          id: true,
          granted: true,
          reason: true,
          permission: { select: { id: true, key: true, label: true, module: true } },
        }
      }
    }
  });

  if (!user) throw new NotFoundError('User');
  return user;
};

/**
 * Set a permission override for a user
 */
const setPermissionOverride = async (userId, permissionId, granted, reason, setBy) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
  if (!permission) throw new BusinessError('Invalid permission ID');

  return await prisma.userPermissionOverride.upsert({
    where: { userId_permissionId: { userId, permissionId } },
    update: { granted, reason, setBy },
    create: { userId, permissionId, granted, reason, setBy },
  });
};

/**
 * Remove a permission override (revert to role default)
 */
const removePermissionOverride = async (userId, permissionId) => {
  await prisma.userPermissionOverride.deleteMany({
    where: { userId, permissionId },
  });
};

module.exports = {
  listActiveAgents,
  listAllUsers,
  createUser,
  updateUser,
  listRoles,
  getUserPermissions,
  setPermissionOverride,
  removePermissionOverride,
};
