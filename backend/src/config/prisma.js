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

module.exports = prisma;
