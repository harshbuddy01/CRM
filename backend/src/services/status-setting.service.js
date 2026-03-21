const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all statuses, ordered by sequence
const getAllStatuses = async () => {
  return await prisma.queryStatusSetting.findMany({
    orderBy: { sequence: 'asc' }
  });
};

// Update a single status setting
const updateStatusSetting = async (code, data) => {
  return await prisma.queryStatusSetting.update({
    where: { code },
    data: {
      label: data.label,
      colorHex: data.colorHex,
      isDashboardVisible: data.isDashboardVisible,
      isLocked: data.isLocked,
      takeNoteFlag: data.takeNoteFlag,
      sequence: data.sequence,
    }
  });
};

// Seed the default statuses if the table is empty
const seedDefaultStatuses = async () => {
  const count = await prisma.queryStatusSetting.count();
  if (count > 0) return true;

  const defaults = [
    { code: 'new', label: 'New', colorHex: '#3b82f6', isDashboardVisible: true, isLocked: false, takeNoteFlag: false, sequence: 10 },
    { code: 'quoted', label: 'Quoted', colorHex: '#8b5cf6', isDashboardVisible: true, isLocked: false, takeNoteFlag: false, sequence: 20 },
    { code: 'negotiation', label: 'Negotiation', colorHex: '#f59e0b', isDashboardVisible: true, isLocked: false, takeNoteFlag: false, sequence: 30 },
    { code: 'confirmed', label: 'Confirmed', colorHex: '#10b981', isDashboardVisible: true, isLocked: true, takeNoteFlag: true, sequence: 40 },
    { code: 'in_progress', label: 'In Progress', colorHex: '#06b6d4', isDashboardVisible: true, isLocked: true, takeNoteFlag: true, sequence: 50 },
    { code: 'completed', label: 'Completed', colorHex: '#64748b', isDashboardVisible: false, isLocked: true, takeNoteFlag: false, sequence: 60 },
    { code: 'lost', label: 'Lost', colorHex: '#ef4444', isDashboardVisible: false, isLocked: true, takeNoteFlag: true, sequence: 70 },
    { code: 'invalid', label: 'Invalid', colorHex: '#9ca3af', isDashboardVisible: false, isLocked: true, takeNoteFlag: false, sequence: 80 },
  ];

  await prisma.queryStatusSetting.createMany({ data: defaults });
  return true;
};

module.exports = {
  getAllStatuses,
  updateStatusSetting,
  seedDefaultStatuses,
};
