// ============================================================
// TravelCRM — Driver Controller
// ============================================================

const prisma = require('../config/prisma');
const { NotFoundError, BusinessError } = require('../utils/AppError');

// List all active drivers
const list = async (req, res, next) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: drivers });
  } catch (error) {
    next(error);
  }
};

// Create a new driver
const create = async (req, res, next) => {
  try {
    const { name, phone, vehicleName, vehicleNo } = req.body;
    if (!name || !phone || !vehicleName || !vehicleNo) {
      throw new BusinessError('Name, phone, vehicle name, and vehicle number are required');
    }

    const existing = await prisma.driver.findUnique({ where: { phone } });
    if (existing && !existing.deletedAt) {
      throw new BusinessError(`A driver with phone number ${phone} already exists`);
    }

    const driver = await prisma.driver.create({
      data: { name, phone, vehicleName, vehicleNo },
    });
    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

// Update a driver
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, vehicleName, vehicleNo, isActive } = req.body;

    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver || driver.deletedAt) throw new NotFoundError('Driver');

    const updated = await prisma.driver.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(vehicleName !== undefined && { vehicleName }),
        ...(vehicleNo !== undefined && { vehicleNo }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Soft-delete a driver
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver || driver.deletedAt) throw new NotFoundError('Driver');

    await prisma.driver.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    res.json({ success: true, message: 'Driver removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, create, update, remove };
