// ============================================================
// TravelCRM — BullMQ Worker
// ============================================================
// This worker process handles async background jobs such as:
// - PDF Generation for Proposals
// - Email/WhatsApp Notifications via SendGrid/Interakt
// 
// Full integration logic will be built during Sprint 2.
// ============================================================

require('dotenv').config();
const config = require('./config');

console.log('👷 BullMQ Worker service initialized.');
console.log(`📡 Connecting to Redis at ${config.redisUrl.replace(/:[^:]*@/, ':***@')}`);

// Keep process alive
setInterval(() => {}, 1000 * 60 * 60);
