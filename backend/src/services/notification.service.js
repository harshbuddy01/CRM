// ============================================================
// TravelCRM — Notification Service
// ============================================================

const prisma = require('../config/prisma');
const { NotFoundError } = require('../utils/AppError');

const getUserNotifications = async (userId, limit = 20) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit, 10),
  });
};

const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) throw new NotFoundError('Notification');

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
