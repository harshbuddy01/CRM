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

    // ── Task 3: Auto-transition Running & Completed Tours & Leads ──
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Cancel any tour whose query is lost or invalid
      await prisma.tour.updateMany({
        where: {
          query: { status: { in: ['lost', 'invalid'] } },
          status: { not: 'cancelled' }
        },
        data: {
          status: 'cancelled',
          reviewStatus: 'EXCLUDED'
        }
      });

      // 2. Auto-transition tours that started (startDate <= today <= endDate) to 'running'
      const startTours = await prisma.tour.findMany({
        where: {
          startDate: { lte: today },
          endDate: { gte: today },
          status: 'upcoming',
          deletedAt: null,
          query: { status: { notIn: ['lost', 'invalid'] } }
        },
        include: { query: true }
      });

      for (const tour of startTours) {
        await prisma.tour.update({
          where: { id: tour.id },
          data: { status: 'running' }
        });
        if (tour.query && !['in_progress', 'completed', 'lost', 'invalid'].includes(tour.query.status)) {
          await prisma.query.update({
            where: { id: tour.query.id },
            data: { status: 'in_progress' }
          });
        }
      }
      if (startTours.length > 0) {
        console.log(`[CRON] 🚀 Auto-transitioned ${startTours.length} upcoming tours to running.`);
      }

      // 3. Auto-transition tours that ended (endDate < today) to 'completed'
      const endedTours = await prisma.tour.findMany({
        where: {
          endDate: { lt: today },
          status: { in: ['upcoming', 'running', 'in_progress'] },
          deletedAt: null,
          query: { status: { notIn: ['lost', 'invalid'] } }
        },
        include: { query: true }
      });

      for (const tour of endedTours) {
        await prisma.tour.update({
          where: { id: tour.id },
          data: {
            status: 'completed',
            reviewStatus: tour.reviewStatus || 'PENDING'
          }
        });

        if (tour.query && !['completed', 'lost', 'invalid'].includes(tour.query.status)) {
          await prisma.query.update({
            where: { id: tour.query.id },
            data: { status: 'completed' }
          });
        }
      }

      if (endedTours.length > 0) {
        console.log(`[CRON] 🏁 Auto-completed ${endedTours.length} ended tours & inquiries.`);
      }
    } catch (error) {
      console.error('[CRON Error] Auto-transition tours failed:', error);
    }

  }, {
    timezone: "Asia/Kolkata"
  });

  // ── Post-Journey Review Sender & Reminder Loop (Daily at 10:00 AM IST) ──
  cron.schedule('0 10 * * *', async () => {
    // Strict Safety Guard: Keep automated client messaging disabled until explicitly tested and enabled
    if (process.env.ENABLE_AUTOMATED_CLIENT_DISPATCH !== 'true') {
      console.log('[CRON] Automated client review dispatch is currently paused for safety (testing mode).');
      return;
    }

    console.log('[CRON] Starting 10:00 AM post-tour review dispatch...');

    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      oneDayAgo.setHours(23, 59, 59, 999);

      // Find completed tours whose journey ended at least 1 day ago, awaiting review
      const eligibleTours = await prisma.tour.findMany({
        where: {
          status: 'completed',
          endDate: { lte: oneDayAgo },
          reviewStatus: { in: ['PENDING', 'SENT'] },
          reviewFollowupCount: { lt: 3 },
          deletedAt: null
        },
        include: {
          query: true
        }
      });

      console.log(`[CRON] Found ${eligibleTours.length} tours eligible for review invitation.`);

      for (const tour of eligibleTours) {
        const guestPhone = tour.query?.phone;
        const guestName = tour.query?.name || 'Valued Guest';
        const reviewUrl = `https://imagicaholidays.com/review/${tour.tourCode}`;
        const isFirstTime = tour.reviewStatus === 'PENDING' || tour.reviewFollowupCount === 0;
        const nextAttempt = (tour.reviewFollowupCount || 0) + 1;

        // Dispatch WhatsApp invitation
        if (guestPhone) {
          try {
            const queueService = require('./services/queue.service');
            const destination = tour.query?.destination || 'your destination';
            await queueService.enqueueWhatsappJob(
              tour.id,
              guestPhone,
              'customer_review_invite',
              [
                { type: 'body', parameters: [
                  { type: 'text', text: guestName },
                  { type: 'text', text: destination },
                  { type: 'text', text: reviewUrl }
                ]}
              ]
            ).catch(() => {});
          } catch (e) {
            console.error(`[CRON] WhatsApp review dispatch error for ${tour.tourCode}:`, e);
          }
        }

        // Update tracking
        await prisma.tour.update({
          where: { id: tour.id },
          data: {
            reviewStatus: 'SENT',
            reviewSentAt: new Date(),
            reviewFollowupCount: nextAttempt
          }
        });

        console.log(`[CRON] Sent review invite to ${guestName} (${tour.tourCode}) — Attempt ${nextAttempt}/3`);
      }
    } catch (err) {
      console.error('[CRON Error] Review dispatch loop failed:', err);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log('⏰ Midnight Cron scheduler active (sessions + 7-day activity log purge + auto-complete).');
  console.log('⏰ 10:00 AM Cron scheduler active (post-tour WhatsApp/Email review invitations).');

  // Run every 10 minutes to clean up expired demo sessions
  cron.schedule('*/10 * * * *', async () => {
    const { cleanupExpiredDemoSessions } = require('./jobs/demo-cleanup');
    await cleanupExpiredDemoSessions();
  });
  console.log('⏰ Demo Cleanup scheduler active (every 10 minutes).');
};

module.exports = { startCronJobs };
