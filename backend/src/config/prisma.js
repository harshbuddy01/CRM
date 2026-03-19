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

// Global Soft Delete Extension (Prisma v5 recommended pattern)
const softDeleteModels = ['Query', 'QueryNote', 'Proposal', 'Tour', 'Payment'];

const extendedPrisma = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (softDeleteModels.includes(model)) {
          // Add deletedAt filter for reads
          if (operation === 'findUnique' || operation === 'findFirst' || operation === 'findMany') {
            args.where = { ...args.where, deletedAt: null };
            if (operation === 'findUnique') {
              // findUnique cannot take compound where clauses easily if it breaks uniqueness
              // Prisma recommends using findFirst instead when blending with logical ANDs
              return prisma[model].findFirst(args);
            }
          }
          // Convert deletes to update(deletedAt)
          if (operation === 'delete') {
            return prisma[model].update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          if (operation === 'deleteMany') {
            return prisma[model].updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
        }
        return query(args);
      },
    },
  },
});

module.exports = extendedPrisma;
