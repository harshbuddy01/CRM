// ============================================================
// TravelCRM — Branch Service (Sprint 8)
// ============================================================

const prisma = require('../config/prisma');

const listBranches = () => prisma.branch.findMany({
  include: { users: { select: { id: true, name: true, email: true, isActive: true } } },
  orderBy: { name: 'asc' },
});

const getBranch = (id) => prisma.branch.findUnique({
  where: { id },
  include: { users: { select: { id: true, name: true, email: true, isActive: true, role: { select: { label: true } } } } },
});

const createBranch = (data) => prisma.branch.create({ data });

const updateBranch = (id, data) => prisma.branch.update({ where: { id }, data });

const deleteBranch = (id) => prisma.branch.delete({ where: { id } });

const assignUserToBranch = (userId, branchId) =>
  prisma.user.update({ where: { id: userId }, data: { branchId } });

const removeUserFromBranch = (userId) =>
  prisma.user.update({ where: { id: userId }, data: { branchId: null } });

module.exports = {
  listBranches, getBranch, createBranch, updateBranch, deleteBranch,
  assignUserToBranch, removeUserFromBranch,
};
