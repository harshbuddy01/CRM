// ============================================================
// TravelCRM — Scheduled Cron Jobs
// ============================================================

const cron = require('node-cron');
const prisma = require('./config/prisma');

const startCronJobs = () => {
  // Run every day at 09:00 AM server time
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Starting daily 9AM evaluation tasks...');

    try {
      // -----------------------------------------------------
      // TASK 1: Follow-up Escalations
      // -----------------------------------------------------
      // Find notes where followUpAt was yesterday/earlier and
      // the query is still active (not confirmed/lost)
      const overdueNotes = await prisma.queryNote.findMany({
        where: {
          followUpAt: { lte: new Date() },
          deletedAt: null,
          query: { status: { notIn: ['confirmed', 'lost', 'invalid'] } }
        },
        include: { query: { select: { id: true, assignedTo: true } } }
      });

      console.log(`[CRON] Found ${overdueNotes.length} overdue followups to escalate`);

      for (const note of overdueNotes) {
        if (!note.query.assignedTo) continue;

        // Log notification to DB
        await prisma.notification.create({
          data: {
            userId: note.query.assignedTo,
            type: 'followup_due',
            message: `Follow-up is overdue for Lead ${note.query.id}.`,
            priority: 'high',
            relatedType: 'query',
            relatedId: note.query.id,
            channel: 'in_app'
          }
        });

        // Clear the followUpAt so it doesn't alert every single day and flood the user
        await prisma.queryNote.update({
          where: { id: note.id },
          data: { followUpAt: null }
        });
      }

      // -----------------------------------------------------
      // TASK 2: Tour Reminders (2 Days Before)
      // -----------------------------------------------------
      const targetStartDelay = new Date();
      targetStartDelay.setDate(targetStartDelay.getDate() + 2);

      // We want tours starting ON exactly the target day
      const startOfDay = new Date(targetStartDelay.setHours(0,0,0,0));
      const endOfDay = new Date(targetStartDelay.setHours(23,59,59,999));

      const upcomingTours = await prisma.tour.findMany({
        where: {
          status: 'upcoming',
          deletedAt: null,
          startDate: { gte: startOfDay, lte: endOfDay }
        },
        include: { 
          assignedOpsUser: { select: { id: true } }, 
          query: { select: { assignedTo: true } } 
        }
      });

      console.log(`[CRON] Found ${upcomingTours.length} tours starting in exactly 2 days.`);

      for (const tour of upcomingTours) {
        const notifyUser = tour.assignedOpsUser?.id || tour.query.assignedTo;
        if (!notifyUser) continue;

        await prisma.notification.create({
          data: {
            userId: notifyUser,
            type: 'tour_starting',
            message: `Tour ${tour.tourCode} is starting in 2 days. Verify all operations.`,
            priority: 'high',
            relatedType: 'tour',
            relatedId: tour.id,
            channel: 'in_app'
          }
        });
      }

    } catch (error) {
      console.error('[CRON Error]', error);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log('⏰ Cron scheduler active (9 AM tasks).');

  // Run every day at Midnight (00:00) server time
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Starting midnight cleanup tasks...');

    // ── Task 1: Clean up expired user sessions ──
    try {
      const expiredSessions = await prisma.userSession.findMany({
        where: { expiresAt: { lt: new Date() } },
        select: { userId: true }
      });

      if (expiredSessions.length > 0) {
        const logData = expiredSessions.map(session => ({
          userId: session.userId,
          action: 'user.logout',
          entityType: 'user',
          entityId: session.userId,
          newValue: { reason: 'Session expired (system auto logout)' }
        }));

        await prisma.activityLog.createMany({
          data: logData
        });
      }

      const sessionResult = await prisma.userSession.deleteMany({
        where: { expiresAt: { lt: new Date() } }
      });
      console.log(`[CRON] Cleaned up ${sessionResult.count} expired sessions.`);
    } catch (error) {
      console.error('[CRON Error] Session cleanup failed:', error);
    }

    // ── Task 2: Purge Activity Logs older than 7 days ──
    // This keeps the DB lean — only the last 7 days of team activity
    // are retained. Older logs are permanently deleted every night.
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const purgeResult = await prisma.activityLog.deleteMany({
        where: { createdAt: { lt: sevenDaysAgo } }
      });

      console.log(`[CRON] 🧹 Purged ${purgeResult.count} activity log entries older than 7 days.`);
    } catch (error) {
      console.error('[CRON Error] Activity log purge failed:', error);
    }

  }, {
    timezone: "Asia/Kolkata"
  });

  console.log('⏰ Midnight Cron scheduler active (sessions + 7-day activity log purge).');
};

module.exports = { startCronJobs };
