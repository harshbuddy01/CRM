const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');

const sanitizePublicId = (filename) => {
  if (!filename) return undefined;
  const name = String(filename).replace(/\.[^.]+$/, '');
  const sanitized = name.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').substring(0, 100);
  return sanitized || `upload-${Date.now()}`;
};

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

const uploadAsset = async (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'travelcrm/settings',
        resource_type: 'auto',
        public_id: sanitizePublicId(file.originalname),
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  saveSettings,
  uploadAsset,
};
