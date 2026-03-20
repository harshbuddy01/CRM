// ============================================================
// TravelCRM — PDF Generation Service
// ============================================================

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const config = require('../config');

/**
 * Generates a PDF buffer from HTML content.
 * Uses lightweight Chromium binary suitable for serverless/Railway to avoid memory crashes.
 */
const generatePdfFromHtml = async (htmlContent) => {
  let browser = null;
  try {
    // Determine path based on environment
    const isLocal = config.nodeEnv === 'development' || !process.env.RAILWAY_ENVIRONMENT;
    
    // For local dev on Mac/Windows, you need to point puppeteer-core to a local Chrome installation.
    // Railway/Production uses the @sparticuz/chromium binary.
    let executablePath = await chromium.executablePath();
    
    if (isLocal) {
      // Fallback local paths for Mac and Linux. Adjust as needed for Windows.
      executablePath =
        process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome';
    }

    browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    // Set HTML content and wait for network/fonts to finish loading
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

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

    return pdfBuffer;

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF. Memory or Launch error.');
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
};

module.exports = {
  generatePdfFromHtml,
};
