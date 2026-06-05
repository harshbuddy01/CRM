// ============================================================
// TravelCRM — Meta Conversions API (CAPI) Service
// ============================================================
// Interfaces with the Meta Graph API (Events Edge)
// to send server-side events (Lead, Schedule, Purchase)
// with hashed user identifiers and cookies (_fbp, _fbc).
// ============================================================

const crypto = require('crypto');
const axios = require('axios');
const config = require('../config');
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// ========================
// NORMALIZATION UTILITIES
// ========================

/**
 * Normalize phone to strict E.164 format.
 * Strips spaces, dashes, dots, parentheses, leading +91/91/0.
 * If result is 10 digits, prepends +91 (India).
 * Returns E.164 string (e.g. "+919876543210") or null.
 */
const normalizePhoneE164 = (phone) => {
  if (!phone) return null;
  let cleaned = String(phone).trim().replace(/[\s\-\.\(\)]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith('0') && cleaned.length > 10) {
    cleaned = cleaned.substring(1);
  }
  cleaned = cleaned.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (cleaned.length > 10 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }
  return null;
};

/**
 * Normalize email for Meta CAPI.
 * Trim whitespace, lowercase.
 * For Gmail/Googlemail: remove dots and +suffix from username.
 */
const normalizeEmail = (email) => {
  if (!email) return null;
  let normalized = String(email).trim().toLowerCase();
  const atIndex = normalized.indexOf('@');
  if (atIndex === -1) return null;

  let username = normalized.substring(0, atIndex);
  const domain = normalized.substring(atIndex + 1);

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    username = username.replace(/\./g, '');
    const plusIndex = username.indexOf('+');
    if (plusIndex !== -1) {
      username = username.substring(0, plusIndex);
    }
  }
  return `${username}@${domain}`;
};

/**
 * SHA-256 hash a string. Returns lowercase hex digest.
 */
const sha256Hash = (value) => {
  if (!value) return null;
  return crypto
    .createHash('sha256')
    .update(String(value).trim().toLowerCase())
    .digest('hex');
};

// ========================
// DEDUPLICATION
// ========================

/**
 * Generate a deterministic event_id for deduplication.
 * Format: {EVENT}_IMAGICA_{QUERY_CODE}
 * e.g. LEAD_IMAGICA_QRY-2026-001
 */
const generateEventId = (eventName, queryCode) => {
  return `${eventName.toUpperCase()}_IMAGICA_${queryCode}`;
};

// ========================
// CONVERSION VALUE MAP
// ========================

const CONVERSION_VALUES = {
  Lead: 500,              // ₹500 — new lead captured
  Schedule: 2500,         // ₹2,500 — moved to negotiation/quoted (Qualified Lead)
  Purchase: 15000,        // ₹15,000 — booking confirmed (Converted Lead)
};

// ========================
// RETRY LOGIC
// ========================

