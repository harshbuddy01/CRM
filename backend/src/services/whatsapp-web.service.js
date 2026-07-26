// ============================================================
// TravelCRM — WhatsApp Web.js Service
// ============================================================
// Uses whatsapp-web.js to connect via QR scan (like WhatsApp Web).
// No Meta Business API needed. No GST. No extra SIM.
// Owner scans QR code once → CRM sends WhatsApp messages.
// ============================================================

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

let client = null;
let currentQR = null;
let connectionStatus = 'disconnected'; // disconnected | qr_ready | connecting | connected
let lastError = null;

// Owner's WhatsApp number (messages will be sent TO this number for alerts)
const OWNER_PHONE = process.env.OWNER_PHONE || '918235337180';

/**
 * Helper to find available Chromium binary path
 */
const getChromiumPath = () => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const possiblePaths = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
};

/**
 * Initialize WhatsApp Web client
 */
const initialize = () => {
  if (client) {
    console.log('[WhatsApp] Client already initialized. Status:', connectionStatus);
    return { success: true, status: connectionStatus };
  }

  console.log('[WhatsApp] Initializing WhatsApp Web.js client...');
  connectionStatus = 'connecting';
  lastError = null;

  try {
    const authDir = path.join(__dirname, '../../.wwebjs_auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Clean up Chromium singleton locks to prevent "Profile in use" launch failures
    const cleanLocks = (dir) => {
      if (!fs.existsSync(dir)) return;
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          let isDirectory = false;
          try {
            const stat = fs.lstatSync(fullPath);
            isDirectory = stat.isDirectory();
          } catch (e) {
            continue;
          }

          if (isDirectory) {
            cleanLocks(fullPath);
          } else if (file.includes('Singleton')) {
            try {
              fs.unlinkSync(fullPath);
              console.log('[WhatsApp] Cleaned stale Chromium lock:', fullPath);
            } catch (err) {
              console.warn('[WhatsApp] Could not delete lock:', fullPath, err.message);
            }
          }
        }
      } catch (err) {
        console.error('[WhatsApp] Error reading dir for locks:', err.message);
      }
    };
    cleanLocks(authDir);

    const chromiumPath = getChromiumPath();
    console.log('[WhatsApp] Using Chromium path:', chromiumPath || 'default bundled puppeteer');

    let puppeteerModule;
    try {
      puppeteerModule = require('puppeteer-core');
    } catch (e1) {
      try {
        puppeteerModule = require('puppeteer');
      } catch (e2) {
        console.warn('[WhatsApp] Neither puppeteer-core nor puppeteer found in node_modules');
      }
    }

    const puppeteerOpts = {
      headless: true,
      ignoreHTTPSErrors: true,
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
    };

    if (chromiumPath) {
      puppeteerOpts.executablePath = chromiumPath;
    }

    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: authDir,
      }),
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      puppeteer: puppeteerOpts,
    });

    client.on('qr', async (qr) => {
      console.log('[WhatsApp] ✅ QR Code received successfully!');
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
      client = null;
    });

    client.on('disconnected', (reason) => {
      console.log('[WhatsApp] Disconnected:', reason);
      connectionStatus = 'disconnected';
      currentQR = null;
      client = null;
    });

    client.initialize().catch((err) => {
      console.error('[WhatsApp] Initialization promise error:', err.message);
      connectionStatus = 'disconnected';
      lastError = err.message;
      client = null;
    });

    return { success: true, status: 'connecting' };
  } catch (err) {
    console.error('[WhatsApp] Synchronous initialization error:', err);
    connectionStatus = 'disconnected';
    lastError = err.message;
    client = null;
    return { success: false, error: err.message };
  }
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
 */
const sendMessage = async (phone, message) => {
  if (!client || connectionStatus !== 'connected') {
    console.log(`[WhatsApp] Not connected. Message to ${phone} logged.`);
    return { success: false, reason: 'WhatsApp not connected. Scan QR code first.' };
  }

  try {
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
 * Send owner notification
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
