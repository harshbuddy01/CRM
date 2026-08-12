require('dotenv').config();
const axios = require('axios');

const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1705855977358474';
const APP_ID = '1027894549985525';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';

if (!ACCESS_TOKEN) {
  console.error('❌ WHATSAPP_ACCESS_TOKEN is missing in .env');
  process.exit(1);
}

async function getSamplePdfHandle() {
  try {
    const dummyPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer << /Size 4 /Root 1 0 R >>
startxref
190
%%EOF`;
    const pdfBuffer = Buffer.from(dummyPdf, 'utf-8');

    const sessionRes = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${APP_ID}/uploads`,
      null,
      {
        params: {
          file_name: 'sample.pdf',
          file_length: pdfBuffer.length,
          file_type: 'application/pdf',
          access_token: ACCESS_TOKEN
        }
      }
    );

    const uploadRes = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${sessionRes.data.id}`,
      pdfBuffer,
      {
        headers: {
          'Authorization': `OAuth ${ACCESS_TOKEN}`,
          'file_offset': '0',
          'Content-Type': 'application/pdf'
        }
      }
    );

    return uploadRes.data.h;
  } catch (err) {
    console.error('⚠️ Could not obtain PDF handle automatically:', err.response?.data?.error?.message || err.message);
    return null;
  }
}

async function createAllTemplates() {
  console.log(`🤖 Starting Automated Meta Template Creator...`);
  console.log(`WABA ID: ${WABA_ID}`);

  const pdfHandle = await getSamplePdfHandle();

  const documentHeader = pdfHandle 
    ? { type: 'HEADER', format: 'DOCUMENT', example: { header_handle: [pdfHandle] } }
    : { type: 'HEADER', format: 'DOCUMENT' };

  const templates = [
    {
      name: 'client_invoice_ready',
      category: 'UTILITY',
      language: 'en_US',
      components: [
        documentHeader,
        {
          type: 'BODY',
          text: 'Hi {{1}}, please find your trip invoice ({{2}}) attached for amount {{3}}. Thank you!',
          example: { body_text: [['Rahul Sharma', 'INV-2026-001', '₹45,000']] }
        }
      ]
    },
    {
      name: 'driver_started_ride',
      category: 'UTILITY',
      language: 'en_US',
      components: [
        {
          type: 'BODY',
          text: 'Hi {{1}}, your driver {{2}} driving {{3}} is en route to pick you up. Click link {{4}} to track live location.',
          example: { body_text: [['Rahul Sharma', 'Amit Kumar', 'Toyota Innova (MH01AB1234)', 'https://guest.imagicaholidays.com/tour-123']] }
        }
      ]
    }
  ];

  for (const tpl of templates) {
    const url = `https://graph.facebook.com/${API_VERSION}/${WABA_ID}/message_templates`;
    try {
      console.log(`Submitting "${tpl.name}"...`);
      const res = await axios.post(url, tpl, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Success: "${tpl.name}" created! ID: ${res.data.id}, Status: ${res.data.status || 'SUBMITTED'}\n`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log(`ℹ️ Info: "${tpl.name}" already exists on Meta.\n`);
      } else {
        console.error(`❌ Error submitting "${tpl.name}":`, msg);
        if (err.response?.data) {
          console.error(JSON.stringify(err.response.data, null, 2));
        }
        console.log('');
      }
    }
  }

  console.log('🎉 All 10 templates are now fully submitted to Meta!');
}

createAllTemplates();
