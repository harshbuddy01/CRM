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

const listInvoices = async ({ status, queryId, page = 1, limit = 50 }) => {
  const where = { deletedAt: null };
  if (status) where.status = status;
  if (queryId) where.queryId = queryId;
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

  const query = data.queryId ? await prisma.query.findUnique({
    where: { id: data.queryId },
    include: {
      proposals: {
        where: { deletedAt: null },
        orderBy: { version: 'desc' },
        take: 1
      }
    }
  }) : null;

  const proposal = query?.proposals?.[0];

  // Populate client details from query if available
  if (query) {
    data.clientName = data.clientName || query.name;
    data.clientEmail = data.clientEmail || query.email;
    data.clientPhone = data.clientPhone || query.phone;
  }

  if (data.queryId && !data.totalAmount) {
    // Auto-generate from proposal
    if (!proposal) {
      if (!data.totalAmount) {
        throw new Error('No proposal found to generate invoice from. Please provide a total amount manually.');
      }
      // If totalAmount is provided manually, ensure other fields are initialized
      data.subtotal = data.subtotal || data.totalAmount;
      data.items = data.items || [{ description: 'Manual Invoice Item', amount: data.totalAmount, quantity: 1, unitPrice: data.totalAmount }];
    } else {
      data.subtotal = Number(proposal.sellingPrice);
      data.taxPercent = Number(data.taxPercent || 0);
      data.taxAmount = (data.subtotal * data.taxPercent) / 100;
      data.totalAmount = data.subtotal + data.taxAmount;
      data.dueDate = data.dueDate ? new Date(data.dueDate) : new Date();
      if (!data.dueDate.getTime()) {
        data.dueDate = new Date();
        data.dueDate.setDate(data.dueDate.getDate() + 7); 
      }
      data.items = data.items || [{ description: 'Tour Package', amount: data.subtotal, quantity: 1, unitPrice: data.subtotal }];
    }
  } else {
    data.subtotal = parseFloat(data.subtotal || 0);
    data.taxPercent = parseFloat(data.taxPercent || 0);
    data.taxAmount = parseFloat(data.taxAmount || 0);
    data.totalAmount = parseFloat(data.totalAmount || (data.subtotal + data.taxAmount));
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    if (typeof data.items === 'string') data.items = JSON.parse(data.items);
  }

  // Final validation check for required fields after enrichment
  if (!data.clientName) {
    throw new Error('Client Name is required to generate an invoice.');
  }

  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        data.invoiceNumber = await generateInvoiceNumber(); // Regenerate on collision
      }
      return await prisma.invoice.create({ data });
    } catch (e) {
      if (e.code === 'P2002' && attempt < MAX_RETRIES) continue;
      throw e;
    }
  }
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

const deleteInvoice = (id) => prisma.invoice.update({ where: { id }, data: { deletedAt: new Date() } });

const regenerateInvoice = async (id) => {
  const existing = await prisma.invoice.findUnique({
    where: { id },
    include: { creator: true }
  });
  if (!existing) throw new Error('Invoice not found');
  if (!existing.queryId) throw new Error('Only invoices linked to a query can be auto-regenerated');

  const query = await prisma.query.findUnique({
    where: { id: existing.queryId },
    include: {
      proposals: {
        where: { deletedAt: null },
        orderBy: { version: 'desc' },
        take: 1
      }
    }
  });

  if (!query) throw new Error('Linked query not found or was deleted');

  const proposal = query.proposals?.[0];
  const updateData = {
    clientName: query.name,
    clientEmail: query.email,
    clientPhone: query.phone,
  };

  if (proposal) {
    updateData.subtotal = Number(proposal.sellingPrice);
    updateData.taxAmount = (Number(updateData.subtotal) * Number(existing.taxPercent)) / 100;
    updateData.totalAmount = Number(updateData.subtotal) + Number(updateData.taxAmount);
    updateData.items = [{ description: 'Tour Package', amount: updateData.subtotal, quantity: 1, unitPrice: updateData.subtotal }];
  }

  // Fetch customer payments to update invoice status
  const customerPayments = await prisma.payment.findMany({
    where: { queryId: existing.queryId, deletedAt: null, status: { in: ['verified', 'banked'] } },
  });
  const totalReceived = customerPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const invoiceTotal = updateData.totalAmount || Number(existing.totalAmount);
  const balanceDue = invoiceTotal - totalReceived;

  // Auto-update invoice status based on payments
  if (totalReceived >= invoiceTotal && invoiceTotal > 0) {
    updateData.status = 'paid';
    updateData.paidAt = updateData.paidAt || new Date();
  }

  // Include payment summary in notes
  updateData.notes = `Total: ₹${invoiceTotal.toLocaleString('en-IN')} | Received: ₹${totalReceived.toLocaleString('en-IN')} | Balance: ₹${Math.max(0, balanceDue).toLocaleString('en-IN')} (auto-updated ${new Date().toLocaleDateString('en-IN')})`;

  return await prisma.invoice.update({
    where: { id },
    data: updateData
  });
};

// ─── Vendor Payments ─────────────────────────────────────────
const listVendorPayments = async ({ from, to, supplierId, page = 1, limit = 50 }) => {
  const where = { deletedAt: null };
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

const deleteVendorPayment = (id) => prisma.vendorPayment.update({ where: { id }, data: { deletedAt: new Date() } });

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
  listInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, regenerateInvoice,
  listVendorPayments, createVendorPayment, deleteVendorPayment,
  getPnlSummary,
};
