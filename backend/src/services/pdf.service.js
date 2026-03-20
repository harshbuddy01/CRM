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
    const isProduction = config.nodeEnv === 'production';
    
    let executablePath;
    
    if (isProduction) {
      // Production uses the @sparticuz/chromium binary
      executablePath = await chromium.executablePath();
    } else {
      // Local development paths
      executablePath =
        process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome';
    }

    browser = await puppeteer.launch({
      args: isProduction ? chromium.args : puppeteer.defaultArgs(),
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: isProduction ? chromium.headless : true,
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
