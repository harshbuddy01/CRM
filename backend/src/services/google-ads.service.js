// ============================================================
// TravelCRM — Google Ads Enhanced Conversions Service
// ============================================================
// Interfaces with the Google Ads API ConversionUploadService
// to send offline conversion events (Lead, Qualified Lead,
// Converted Lead) with hashed user identifiers and gclid.
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

  // Strip all non-digit characters except leading +
  let cleaned = String(phone).trim();

  // Remove all formatting characters
  cleaned = cleaned.replace(/[\s\-\.\(\)]/g, '');

  // Remove leading + for processing
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Remove leading 91 (India country code) if present
  if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }

  // Remove leading 0 (trunk prefix)
  if (cleaned.startsWith('0') && cleaned.length > 10) {
    cleaned = cleaned.substring(1);
  }

  // Strip any remaining non-digit characters
  cleaned = cleaned.replace(/\D/g, '');

  // Validate: must be 10 digits for Indian mobile
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // If already has country code (11+ digits), prepend +
  if (cleaned.length > 10 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  return null;
};

/**
 * Normalize email for Google Ads Enhanced Conversions.
 * - Trim whitespace, lowercase
 * - For Gmail/Googlemail: remove dots and +suffix from username
 * - Returns normalized string or null.
 */
const normalizeEmail = (email) => {
  if (!email) return null;

  let normalized = String(email).trim().toLowerCase();

  // Validate basic email format
  const atIndex = normalized.indexOf('@');
  if (atIndex === -1) return null;

  let username = normalized.substring(0, atIndex);
  const domain = normalized.substring(atIndex + 1);

  // Gmail-specific normalization
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Remove all dots from username
    username = username.replace(/\./g, '');

    // Remove +suffix (e.g. user+tag@gmail.com → user@gmail.com)
    const plusIndex = username.indexOf('+');
    if (plusIndex !== -1) {
      username = username.substring(0, plusIndex);
    }
  }

  return `${username}@${domain}`;
};

/**
 * SHA-256 hash a string value.
 * Returns lowercase hex digest.
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
 * Generate a deterministic order_id for deduplication.
 * Format: GADS_{EVENT}_{QUERY_CODE}
 * e.g. GADS_LEAD_QRY-2026-001
 */
const generateOrderId = (eventName, queryCode) => {
  return `GADS_${eventName.toUpperCase()}_${queryCode}`;
};

// ========================
// CONVERSION VALUE MAP
// ========================

const CONVERSION_VALUES = {
  Lead: 500,              // ₹500 — new lead captured
  QualifiedLead: 2500,    // ₹2,500 — moved to negotiation/quoted
  ConvertedLead: 15000,   // ₹15,000 — booking confirmed
};

const CONVERSION_ACTION_MAP = {
  Lead: 'Lead',
  QualifiedLead: 'Qualified Lead',
  ConvertedLead: 'Converted Lead',
};

// ========================
// RETRY LOGIC
// ========================

