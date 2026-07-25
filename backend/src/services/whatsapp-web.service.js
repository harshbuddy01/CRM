// ============================================================
// TravelCRM — WhatsApp Web.js Service
// ============================================================
// Uses whatsapp-web.js to connect via QR scan (like WhatsApp Web).
// No Meta Business API needed. No GST. No extra SIM.
// Owner scans QR code once → CRM sends WhatsApp messages.
// ============================================================

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const logger = require('../utils/logger');
const path = require('path');

let client = null;
let currentQR = null;
let connectionStatus = 'disconnected'; // disconnected | qr_ready | connecting | connected
let lastError = null;

// Owner's WhatsApp number (messages will be sent TO this number for alerts)
const OWNER_PHONE = '917004283531';

/**
 * Initialize WhatsApp Web client
 */
const initialize = () => {
  if (client) {
    console.log('[WhatsApp] Client already initialized. Status:', connectionStatus);
    return;
  }

  console.log('[WhatsApp] Initializing WhatsApp Web.js client...');
  connectionStatus = 'connecting';

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, '../../.wwebjs_auth'),
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    },
  });

  client.on('qr', async (qr) => {
    console.log('[WhatsApp] QR Code received. Scan it from your phone.');
    connectionStatus = 'qr_ready';
    try {
      currentQR = await qrcode.toDataURL(qr);
    } catch (err) {
      console.error('[WhatsApp] QR generation error:', err);
      currentQR = null;
    }
  });

  client.on('ready', () => {
    console.log('[WhatsApp] ✅ Client is connected and ready!');
    connectionStatus = 'connected';
    currentQR = null;
    lastError = null;
  });

  client.on('authenticated', () => {
    console.log('[WhatsApp] ✅ Authenticated successfully (session restored).');
    connectionStatus = 'connecting';
    currentQR = null;
  });

  client.on('auth_failure', (msg) => {
    console.error('[WhatsApp] ❌ Authentication failure:', msg);
    connectionStatus = 'disconnected';
    lastError = 'Authentication failed: ' + msg;
    currentQR = null;
  });

  client.on('disconnected', (reason) => {
    console.log('[WhatsApp] Disconnected:', reason);
    connectionStatus = 'disconnected';
    currentQR = null;
    client = null;
  });

  client.initialize().catch((err) => {
    console.error('[WhatsApp] Initialization error:', err);
    connectionStatus = 'disconnected';
    lastError = err.message;
    client = null;
  });
};

/**
 * Get current status and QR code
 */
const getStatus = () => {
  return {
    status: connectionStatus,
    qrCode: currentQR,
    error: lastError,
  };
};

/**
 * Send a WhatsApp message
 * @param {string} phone - Phone number with country code, no + sign (e.g. '917004283531')
 * @param {string} message - Message text
 */
const sendMessage = async (phone, message) => {
  if (!client || connectionStatus !== 'connected') {
    console.log(`[WhatsApp] Not connected. Message to ${phone} queued as log only.`);
    console.log(`[WhatsApp] MSG: ${message}`);
    return { success: false, reason: 'WhatsApp not connected. Scan QR code first.' };
  }

  try {
    // whatsapp-web.js expects chatId in format: countrycode+number@c.us
    const chatId = phone.replace(/[^0-9]/g, '') + '@c.us';
    await client.sendMessage(chatId, message);
    console.log(`[WhatsApp] ✅ Message sent to ${phone}`);
    return { success: true };
  } catch (err) {
    console.error(`[WhatsApp] ❌ Failed to send to ${phone}:`, err.message);
    return { success: false, reason: err.message };
  }
};

/**
 * Send owner notification (convenience method)
 */
const notifyOwner = async (message) => {
  return sendMessage(OWNER_PHONE, message);
};

/**
 * Disconnect and destroy session
 */
const disconnect = async () => {
  if (client) {
    try {
      await client.destroy();
    } catch (err) {
      console.error('[WhatsApp] Destroy error:', err);
    }
    client = null;
    connectionStatus = 'disconnected';
    currentQR = null;
  }
};

module.exports = {
  initialize,
  getStatus,
  sendMessage,
  notifyOwner,
  disconnect,
};
