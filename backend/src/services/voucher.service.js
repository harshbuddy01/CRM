// ============================================================
// TravelCRM — Voucher Service (Sprint 10)
// ============================================================

const prisma = require('../config/prisma');

/**
 * Generate a unique voucher number
 */
const generateVoucherNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.voucher.count({
    where: { voucherNumber: { startsWith: `VCH-${year}` } },
  });
  return `VCH-${year}-${String(count + 1).padStart(3, '0')}`;
};

/**
 * List vouchers for a query
 */
const listByQuery = async (queryId) => {
  return prisma.voucher.findMany({
    where: { queryId },
    include: {
      creator: { select: { id: true, name: true } },
      bookingService: { select: { id: true, serviceName: true, serviceType: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Create a new voucher
 */
const createVoucher = async (data) => {
  data.voucherNumber = await generateVoucherNumber();
  return prisma.voucher.create({
    data: {
      queryId: data.queryId,
      bookingServiceId: data.bookingServiceId || null,
      voucherType: data.voucherType,
      voucherNumber: data.voucherNumber,
      confirmationNumber: data.confirmationNumber || null,
      supplierName: data.supplierName || null,
      hotelName: data.hotelName || null,
      destination: data.destination || null,
      leadPaxName: data.leadPaxName || null,
      paxDetails: data.paxDetails || null,
      checkIn: data.checkIn ? new Date(data.checkIn) : null,
      checkOut: data.checkOut ? new Date(data.checkOut) : null,
      checkInTime: data.checkInTime || null,
      checkOutTime: data.checkOutTime || null,
      roomType: data.roomType || null,
      mealPlan: data.mealPlan || null,
      greetingMessage: data.greetingMessage || null,
      createdBy: data.createdBy,
    },
    include: {
      creator: { select: { id: true, name: true } },
    },
  });
};

/**
 * Update voucher PDF URL after generation
 */
const updatePdfUrl = async (id, pdfUrl) => {
  return prisma.voucher.update({
    where: { id },
    data: { pdfUrl },
  });
};

/**
 * Mark voucher as sent
 */
const markSent = async (id) => {
  return prisma.voucher.update({
    where: { id },
    data: { status: 'sent' },
  });
};

/**
 * Get a single voucher by ID
 */
const getById = async (id) => {
  return prisma.voucher.findUnique({
    where: { id },
    include: {
      query: { select: { id: true, name: true, phone: true, email: true, destination: true, queryCode: true } },
      bookingService: true,
      creator: { select: { id: true, name: true, mobile: true } },
    },
  });
};

/**
 * Delete a voucher by ID
 */
const deleteVoucher = async (id) => {
  return prisma.voucher.delete({ where: { id } });
};

module.exports = {
  listByQuery,
  createVoucher,
  updatePdfUrl,
  markSent,
  getById,
  deleteVoucher,
};
