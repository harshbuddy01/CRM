// ============================================================
// TravelCRM — Finance Service (Sprint 8)
// ============================================================

const prisma = require('../config/prisma');

// ─── Expenses ────────────────────────────────────────────────
const listExpenses = async ({ category, from, to, page = 1, limit = 50 }) => {
  const where = {};
  if (category) where.category = category;
  if (from || to) {
    where.expenseDate = {};
    if (from) where.expenseDate.gte = new Date(from);
    if (to) where.expenseDate.lte = new Date(to);
  }
  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where, orderBy: { expenseDate: 'desc' },
      skip: (page - 1) * limit, take: limit,
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.expense.count({ where }),
  ]);
  return { items, total, page, limit };
};

const createExpense = (data) => {
  data.amount = parseFloat(data.amount);
  data.expenseDate = new Date(data.expenseDate);
  return prisma.expense.create({ data });
};

const updateExpense = (id, data) => {
  if (data.amount) data.amount = parseFloat(data.amount);
  if (data.expenseDate) data.expenseDate = new Date(data.expenseDate);
  return prisma.expense.update({ where: { id }, data });
};

const deleteExpense = (id) => prisma.expense.delete({ where: { id } });

// ─── Invoices ────────────────────────────────────────────────
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({ where: { invoiceNumber: { startsWith: `INV-${year}` } } });
  return `INV-${year}-${String(count + 1).padStart(3, '0')}`;
};

const listInvoices = async ({ status, page = 1, limit = 50 }) => {
  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit, take: limit,
      include: { creator: { select: { id: true, name: true } } },
    }),
    prisma.invoice.count({ where }),
  ]);
  return { items, total, page, limit };
};

const getInvoice = (id) => prisma.invoice.findUnique({
  where: { id },
  include: { creator: { select: { id: true, name: true } } },
});

const createInvoice = async (data) => {
  data.invoiceNumber = await generateInvoiceNumber();

  if (data.queryId && !data.totalAmount) {
    // Auto-generate from proposal
    const proposal = await prisma.proposal.findFirst({
      where: { queryId: data.queryId, deletedAt: null },
      orderBy: { version: 'desc' },
    });
    if (!proposal) throw new Error('No proposal found to generate invoice from');

    data.subtotal = Number(proposal.sellingPrice);
    data.taxPercent = 0;
    data.taxAmount = 0;
    data.totalAmount = Number(proposal.sellingPrice);
    data.dueDate = new Date();
    data.dueDate.setDate(data.dueDate.getDate() + 7); // Default due in 7 days
    data.items = [{ description: 'Tour Package', amount: data.subtotal, quantity: 1, unitPrice: data.subtotal }];
  } else {
    data.subtotal = parseFloat(data.subtotal);
    data.taxPercent = parseFloat(data.taxPercent || 0);
    data.taxAmount = parseFloat(data.taxAmount || 0);
    data.totalAmount = parseFloat(data.totalAmount);
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    if (typeof data.items === 'string') data.items = JSON.parse(data.items);
  }

  return prisma.invoice.create({ data });
};

const updateInvoice = (id, data) => {
  if (data.subtotal) data.subtotal = parseFloat(data.subtotal);
  if (data.taxPercent) data.taxPercent = parseFloat(data.taxPercent);
  if (data.taxAmount) data.taxAmount = parseFloat(data.taxAmount);
  if (data.totalAmount) data.totalAmount = parseFloat(data.totalAmount);
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  if (typeof data.items === 'string') data.items = JSON.parse(data.items);
  if (data.status === 'sent' && !data.sentAt) data.sentAt = new Date();
  if (data.status === 'paid' && !data.paidAt) data.paidAt = new Date();
  return prisma.invoice.update({ where: { id }, data });
};

const deleteInvoice = (id) => prisma.invoice.delete({ where: { id } });

// ─── Vendor Payments ─────────────────────────────────────────
const listVendorPayments = async ({ from, to, supplierId, page = 1, limit = 50 }) => {
  const where = {};
  if (supplierId) where.supplierId = supplierId;
  if (from || to) {
    where.paymentDate = {};
    if (from) where.paymentDate.gte = new Date(from);
    if (to) where.paymentDate.lte = new Date(to);
  }
  const [items, total] = await Promise.all([
    prisma.vendorPayment.findMany({
      where, orderBy: { paymentDate: 'desc' },
      skip: (page - 1) * limit, take: limit,
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.vendorPayment.count({ where }),
  ]);
  return { items, total, page, limit };
};

const createVendorPayment = (data) => {
  data.amount = parseFloat(data.amount);
  data.paymentDate = new Date(data.paymentDate);
  return prisma.vendorPayment.create({ data });
};

const deleteVendorPayment = (id) => prisma.vendorPayment.delete({ where: { id } });

// ─── P&L Summary ─────────────────────────────────────────────
const getPnlSummary = async (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // last day of month

  const [revenue, expenses, vendorPayouts] = await Promise.all([
    // Revenue = sum of verified/banked client payments
    prisma.payment.aggregate({
      where: {
        paymentDate: { gte: startDate, lte: endDate },
        status: { in: ['verified', 'banked'] },
        deletedAt: null,
      },
      _sum: { amount: true },
    }),
    // Expenses = sum of all business expenses
    prisma.expense.aggregate({
      where: { expenseDate: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    // Vendor payouts
    prisma.vendorPayment.aggregate({
      where: { paymentDate: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
  ]);

  const totalRevenue = Number(revenue._sum.amount || 0);
  const totalExpenses = Number(expenses._sum.amount || 0);
  const totalVendorPayouts = Number(vendorPayouts._sum.amount || 0);
  const netProfit = totalRevenue - totalExpenses - totalVendorPayouts;

  return {
    year, month,
    totalRevenue,
    totalExpenses,
    totalVendorPayouts,
    netProfit,
  };
};

module.exports = {
  listExpenses, createExpense, updateExpense, deleteExpense,
  listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice,
  listVendorPayments, createVendorPayment, deleteVendorPayment,
  getPnlSummary,
};
