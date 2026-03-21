const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllSettings = async () => {
  const settings = await prisma.orgSetting.findMany();
  // Transform from [{ key: 'companyName', value: '...' }, ...] to { companyName: '...' }
  return settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
};

const getSettingByKey = async (key) => {
  const setting = await prisma.orgSetting.findUnique({ where: { key } });
  return setting ? setting.value : null;
};

const saveSettings = async (settingsObj) => {
  // settingsObj is { key1: value1, key2: value2 }
  const operations = Object.entries(settingsObj).map(([key, value]) => {
    return prisma.orgSetting.upsert({
      where: { key },
      update: { value: value || '' },
      create: { key, value: value || '' },
    });
  });

  await prisma.$transaction(operations);
  return await getAllSettings();
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  saveSettings,
};
