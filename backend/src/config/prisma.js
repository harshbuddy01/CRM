// ============================================================
// TravelCRM — Prisma Client Singleton
// ============================================================
// We create a SINGLE PrismaClient instance and reuse it across
// the entire app. This avoids "too many connections" errors
// during development with hot-reloading.
// ============================================================

const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, reuse the same instance across hot-reloads
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

// Global Soft Delete Middleware
const softDeleteModels = ['Query', 'QueryNote', 'Proposal', 'Tour', 'Payment'];

prisma.$use(async (params, next) => {
  if (softDeleteModels.includes(params.model)) {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where = { ...params.args.where, deletedAt: null };
    }
    if (params.action === 'findMany') {
      if (params.args.where) {
        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null;
        }
      } else {
        params.args.where = { deletedAt: null };
      }
    }
    // Automatically convert deletes to soft-deletes
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data.deletedAt = new Date();
      } else {
        params.args.data = { deletedAt: new Date() };
      }
    }
  }
  return next(params);
});

module.exports = prisma;
