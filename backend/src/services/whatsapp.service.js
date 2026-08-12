// ============================================================
// TravelCRM — WhatsApp Business Cloud API Service
// ============================================================

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Send a template message using the Meta WhatsApp Cloud API
 * 
 * @param {string} phone - Recipient phone number (e.g., "919876543210")
 * @param {string} templateName - Name of the template in Meta portal
 * @param {Array} components - Parameters for body, header, buttons, etc.
 * @param {string} languageCode - Language code of the template (default: 'en')
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendTemplateMessage = async (phone, templateName, components = [], languageCode = 'en_US') => {
  const { mode, accessToken, phoneNumberId, apiVersion } = config.whatsapp;

  // Clean the phone number (digits only)
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`; // Default to India country code if 10 digits
  }

  // If not in API mode, or credentials are not configured, perform mock success
  if (mode !== 'api') {
    logger.info(`[WhatsApp Service] Mode is manual or placeholder. Skipping sending to ${cleanPhone}. Template: ${templateName}`);
    return { success: true, mock: true };
  }

  if (!accessToken || !phoneNumberId) {
    logger.warn('[WhatsApp Service] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID. Logging mock success.');
    return { success: true, mock: true };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      }
    }
  };

  if (components && components.length > 0) {
    payload.template.components = components;
  }

  try {
    logger.info(`[WhatsApp Service] Direct API dispatch to ${cleanPhone} [Template: ${templateName}]`);
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const messageId = response.data?.messages?.[0]?.id;
    logger.info(`[WhatsApp Service] ✅ Message sent successfully. Meta Msg ID: ${messageId}`);

    // Auto-store in WhatsappMessage DB so it appears in Live Chat Inbox
    try {
      const prisma = require('../config/prisma');
      let bodyText = `[Template: ${templateName}]`;
      if (components && components.length > 0) {
        const bodyComp = components.find((c) => c.type === 'body');
        if (bodyComp && bodyComp.parameters && bodyComp.parameters.length > 0) {
          const params = bodyComp.parameters.map((p) => p.text || '').join(', ');
          bodyText += ` (${params})`;
        }
      }
      await prisma.whatsappMessage.create({
        data: {
          phone: cleanPhone,
          direction: 'OUTBOUND',
          message: bodyText,
          status: 'SENT'
        }
      });
    } catch (dbErr) {
      logger.error('[WhatsApp Service] Failed to store outbound template message in DB:', dbErr.message);
    }

    return { success: true, messageId };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    logger.error(`[WhatsApp Service] ❌ Failed to send WhatsApp to ${cleanPhone}: ${errorMsg}`);
    if (error.response?.data) {
      logger.error(`[WhatsApp Service] Meta API Error Details: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false, error: errorMsg };
  }
};

/**
 * Send a direct text message using the Meta WhatsApp Cloud API
 * 
 * @param {string} phone - Recipient phone number (e.g., "919876543210")
 * @param {string} textMessage - Plain text content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendTextMessage = async (phone, textMessage) => {
  const { mode, accessToken, phoneNumberId, apiVersion } = config.whatsapp;

  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  if (mode !== 'api' || !accessToken || !phoneNumberId) {
    logger.info(`[WhatsApp Service] Skipping text send to ${cleanPhone}: ${textMessage}`);
    return { success: true, mock: true };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: textMessage
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const messageId = response.data?.messages?.[0]?.id;
    return { success: true, messageId };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    logger.error(`[WhatsApp Service] Failed text message to ${cleanPhone}: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
};

module.exports = {
  sendTemplateMessage,
  sendTextMessage
};

