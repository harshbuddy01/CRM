// ============================================================
// TravelCRM — Sheet Sync Service (Sprint 8)
// ============================================================
// NOTE: Full Google Sheets API integration requires a
// Google Cloud Service Account. This module provides the
// configuration CRUD and a manual sync placeholder.
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listConfigs = () => prisma.sheetSyncConfig.findMany({ orderBy: { name: 'asc' } });

const getConfig = (id) => prisma.sheetSyncConfig.findUnique({ where: { id } });

const createConfig = (data) => {
  if (typeof data.columnMapping === 'string') data.columnMapping = JSON.parse(data.columnMapping);
  if (data.syncInterval) data.syncInterval = parseInt(data.syncInterval, 10);
  return prisma.sheetSyncConfig.create({ data });
};

const updateConfig = (id, data) => {
  if (typeof data.columnMapping === 'string') data.columnMapping = JSON.parse(data.columnMapping);
  if (data.syncInterval) data.syncInterval = parseInt(data.syncInterval, 10);
  return prisma.sheetSyncConfig.update({ where: { id }, data });
};

const deleteConfig = (id) => prisma.sheetSyncConfig.delete({ where: { id } });

/**
 * Manual sync trigger (placeholder).
 * When Google Sheets API credentials are configured, this function
 * will fetch rows from the sheet and create Query records.
 */
const triggerSync = async (id) => {
  const config = await prisma.sheetSyncConfig.findUnique({ where: { id } });
  if (!config) throw new Error('Config not found');

  // TODO: Implement Google Sheets API integration
  // 1. Use googleapis package with service account credentials
  // 2. Read rows from config.sheetId, tab config.tabName
  // 3. Map columns using config.columnMapping
  // 4. Deduplicate by phone number
  // 5. Create Query records for new leads
  // 6. Update config.lastSyncAt

  await prisma.sheetSyncConfig.update({
    where: { id },
    data: { lastSyncAt: new Date() },
  });

  return { message: 'Sync configuration saved. Google Sheets API integration pending setup.' };
};

module.exports = { listConfigs, getConfig, createConfig, updateConfig, deleteConfig, triggerSync };
