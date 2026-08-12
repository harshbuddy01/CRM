require('dotenv').config();
const whatsappService = require('./src/services/whatsapp.service');

async function runTest() {
  console.log('Testing WhatsApp Integration Service...');
  
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('\n❌ ERROR: Please specify a recipient phone number (with country code, e.g. 91xxxxxxxxxx).\n');
    console.log('Example command:\n  node test_whatsapp_integration.js 916291426647\n');
    process.exit(1);
  }

  const phone = args[0].replace(/\D/g, '');
  const templateName = 'hello_world';
  const components = []; // hello_world template does not require any components or variables

  console.log(`Sending production template "${templateName}" (en_US) to ${phone}...`);
  const result = await whatsappService.sendTemplateMessage(phone, templateName, components, 'en_US');
  
  console.log('\n--- API response ---');
  console.log(result);
  console.log('--------------------');
  
  if (result.success) {
    console.log('\n✅ SUCCESS: The message has been sent to Meta. Check your phone!\n');
  } else {
    console.log('\n❌ FAILED: Message delivery failed. See the error details above.\n');
  }
}

runTest().catch(console.error);
