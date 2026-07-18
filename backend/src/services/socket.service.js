const socketio = require('socket.io');
const prisma = require('../config/prisma');

let io = null;

function init(server) {
  io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    }
  });

  console.log('🔌 Socket.io Service Initialized.');

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join room hook
    socket.on('join-room', (roomName) => {
      socket.join(roomName);
      console.log(`🔌 Socket ${socket.id} joined room: ${roomName}`);
    });

    // Driver location update stream
    socket.on('driver:location-update', async (payload) => {
      const { driverId, tourId, tourCode, lat, lng, etaMinutes } = payload;
      if (!driverId || !lat || !lng) return;

      console.log(`🔌 Location stream from driver ${driverId}: lat=${lat}, lng=${lng}`);

      try {
        // Broadcast location to the guest tracking room
        if (tourCode) {
          io.to(`tour:${tourCode}`).emit('driver:location-receive', {
            driverId,
            tourId,
            lat,
            lng,
            etaMinutes,
            timestamp: new Date()
          });
        }

        // Proactively update database in backend background so DB is in sync
        const tourDriver = await prisma.tourDriver.findFirst({
          where: { driverId: driverId, rideStatus: { in: ['STARTED', 'EN_ROUTE', 'IN_TRANSIT'] } }
        });

        if (tourDriver) {
          await prisma.tourDriver.update({
            where: { id: tourDriver.id },
            data: {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              etaMinutes: etaMinutes ? parseInt(etaMinutes, 10) : undefined,
              lastLocUpdate: new Date()
            }
          });
        }
      } catch (err) {
        console.error('🔌 Database coordinate update via socket failed:', err.message);
      }
    });

    // Real-time Chat
    socket.on('chat:message-send', async (payload) => {
      const { tourCode, sender, message } = payload;
      if (!tourCode || !sender || !message) return;

      console.log(`💬 Chat message from ${sender} in tour ${tourCode}: ${message}`);

      // Broadcast to room
      io.to(`tour:${tourCode}`).emit('chat:message-receive', {
        sender,
        message,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call init(server) first.');
  }
  return io;
}

module.exports = {
  init,
  getIO
};
