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
  return await prisma.client.findUnique({
    where: { id },
    include: {
      queries: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });
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
