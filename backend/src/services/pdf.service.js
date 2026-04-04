// ============================================================
// TravelCRM — PDF Generation Service (Singleton Pattern)
// ============================================================

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

let browserInstance = null;
let browserLock = false;

/**
 * Shared browser instance provider.
 * Ensures we only launch one Chromium process and reuse it across requests.
 * This prevents ETXTBSY errors and makes PDF generation significantly faster.
 */
const getBrowser = async () => {
  // Simple mutex to prevent concurrent launches
  while (browserLock) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  browserLock = true;
  try {
    const isProduction = config.nodeEnv === 'production';
    let executablePath;

    if (isProduction) {
      // 1. Prioritize native Chromium installed via apt-get in Docker
      if (fs.existsSync('/usr/bin/chromium')) {
        executablePath = '/usr/bin/chromium';
      } else if (fs.existsSync('/usr/bin/chromium-browser')) {
        executablePath = '/usr/bin/chromium-browser';
      } else {
        // 2. Fallback to @sparticuz/chromium if native binary is missing
        executablePath = await chromium.executablePath();
      }
      
      // 3. Nix/Railway specific fallback
      if (!executablePath && fs.existsSync('/nix/store')) {
        const entries = fs.readdirSync('/nix/store');
        for (const entry of entries) {
          const p = path.join('/nix/store', entry, 'bin', 'google-chrome-stable');
          if (fs.existsSync(p)) { executablePath = p; break; }
        }
      }
    } else {
      executablePath = process.platform === 'darwin'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : '/usr/bin/google-chrome';
    }

    logger.info(`Launching browser with executablePath: ${executablePath || 'default'}`);
    browserInstance = await puppeteer.launch({
      args: isProduction 
        ? [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
        : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: { width: 1280, height: 1024, deviceScaleFactor: 1 },
      executablePath: executablePath || undefined,
      headless: isProduction ? chromium.headless : 'new',
    });

    browserInstance.on('disconnected', () => {
      browserInstance = null;
    });

    return browserInstance;
  } finally {
    browserLock = false;
  }
};

/**
 * Generates a PDF buffer from HTML content.
 */
const generatePdfFromHtml = async (htmlContent) => {
  let browser = null;
  let page = null;
  try {
    browser = await getBrowser();
    page = await browser.newPage();

    // Set viewport for consistent A4 scaling
    await page.setViewport({ width: 1280, height: 1024, deviceScaleFactor: 1 });

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 60000, // Increased to 60s for very slow image/font loading
    });

    // CRITICAL: Wait for all fonts to be ready before printing to prevent blank text
    await page.evaluateHandle('document.fonts.ready');

    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '20mm', left: '15mm' }, // Slightly larger bottom margin for page numbers/spacing
      displayHeaderFooter: false,
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    return pdfBuffer;
  } catch (error) {
    logger.error('PDF Generation Failed:', error.message);
    // Crash detection
    if (error.message.includes('browser has disconnected')) {
      browserInstance = null;
    }
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
};

module.exports = {
  generatePdfFromHtml,
};
