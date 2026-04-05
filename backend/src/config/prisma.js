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
const softDeleteModels = [
  'Query', 'QueryNote', 'Proposal', 'Tour', 'Payment', 'Invoice', 'VendorPayment',
  'Supplier', 'Activity', 'Transfer', 'RoomType', 'MealPlan', 'PackageTheme', 'DayItineraryTemplate'
];

const extendedPrisma = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (softDeleteModels.includes(model)) {
          // Add deletedAt filter for all read operations
          const readOperations = ['findFirst', 'findMany', 'findFirstOrThrow', 'findUnique', 'findUniqueOrThrow', 'count'];
          if (readOperations.includes(operation)) {
            args.where = args.where || {};
            if (args.where.__withDeleted) {
              delete args.where.__withDeleted;
            } else {
              args.where.deletedAt = null;
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
