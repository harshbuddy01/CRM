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
let idleTimer = null;

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

/**
 * Closes the browser after a period of inactivity to save RAM.
 */
const startIdleTimer = () => {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    if (browserInstance) {
      logger.info('Closing Chromium due to inactivity (10m idle).');
      await browserInstance.close().catch(() => {});
      browserInstance = null;
    }
  }, IDLE_TIMEOUT);
};

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

    if (!executablePath && config.nodeEnv === 'production') {
      logger.warn('No Chromium executable found via native paths or sparticuz. Attempting fallback launch.');
    }

    const isNative = executablePath && (
      executablePath === '/usr/bin/chromium' || 
      executablePath === '/usr/bin/chromium-browser' ||
      executablePath.includes('google-chrome') ||
      executablePath.includes('google-chrome-stable')
    );

    const launchArgs = isNative
      ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
      : (isProduction ? [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-web-security'] : ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-web-security']);

    const launchHeadless = isNative ? true : (isProduction ? chromium.headless : 'new');

    logger.info(`Launching browser. Executable: ${executablePath || 'default-bundled'}. Platform: ${process.platform}. Env: ${config.nodeEnv}. Native: ${isNative}`);
    browserInstance = await puppeteer.launch({
      args: launchArgs,
      defaultViewport: { width: 1280, height: 1024, deviceScaleFactor: 1 },
      executablePath: executablePath || undefined,
      headless: launchHeadless,
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
  let lastError = null;
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let browser = null;
    let page = null;
    try {
      browser = await getBrowser();
      page = await browser.newPage();

      // Set viewport for consistent A4 scaling
      await page.setViewport({ width: 1280, height: 1024, deviceScaleFactor: 1 });

      await page.setContent(htmlContent, {
        waitUntil: 'networkidle2', // Wait until images and assets are fully loaded
        timeout: 45000,            // 45 seconds per attempt
      });

      // Wait a short fixed time for fonts/images to partially render.
      // We do NOT use document.fonts.ready because it blocks indefinitely waiting
      // for Google Fonts CDN which may be slow or unavailable inside the Docker container.
      await new Promise(resolve => setTimeout(resolve, 800));

      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }, // Zero margins — the HTML template handles all internal padding
        displayHeaderFooter: false,
      };

      const pdfBuffer = await page.pdf(pdfOptions);

      // Reset the idle timer on successful use
      startIdleTimer();

      return pdfBuffer;
    } catch (error) {
      lastError = error;
      logger.error(`PDF Generation Failed (attempt ${attempt}/${maxRetries}):`, error.message);

      // Clean up the page
      if (page) {
        await page.close().catch(() => {});
        page = null;
      }

      // Proactively destroy and recreate the browser instance on failure to clear crashed/detached states
      if (browserInstance) {
        logger.warn('Forcing browser close and recreation due to generation error.');
        await browserInstance.close().catch(() => {});
        browserInstance = null;
      }

      // Wait 1 second before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  throw new Error(`Failed to generate PDF after ${maxRetries} attempts: ${lastError.message}`);
};

module.exports = {
  generatePdfFromHtml,
};
