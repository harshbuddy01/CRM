// ============================================================
// TravelCRM — WhatsApp Web Routes
// ============================================================
// Endpoints for WhatsApp Web.js QR scanning and management
// ============================================================

const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsapp-web.service');

// GET /whatsapp/status — Get current connection status and QR code
router.get('/status', (req, res) => {
  const status = whatsappService.getStatus();
  res.json({ success: true, ...status });
});

// POST /whatsapp/connect — Initialize WhatsApp client and start QR generation
router.post('/connect', (req, res) => {
  try {
    const result = whatsappService.initialize();
    res.json({ 
      success: true, 
      message: 'WhatsApp client initializing. Check /status for QR code.',
      ...result
    });
  } catch (err) {
    console.error('[WhatsApp Route Error]', err);
    res.json({ success: false, error: err.message });
  }
});

// POST /whatsapp/disconnect — Disconnect WhatsApp session
router.post('/disconnect', async (req, res) => {
  await whatsappService.disconnect();
  res.json({ success: true, message: 'WhatsApp disconnected.' });
});

// POST /whatsapp/send — Send a test message
router.post('/send', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ success: false, message: 'phone and message are required' });
  }
  const result = await whatsappService.sendMessage(phone, message);
  res.json({ success: result.success, ...result });
});

// GET /whatsapp/qr-page — Serve a simple HTML page to scan QR code
router.get('/qr-page', (req, res) => {
  res.removeHeader('Content-Security-Policy');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:;");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhatsApp QR — StreamKart CRM</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        body { background: #f0f2f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .card { background: #fff; border-radius: 16px; border: 1px solid #e2e5eb; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 420px; width: 100%; padding: 40px; text-align: center; }
        .logo { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
        .logo span { color: #1d4ed8; }
        .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 28px; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
        .status-disconnected { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .status-qr_ready { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
        .status-connecting { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .status-connected { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot-disconnected { background: #dc2626; }
        .dot-qr_ready { background: #d97706; animation: pulse 1.5s infinite; }
        .dot-connecting { background: #2563eb; animation: pulse 1s infinite; }
        .dot-connected { background: #16a34a; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        #qr-img { max-width: 260px; margin: 0 auto 20px; border-radius: 12px; border: 2px solid #e5e7eb; display: block; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: background 0.15s; }
        .btn-blue { background: #1d4ed8; color: #fff; }
        .btn-blue:hover { background: #1e40af; }
        .btn-red { background: #fff; color: #dc2626; border: 1px solid #fecaca; }
        .btn-red:hover { background: #fef2f2; }
        .btn-group { display: flex; gap: 10px; justify-content: center; margin-top: 16px; }
        .info { font-size: 12px; color: #9ca3af; margin-top: 20px; line-height: 1.6; }
        .msg-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-top: 16px; font-size: 13px; color: #15803d; font-weight: 500; }
        .error-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-top: 16px; font-size: 13px; color: #dc2626; }
        .steps { text-align: left; margin: 16px 0; }
        .steps li { font-size: 13px; color: #374151; margin-bottom: 8px; line-height: 1.5; }
        .steps li strong { color: #0f172a; }
      </style>
    </head>
    <body>
      <div class="card">
        <p class="logo">StreamKart <span>CRM</span></p>
        <p class="subtitle">WhatsApp Business Connection</p>

        <div id="status-area">
          <span id="status-badge" class="status-badge status-disconnected">
            <span id="status-dot" class="dot dot-disconnected"></span>
            <span id="status-text">Disconnected</span>
          </span>
        </div>

        <div id="qr-area" style="display:none;">
          <img id="qr-img" src="" alt="QR Code" />
          <ol class="steps">
            <li>Open <strong>WhatsApp</strong> on your phone</li>
            <li>Tap <strong>⋮ Menu → Linked Devices → Link a Device</strong></li>
            <li>Point your phone camera at the QR code above</li>
          </ol>
        </div>

        <div id="connected-area" style="display:none;">
          <div class="msg-box">✅ WhatsApp is connected! Your CRM will now send messages through your WhatsApp number.</div>
        </div>

        <div id="error-area" style="display:none;">
          <div class="error-box" id="error-text"></div>
        </div>

        <div class="btn-group">
          <button id="connect-btn" class="btn btn-blue">Connect WhatsApp</button>
          <button id="disconnect-btn" class="btn btn-red" style="display:none;">Disconnect</button>
        </div>

        <p class="info">
          This connects your personal WhatsApp to the CRM server (like WhatsApp Web).<br/>
          Your clients receive normal WhatsApp messages. They don't need to scan anything.
        </p>
      </div>

      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const API_BASE = window.location.origin;
          const connectBtn = document.getElementById('connect-btn');
          const disconnectBtn = document.getElementById('disconnect-btn');

          connectBtn.addEventListener('click', async function() {
            connectBtn.disabled = true;
            connectBtn.textContent = 'Initializing...';
            try {
              await fetch(API_BASE + '/v1/whatsapp/connect', { method: 'POST' });
            } catch (err) {
              console.error('Connect fetch error:', err);
            }
            setTimeout(pollStatus, 2000);
          });

          disconnectBtn.addEventListener('click', async function() {
            try {
              await fetch(API_BASE + '/v1/whatsapp/disconnect', { method: 'POST' });
            } catch (err) {
              console.error('Disconnect fetch error:', err);
            }
            location.reload();
          });

          async function pollStatus() {
            try {
              const res = await fetch(API_BASE + '/v1/whatsapp/status');
              const data = await res.json();
              updateUI(data);

              if (data.status !== 'connected') {
                setTimeout(pollStatus, 3000);
              }
            } catch (err) {
              console.error('Poll error:', err);
              setTimeout(pollStatus, 5000);
            }
          }

          function updateUI(data) {
            const badge = document.getElementById('status-badge');
            const dot = document.getElementById('status-dot');
            const text = document.getElementById('status-text');
            const qrArea = document.getElementById('qr-area');
            const connArea = document.getElementById('connected-area');
            const errArea = document.getElementById('error-area');

            const labels = {
              disconnected: 'Disconnected',
              qr_ready: 'Scan QR Code Now',
              connecting: 'Connecting...',
              connected: 'Connected',
            };

            badge.className = 'status-badge status-' + data.status;
            dot.className = 'dot dot-' + data.status;
            text.textContent = labels[data.status] || data.status;

            qrArea.style.display = 'none';
            connArea.style.display = 'none';
            errArea.style.display = 'none';

            if (data.status === 'qr_ready' && data.qrCode) {
              qrArea.style.display = 'block';
              document.getElementById('qr-img').src = data.qrCode;
              connectBtn.style.display = 'none';
              disconnectBtn.style.display = 'inline-flex';
            } else if (data.status === 'connected') {
              connArea.style.display = 'block';
              connectBtn.style.display = 'none';
              disconnectBtn.style.display = 'inline-flex';
            } else if (data.status === 'connecting') {
              connectBtn.disabled = true;
              connectBtn.textContent = 'Connecting...';
            } else {
              connectBtn.disabled = false;
              connectBtn.textContent = 'Connect WhatsApp';
              connectBtn.style.display = 'inline-flex';
              disconnectBtn.style.display = 'none';
            }

            if (data.error) {
              errArea.style.display = 'block';
              document.getElementById('error-text').textContent = data.error;
            }
          }

          // Initial poll on page load
          pollStatus();
        });
      </script>
    </body>
    </html>
  `);
});

module.exports = router;
