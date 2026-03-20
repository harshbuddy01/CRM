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
    console.log(`[PDF] Mode: ${isProduction ? 'Production' : 'Local'}`);
    
    let executablePath;
    
    if (isProduction) {
      console.log('[PDF] Attempting to resolve Chromium path via @sparticuz/chromium...');
      executablePath = await chromium.executablePath();
      
      // Fallback for Railway/Linux environments if @sparticuz fails
      if (!executablePath) {
        const commonPaths = [
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser',
          '/nix/store/*/bin/google-chrome' // Common for Nixpacks
        ];
        console.log('[PDF] @sparticuz returned NULL. Probing common Linux paths...');
        const fs = require('fs');
        for (const path of commonPaths) {
          if (fs.existsSync(path)) {
            executablePath = path;
            console.log(`[PDF] Found fallback path: ${path}`);
            break;
          }
        }
      }
      console.log(`[PDF] Final Executable Path: ${executablePath || 'NOT FOUND'}`);
    } else {
      executablePath =
        process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome';
    }

    if (isProduction && !executablePath) {
      console.warn('[PDF] WARNING: Chromium executable path is NULL in production. Attempting standard puppeteer launch...');
    }

    browser = await puppeteer.launch({
      args: isProduction ? [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        // NOTE: --single-process was removed in Chromium 113 — do NOT add it back
        // It causes an immediate crash on Chromium 131+
      ] : [],
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath || undefined,
      headless: isProduction ? chromium.headless : true,
      ignoreHTTPSErrors: true,
    });

    console.log('[PDF] Browser launched successfully');
    const page = await browser.newPage();
    
    // Set HTML content and wait for network/fonts to finish loading
    await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('[PDF] Page content set');

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
    console.log(`[PDF] PDF Buffer generated: ${pdfBuffer.length} bytes`);

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
