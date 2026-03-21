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
      mobile: true,
      mobile2: true,
      department: true,
      profilePhoto: true,
      createdAt: true,
      updatedAt: true,
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
  const normalizedEmail = data.email.toLowerCase();
  const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingEmail) throw new BusinessError('A user with this email already exists');

  const role = await prisma.role.findUnique({ where: { id: data.roleId } });
  if (!role) throw new BusinessError('Invalid role ID');

  const passwordHash = await bcrypt.hash(data.password, 12);

  const createData = {
    name: data.name,
    email: normalizedEmail,
    passwordHash,
    roleId: data.roleId,
    maxLeads: data.maxLeads || 50,
    mobileOnly: data.mobileOnly || false,
  };
  if (data.mobile) createData.mobile = data.mobile;
  if (data.mobile2) createData.mobile2 = data.mobile2;
  if (data.department) createData.department = data.department;
  if (data.profilePhoto) createData.profilePhoto = data.profilePhoto;

  return await prisma.user.create({
    data: createData,
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
  if (data.email) updateData.email = data.email.toLowerCase();
  if (data.roleId) updateData.roleId = data.roleId;
  if (data.maxLeads !== undefined) updateData.maxLeads = data.maxLeads;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.isOnLeave !== undefined) updateData.isOnLeave = data.isOnLeave;
  if (data.leaveUntil !== undefined) updateData.leaveUntil = data.leaveUntil ? new Date(data.leaveUntil) : null;
  if (data.mobileOnly !== undefined) updateData.mobileOnly = data.mobileOnly;
  if (data.mobile !== undefined) updateData.mobile = data.mobile;
  if (data.mobile2 !== undefined) updateData.mobile2 = data.mobile2;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.profilePhoto !== undefined) updateData.profilePhoto = data.profilePhoto;
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
 * Get user statistics for offboarding (active leads, active tours)
 */
const getUserOffboardStats = async (userId) => {
  const [activeLeads, activeTours] = await Promise.all([
    prisma.query.count({
      where: { assignedTo: userId, status: { notIn: ['lost', 'invalid', 'confirmed'] } }
    }),
    prisma.tour.count({
      where: { assignedOps: userId, status: { notIn: ['completed', 'cancelled'] } }
    })
  ]);
  
  return { activeLeads, activeTours };
};

/**
 * Deactivate a user and re-assign their leads/tours to another user
 */
const deleteUser = async (userId, adminId, reassignToId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');
  if (user.id === adminId) throw new BusinessError('You cannot delete yourself');
  
  const targetId = reassignToId || adminId;

  // Re-assign all active queries
  await prisma.query.updateMany({
    where: { assignedTo: userId, status: { notIn: ['lost', 'invalid', 'confirmed'] } },
    data: { assignedTo: targetId }
  });

  // Re-assign all active tours
  await prisma.tour.updateMany({
    where: { assignedOps: userId, status: { notIn: ['completed', 'cancelled'] } },
    data: { assignedOps: targetId }
  });

  // Soft deactivate user
  return await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
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
  deleteUser,
  getUserOffboardStats,
  listRoles,
  getUserPermissions,
  setPermissionOverride,
  removePermissionOverride,
};
