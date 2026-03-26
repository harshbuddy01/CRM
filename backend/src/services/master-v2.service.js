// ============================================================
// TravelCRM — Master V2 Service (Sprint 7)
// ============================================================

const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const config = require('../config');

const SOFT_DELETE_MODELS = [
  'supplier',
];

const uploadToCloudinary = (buffer, folder = 'crm-masters') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

const getMasters = async (modelName, queryFilters = {}) => {
  const { search, page = 1, limit = 100 } = queryFilters;
  const skip = (page - 1) * parseInt(limit);
  const hasSoftDelete = SOFT_DELETE_MODELS.includes(modelName);
  
  const fieldMapping = {
    dayItineraryTemplate: 'title',
    supplier: 'companyName',
    transfer: 'vehicleType',
  };
  const orderField = fieldMapping[modelName] || 'name';
  const where = {};
  if (hasSoftDelete) where.deletedAt = null;
  if (search) {
    where.OR = [{ [orderField]: { contains: search, mode: 'insensitive' } }];
  }

  const includeDestination = ['activity','transfer','dayItineraryTemplate'].includes(modelName);

  const [items, total] = await Promise.all([
    prisma[modelName].findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { [orderField]: 'asc' },
      include: includeDestination ? { destination: { select: { id: true, name: true } } } : undefined,
    }),
    prisma[modelName].count({ where }),
  ]);
  return { items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) };
};

const createMaster = async (modelName, data, photoBuffer) => {
  const d = { ...data };
  if (photoBuffer) {
    const url = await uploadToCloudinary(photoBuffer, `crm-masters/${modelName}s`);
    if (modelName === 'packageTheme') d.iconUrl = url; else d.photoUrl = url;
  }
  if (d.pricePerPerson !== undefined) d.pricePerPerson = parseFloat(d.pricePerPerson) || 0;
  if (d.price !== undefined) d.price = parseFloat(d.price) || 0;
  if (d.dayCost !== undefined) d.dayCost = d.dayCost ? parseFloat(d.dayCost) : null;
  if (d.isActive !== undefined) d.isActive = d.isActive === 'true' || d.isActive === true;
  Object.keys(d).forEach(k => { if (d[k] === '' || d[k] === undefined) d[k] = null; });
  delete d.id;
  
  if (modelName === 'supplier') { delete d.name; delete d.type; }
  if (modelName === 'transfer') { d.vehicleType = d.vehicleType || d.name; delete d.name; }
  if (modelName === 'dayItineraryTemplate') { delete d.isActive; }

  return await prisma[modelName].create({ data: d });
};

const updateMaster = async (modelName, id, data, photoBuffer) => {
  const d = { ...data };
  if (photoBuffer) {
    const url = await uploadToCloudinary(photoBuffer, `crm-masters/${modelName}s`);
    if (modelName === 'packageTheme') d.iconUrl = url; else d.photoUrl = url;
  }
  if (d.pricePerPerson !== undefined) d.pricePerPerson = parseFloat(d.pricePerPerson) || 0;
  if (d.price !== undefined) d.price = parseFloat(d.price) || 0;
  if (d.dayCost !== undefined) d.dayCost = d.dayCost ? parseFloat(d.dayCost) : null;
  if (d.isActive !== undefined) d.isActive = d.isActive === 'true' || d.isActive === true;
  delete d.deletedAt; delete d.id;
  Object.keys(d).forEach(k => { if (d[k] === '' || d[k] === undefined) d[k] = null; });

  if (modelName === 'supplier') { delete d.name; delete d.type; }
  if (modelName === 'transfer') { d.vehicleType = d.vehicleType || d.name; delete d.name; }
  if (modelName === 'dayItineraryTemplate') { delete d.isActive; }

  return await prisma[modelName].update({ where: { id }, data: d });
};

const deleteMaster = async (modelName, id) => {
  try {
    if (SOFT_DELETE_MODELS.includes(modelName)) {
      return await prisma[modelName].update({ where: { id }, data: { deletedAt: new Date() } });
    }
    return await prisma[modelName].delete({ where: { id } });
  } catch (err) {
    // P2003 = FK constraint violation, P2025 = record not found
    if (err.code === 'P2003') {
      const e = new Error('Cannot delete: this record is referenced by other data (proposals, bookings, etc.). Remove those references first.');
      e.statusCode = 409;
      throw e;
    }
    if (err.code === 'P2025') {
      const e = new Error('Record not found or already deleted.');
      e.statusCode = 404;
      throw e;
    }
    throw err;
  }
};

const getDestinations = async () => {
  return await prisma.destination.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
};

module.exports = { getMasters, createMaster, updateMaster, deleteMaster, getDestinations, uploadToCloudinary };