const withRetry = async (fn, maxRetries = 3, baseDelayMs = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRetryable =
        error.response?.status >= 500 ||
        error.response?.status === 429 ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT';

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logger.warn(`[MetaCAPI] Retry ${attempt}/${maxRetries} after ${delay}ms — ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// ========================
// CORE API METHODS
// ========================

/**
 * Upload an event to Meta Conversions API (CAPI).
 *
 * @param {string} eventName - One of: 'Lead', 'Schedule', 'Purchase'
 * @param {Object} query - The Query (lead) record from Prisma
 * @param {Object} clientInfo - Optional browser/session info
 * @param {string} clientInfo.fbc - Facebook Click Identifier (fbclid)
 * @param {string} clientInfo.fbp - Facebook Browser Pixel cookie
 * @param {string} clientInfo.clientIp - Client IP address
 * @param {string} clientInfo.userAgent - Client User-Agent string
 */
const sendEvent = async (eventName, query, clientInfo = {}) => {
  const metaConfig = config.meta || {};
  const pixelId = metaConfig.pixelId;
  const accessToken = metaConfig.accessToken;
  const apiVersion = metaConfig.apiVersion || 'v24.0';

  // Guard: Skip if Meta CAPI is not configured
  if (!pixelId || !accessToken) {
    logger.warn('[MetaCAPI] Skipping event send — META_PIXEL_ID or META_ACCESS_TOKEN not configured');
    return null;
  }

  try {
    // --- Normalize User Data ---
    const normalizedPhone = normalizePhoneE164(query.phone);
    const normalizedEmail = normalizeEmail(query.email);

    const userData = {};

    // Standard hash formats for Meta (must be arrays of strings)
    if (normalizedEmail) {
      userData.em = [sha256Hash(normalizedEmail)];
    }
    if (normalizedPhone) {
      userData.ph = [sha256Hash(normalizedPhone)];
    }

    // Add first name / last name hashes if name is split or structured
    if (query.name) {
      const parts = query.name.trim().split(/\s+/);
      if (parts.length > 0) {
        userData.fn = [sha256Hash(parts[0])];
        if (parts.length > 1) {
          userData.ln = [sha256Hash(parts[parts.length - 1])];
        }
      }
    }

    // Capture standard browser headers if available
    if (clientInfo.clientIp || clientInfo.ipAddress) {
      userData.client_ip_address = clientInfo.clientIp || clientInfo.ipAddress;
    }
    if (clientInfo.userAgent) {
      userData.client_user_agent = clientInfo.userAgent;
    }

    // Capture FB tracking cookies/params
    if (clientInfo.fbp) {
      userData.fbp = clientInfo.fbp;
    }
    if (clientInfo.fbc) {
      userData.fbc = clientInfo.fbc;
    }

    // Meta recommends mapping internal CRM database ID as external_id for high match quality
    userData.external_id = [sha256Hash(query.id)];

    const eventId = generateEventId(eventName, query.queryCode);
    const eventValue = CONVERSION_VALUES[eventName] || 0;

    const event = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
      event_id: eventId,
      event_source: 'web',
      action_source: 'website',
      user_data: userData,
      custom_data: {
        currency: 'INR',
        value: eventValue,
      },
      opt_out: false,
    };

    // --- Prepare Request ---
    const apiUrl = `https://graph.facebook.com/${apiVersion}/${pixelId}/events`;

    const payload = {
      data: [event],
    };

    if (metaConfig.testEventCode) {
      payload.test_event_code = metaConfig.testEventCode;
    }

    // --- Send with Retry ---
    const response = await withRetry(async () => {
      return axios.post(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });
    });

    // --- Log Success ---
    await prisma.integrationLog.create({
      data: {
        type: 'meta-capi',
        direction: 'outbound',
        status: 'success',
        payload: {
          eventName,
          eventId,
          queryCode: query.queryCode,
          eventValue,
          hasIdentifiers: Object.keys(userData).length,
          hasFbp: !!clientInfo.fbp,
          hasFbc: !!clientInfo.fbc,
          responseData: response.data,
        },
        relatedId: query.id,
      },
    });

    logger.info(`[MetaCAPI] ✅ ${eventName} event sent for ${query.queryCode} (id: ${eventId})`);
    return response.data;

  } catch (error) {
    // --- Log Failure ---
    const errorPayload = {
      eventName,
      queryCode: query.queryCode,
      statusCode: error.response?.status,
      errorType: error.response?.data?.error?.type || 'UNKNOWN',
      errorMessage: error.response?.data?.error?.message || error.message,
      errorDetails: error.response?.data?.error || null,
      stack: error.stack,
    };

    await prisma.integrationLog.create({
      data: {
        type: 'meta-capi',
        direction: 'outbound',
        status: 'failed',
        payload: errorPayload,
        errorMessage: `[${errorPayload.errorType}] ${errorPayload.errorMessage}`.substring(0, 500),
        relatedId: query.id,
      },
    }).catch((logErr) => {
      logger.error('[MetaCAPI] Failed to write IntegrationLog:', logErr.message);
    });

    logger.error(`[MetaCAPI] ❌ Failed to send ${eventName} event for ${query.queryCode}: ${error.message}`);
    return null;
  }
};

// ========================
// PUBLIC API
// ========================

module.exports = {
  sendEvent,
  normalizePhoneE164,
  normalizeEmail,
  sha256Hash,
  generateEventId,
  CONVERSION_VALUES,
};
