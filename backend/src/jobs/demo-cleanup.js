const prisma = require('../config/prisma');

async function cleanupSingleDemoUser(userId) {
  try {
    console.log(`[Demo Cleanup] Cleaning up data for demo user ${userId}`);

    // 1. Delete Proposals
    await prisma.proposal.deleteMany({ where: { createdBy: userId } });
    
    // 2. Activity Logs
    await prisma.activityLog.deleteMany({ where: { userId } });
    
    // 3. User Sessions
    await prisma.userSession.deleteMany({ where: { userId } });

    // 4. Payments recorded by user
    await prisma.payment.deleteMany({ where: { recordedBy: userId } });

    // 5. Queries and related
    const queries = await prisma.query.findMany({ where: { assignedTo: userId } });
    const queryIds = queries.map(q => q.id);

    if (queryIds.length > 0) {
      await prisma.payment.deleteMany({ where: { queryId: { in: queryIds } } });
      await prisma.proposal.deleteMany({ where: { queryId: { in: queryIds } } });
      await prisma.queryNote.deleteMany({ where: { queryId: { in: queryIds } } });
      
      // Get associated clients to clean them up too
      const clientIds = queries.map(q => q.clientId).filter(Boolean);
      
      await prisma.query.deleteMany({ where: { id: { in: queryIds } } });

      if (clientIds.length > 0) {
         // Only delete clients if they have no other queries
         for (const cId of clientIds) {
             const otherQueries = await prisma.query.findFirst({ where: { clientId: cId } });
             if (!otherQueries) {
                 await prisma.client.delete({ where: { id: cId } });
             }
         }
      }
    }

    // 6. Itineraries
    try {
        await prisma.itinerary.deleteMany({ where: { createdBy: userId } });
    } catch(e) {
        // ignore if model isn't exactly as expected
    }

    // Finally delete user
    await prisma.user.delete({ where: { id: userId } });
    console.log(`[Demo Cleanup] Successfully deleted demo user ${userId}`);
  } catch (err) {
    console.error(`[Demo Cleanup] Error cleaning up user ${userId}:`, err);
  }
}

async function cleanupExpiredDemoSessions() {
  console.log('[Demo Cleanup] Checking for expired demo sessions...');
  try {
    const expiredUsers = await prisma.user.findMany({
      where: {
        isDemo: true,
        demoExpiresAt: {
          lt: new Date(),
        }
      }
    });

    if (expiredUsers.length > 0) {
      console.log(`[Demo Cleanup] Found ${expiredUsers.length} expired demo users.`);
      for (const user of expiredUsers) {
        await cleanupSingleDemoUser(user.id);
      }
    } else {
      console.log('[Demo Cleanup] No expired demo sessions found.');
    }
  } catch (error) {
    console.error('[Demo Cleanup] Error running cleanup job:', error);
  }
}

module.exports = {
  cleanupExpiredDemoSessions,
  cleanupSingleDemoUser
};
