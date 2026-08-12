require('dotenv').config();
const whatsappService = require('./src/services/whatsapp.service');

const args = process.argv.slice(2);
const phone = args[0] ? args[0].replace(/\D/g, '') : '918235337180';
const templateToTest = args[1] || 'client_invoice_ready';

async function runTest() {
  console.log(`🚀 Testing Approved Production Template "${templateToTest}" to ${phone}...`);

  let components = [];

  if (templateToTest === 'client_invoice_ready') {
    components = [
      {
        type: 'header',
        parameters: [
          {
            type: 'document',
            document: {
              link: 'https://pdfobject.com/pdf/sample.pdf',
              filename: 'Invoice-INV-2026-001.pdf'
            }
          }
        ]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'Rahul Sharma' },
          { type: 'text', text: 'INV-2026-001' },
          { type: 'text', text: '₹45,000' }
        ]
      }
    ];
  } else if (templateToTest === 'guest_voucher_ready') {
    components = [
      {
        type: 'header',
        parameters: [
          {
            type: 'document',
            document: {
              link: 'https://pdfobject.com/pdf/sample.pdf',
              filename: 'Voucher-VCH-2026-001.pdf'
            }
          }
        ]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'Rahul Sharma' },
          { type: 'text', text: 'VCH-2026-001' },
          { type: 'text', text: 'Taj Exotica Hotel' }
        ]
      }
    ];
  } else if (templateToTest === 'client_payment_received') {
    components = [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'Rahul Sharma' },
          { type: 'text', text: '₹10,000' },
          { type: 'text', text: 'UPI / Razorpay' },
          { type: 'text', text: '₹35,000' }
        ]
      }
    ];
  } else if (templateToTest === 'proposal_ready') {
    components = [
      {
        type: 'header',
        parameters: [
          {
            type: 'document',
            document: {
              link: 'https://pdfobject.com/pdf/sample.pdf',
              filename: 'Travel-Proposal.pdf'
            }
          }
        ]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'Rahul Sharma' }
        ]
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [
          { type: 'text', text: 'share/demo-slug' }
        ]
      }
    ];
  }

  const result = await whatsappService.sendTemplateMessage(phone, templateToTest, components, 'en_US');
  console.log('\n--- Meta API Response ---');
  console.log(result);

  if (result.success) {
    console.log(`\n🎉 SUCCESS: Template "${templateToTest}" delivered to ${phone}! Check your phone!`);
  } else {
    console.log(`\n❌ FAILED: ${result.error}`);
  }
}

runTest();
