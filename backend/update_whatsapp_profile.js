require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1221415177726969';
const APP_ID = '1027894549985525';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';

const LOGO_PATH = '/Users/harshanand/.gemini/antigravity/brain/aae7b28e-47ae-4c3d-a921-be5fe37f128d/.user_uploaded/media_1786532385164.jpg';

async function updateProfilePicture() {
  console.log('🚀 Uploading Imagica Holidays Logo Profile Picture...');
  const imageBuffer = fs.readFileSync(LOGO_PATH);
  console.log(`File Size: ${imageBuffer.length} bytes`);

  try {
    // 1. Create upload session
    console.log('Step 1: Session creation...');
    const sessionRes = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${APP_ID}/uploads`,
      null,
      {
        params: {
          file_name: 'imagica_logo.jpg',
          file_length: imageBuffer.length,
          file_type: 'image/jpeg',
          access_token: ACCESS_TOKEN
        }
      }
    );

    const sessionId = sessionRes.data.id;
    console.log(`Session Created: ${sessionId}`);

    // 2. Upload binary payload
    console.log('Step 2: Binary Upload...');
    const uploadRes = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${sessionId}`,
      imageBuffer,
      {
        headers: {
          'Authorization': `OAuth ${ACCESS_TOKEN}`,
          'file_offset': '0',
          'Content-Type': 'image/jpeg'
        }
      }
    );

    const imageHandle = uploadRes.data.h;
    console.log(`✅ Upload Handle Created: ${imageHandle}`);

    // 3. Link profile picture handle
    console.log('Step 3: Updating Profile Picture...');
    const picRes = await axios.post(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/whatsapp_business_profile`,
      {
        messaging_product: 'whatsapp',
        profile_picture_handle: imageHandle
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('🎉 SUCCESS: Profile Picture Updated on WhatsApp Business Account!');
    console.log(picRes.data);

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

updateProfilePicture();
