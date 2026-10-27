const prisma = require('../config/prisma');

const getAllClients = async (queryFilters = {}) => {
  const { search, page = 1, limit = 10 } = queryFilters;
  const skip = (page - 1) * limit;

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { queries: true } }
      }
    }),
    prisma.client.count({ where })
  ]);

  return {
    clients,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getClientById = async (id) => {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      queries: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        include: {
          tours: {
            where: { deletedAt: null },
            select: { id: true, tourCode: true, status: true, startDate: true, endDate: true }
          },
          proposals: {
            where: { deletedAt: null },
            orderBy: { version: 'desc' },
            take: 1,
            select: { sellingPrice: true, totalCost: true }
          }
        }
      }
    }
  });

  if (!client) return null;

  const queryIds = client.queries.map(q => q.id);

  // Fetch all payments for this client's queries or tours
  const payments = await prisma.payment.findMany({
    where: {
      deletedAt: null,
      queryId: { in: queryIds }
    },
    orderBy: { paymentDate: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, mobile: true, role: true } },
      query: { select: { id: true, queryCode: true, destination: true } },
      tour: { select: { id: true, tourCode: true, status: true } }
    }
  });

  const totalBookingsValue = client.queries.reduce((sum, q) => {
    const val = q.proposals?.[0]?.sellingPrice || q.budget || 0;
    return sum + Number(val);
  }, 0);

  const totalPaid = payments
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const balanceDue = totalBookingsValue - totalPaid;

  return {
    ...client,
    financialSummary: {
      totalBookingsValue,
      totalPaid,
      balanceDue
    },
    payments: payments.map(p => ({
      ...p,
      amount: Number(p.amount),
      collector: p.user ? {
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        mobile: p.user.mobile,
        role: typeof p.user.role === 'object' ? (p.user.role?.label || p.user.role?.name || 'Staff') : (p.user.role || 'Staff')
      } : null
    }))
  };
};

const createClient = async (data) => {
  return await prisma.client.create({ data });
};

const updateClient = async (id, data) => {
  return await prisma.client.update({
    where: { id },
    data
  });
};

// Statuses that indicate the client has active/real business — deletion must be blocked
const ACTIVE_STATUSES = ['confirmed', 'in_progress', 'completed'];

const deleteClient = async (id) => {
  // Safety check: block deletion if any confirmed/active queries exist for this client
  const activeQueryCount = await prisma.query.count({
    where: {
      clientId: id,
      status: { in: ACTIVE_STATUSES },
      deletedAt: null, // Exclude soft-deleted queries
    },
  });

  if (activeQueryCount > 0) {
    const err = new Error(
      `Cannot delete client — they have ${activeQueryCount} active or confirmed booking${activeQueryCount > 1 ? 's' : ''}. ` +
      `Please close or cancel all bookings before deleting this client.`
    );
    err.statusCode = 409; // Conflict
    throw err;
  }

  // Only unlink queries that are in inactive/dead statuses (lost, invalid, new, quoted, negotiation)
  await prisma.query.updateMany({
    where: { clientId: id },
    data: { clientId: null },
  });

  return await prisma.client.delete({ where: { id } });
};

// Logic to auto-create client from query info
const ensureClientFromQuery = async (queryId) => {
  const query = await prisma.query.findUnique({ where: { id: queryId } });
  if (!query || query.clientId) return query?.clientId;

  // Search if a client with this phone/email already exists
  let client = await prisma.client.findFirst({
    where: {
      OR: [
        { phone: query.phone },
        query.email ? { email: query.email } : null
      ].filter(Boolean)
    }
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        name: query.name,
        email: query.email,
        phone: query.phone,
        city: query.destination, // best guess
      }
    });
  }

  // Link the query to the client
  await prisma.query.update({
    where: { id: queryId },
    data: { clientId: client.id }
  });

  return client.id;
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  ensureClientFromQuery,
};
