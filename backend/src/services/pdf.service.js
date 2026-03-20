// ============================================================
// TravelCRM — PDF Generation Service
// ============================================================

const puppeteer = require('puppeteer');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Generates a PDF buffer from HTML content.
 * Uses lightweight Chromium binary suitable for serverless/Railway to avoid memory crashes.
 */
const generatePdfFromHtml = async (htmlContent) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
      headless: true,
      ignoreHTTPSErrors: true,
    });

    logger.debug('[PDF] Browser launched successfully');
    const page = await browser.newPage();
    
    // Set HTML content and wait for network/fonts to finish loading
    await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });
    logger.debug('[PDF] Page content set');

    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });
    logger.debug(`[PDF] PDF Buffer generated: ${pdfBuffer.length} bytes`);

    return pdfBuffer;

  } catch (error) {
    console.error('CRITICAL: PDF Generation Failed');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Stack Trace:', error.stack);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
};

module.exports = {
  generatePdfFromHtml,
};
