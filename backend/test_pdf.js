const pdfService = require('./src/services/pdf.service');

async function main() {
  console.log("Generating PDF...");
  try {
    const buffer = await pdfService.generatePdfFromHtml('<h1>Hello World</h1><p>Test PDF</p>');
    console.log("SUCCESS, buffer size:", buffer.length);
  } catch (err) {
    console.error("PDF ERROR:", err);
  }
}
main().then(() => process.exit(0));