/**
 * Execute an async function with exponential backoff.
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelayMs - Base delay in ms
 */
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
      logger.warn(`[GoogleAds] Retry ${attempt}/${maxRetries} after ${delay}ms — ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// ========================
// CORE API METHODS
// ========================

/**
 * Upload an offline conversion event to Google Ads.
 *
 * @param {string} eventName - One of: 'Lead', 'QualifiedLead', 'ConvertedLead'
 * @param {Object} query - The Query (lead) record from Prisma
 * @param {Object} clientInfo - Optional browser/session info
 * @param {string} clientInfo.gclid - Google Click ID from the ad click
 * @param {string} clientInfo.gbraid - Google Broad match ID (for app campaigns)
 * @param {string} clientInfo.wbraid - Google Web-to-app ID
 * @param {string} clientInfo.clientIp - Client IP address
 * @param {string} clientInfo.userAgent - Client User-Agent string
 */
const uploadConversion = async (eventName, query, clientInfo = {}) => {
  const { pixelId, accessToken, apiVersion, customerId } = config.googleAds || {};

  // Guard: Skip if Google Ads is not configured
  if (!customerId || !accessToken) {
    logger.warn('[GoogleAds] Skipping conversion upload — GOOGLE_ADS_CUSTOMER_ID or GOOGLE_ADS_ACCESS_TOKEN not configured');
    return null;
  }

  const conversionActionName = CONVERSION_ACTION_MAP[eventName];
  if (!conversionActionName) {
    logger.warn(`[GoogleAds] Unknown event name: ${eventName}`);
    return null;
  }

  try {
    // --- Normalize User Data ---
    const normalizedPhone = normalizePhoneE164(query.phone);
    const normalizedEmail = normalizeEmail(query.email);

    const userIdentifiers = [];

    if (normalizedPhone) {
      userIdentifiers.push({
        hashedPhoneNumber: sha256Hash(normalizedPhone),
      });
    }

    if (normalizedEmail) {
      userIdentifiers.push({
        hashedEmail: sha256Hash(normalizedEmail),
      });
    }

    // --- Build Conversion Payload ---
    const orderId = generateOrderId(eventName, query.queryCode);
    const conversionValue = CONVERSION_VALUES[eventName] || 0;

    const conversion = {
      conversionAction: `customers/${customerId}/conversionActions/${config.googleAds.conversionActionIds?.[eventName] || ''}`,
      conversionDateTime: new Date().toISOString().replace('T', ' ').replace('Z', '+00:00'),
      conversionValue: conversionValue,
      currencyCode: 'INR',
      orderId: orderId,
      userIdentifiers: userIdentifiers,
    };

    // Add gclid if available (highest priority click identifier)
    if (clientInfo.gclid) {
      conversion.gclid = clientInfo.gclid;
    } else if (clientInfo.gbraid) {
      conversion.gbraid = clientInfo.gbraid;
    } else if (clientInfo.wbraid) {
      conversion.wbraid = clientInfo.wbraid;
    }

    // --- Prepare API Request ---
    const apiUrl = `https://googleads.googleapis.com/${apiVersion}/customers/${customerId}:uploadClickConversions`;

    const payload = {
      conversions: [conversion],
      partialFailure: true,
    };

    // --- Send with Retry ---
    const response = await withRetry(async () => {
      return axios.post(apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': config.googleAds.developerToken || '',
          'Content-Type': 'application/json',
          ...(config.googleAds.loginCustomerId ? { 'login-customer-id': config.googleAds.loginCustomerId } : {}),
        },
        timeout: 15000,
      });
    });

    // --- Log Success ---
    await prisma.integrationLog.create({
      data: {
        type: 'google-ads',
        direction: 'outbound',
        status: 'success',
        payload: {
          eventName: conversionActionName,
          orderId,
          queryCode: query.queryCode,
          conversionValue,
          hasIdentifiers: userIdentifiers.length,
          hasGclid: !!clientInfo.gclid,
          responseData: response.data,
        },
        relatedId: query.id,
      },
    });

    logger.info(`[GoogleAds] ✅ ${conversionActionName} uploaded for ${query.queryCode} (order: ${orderId})`);
    return response.data;

  } catch (error) {
    // --- Log Failure with Full Stack Trace ---
    const errorPayload = {
      eventName,
      queryCode: query.queryCode,
      statusCode: error.response?.status,
      errorType: error.response?.data?.error?.status || 'UNKNOWN',
      errorMessage: error.response?.data?.error?.message || error.message,
      errorDetails: error.response?.data?.error?.details || [],
      stack: error.stack,
    };

    await prisma.integrationLog.create({
      data: {
        type: 'google-ads',
        direction: 'outbound',
        status: 'failed',
        payload: errorPayload,
        errorMessage: `[${errorPayload.errorType}] ${errorPayload.errorMessage}`.substring(0, 500),
        relatedId: query.id,
      },
    }).catch((logErr) => {
      logger.error('[GoogleAds] Failed to write IntegrationLog:', logErr.message);
    });

    logger.error(`[GoogleAds] ❌ Failed to upload ${conversionActionName} for ${query.queryCode}: ${error.message}`);
    // Non-blocking: Don't throw, let CRM operations continue
    return null;
  }
};

// ========================
// PUBLIC API
// ========================

module.exports = {
  uploadConversion,
  normalizePhoneE164,
  normalizeEmail,
  sha256Hash,
  generateOrderId,
  CONVERSION_VALUES,
  CONVERSION_ACTION_MAP,
};
