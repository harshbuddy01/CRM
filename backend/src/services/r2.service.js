const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const r2Client = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'dummy',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'imagica-assets';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://media.imagicaholidays.com';

/**
 * Optimizes an image buffer using sharp.
 * Converts to webp, limits max width/height, and compresses.
 * @param {Buffer} buffer - Raw file buffer
 * @param {string} section - CRM section (for custom sizing)
 * @returns {Promise<Buffer>} - Optimized WebP image buffer
 */
const optimizeImage = async (buffer, section = 'general') => {
  let width = 1200; // Default max width
  let quality = 80;

  if (section === 'hero' || section === 'banners') {
    width = 1920; // High-res banners
  } else if (section === 'gallery' || section === 'spots' || section === 'destinations') {
    width = 1000; // Medium sized photos
  } else if (section === 'testimonials' || section === 'avatar') {
    width = 400; // Small avatars
  }

  return sharp(buffer)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
};

/**
 * Uploads a file buffer (image or video) to Cloudflare R2.
 * If the file is an image, it optimizes it to WebP first.
 * @param {object} file - Multer file object (has buffer, originalname, mimetype)
 * @param {string} section - Folder or website section name
 * @returns {Promise<string>} - The public CDN URL of the uploaded asset
 */
const uploadAsset = async (file, section = 'general') => {
  const accessKey = process.env.R2_ACCESS_KEY_ID || '';
  const secretKey = process.env.R2_SECRET_ACCESS_KEY || '';
  const isPlaceholder = (val) => !val || val.startsWith('YOUR_') || val === 'dummy';

  if (isPlaceholder(accessKey) || isPlaceholder(secretKey)) {
    console.warn('⚠️ [R2] Credentials missing or placeholder, using mock/local fallback.');
    // Return a dummy placeholder to prevent failure
    return `https://images.unsplash.com/photo-1542223189-67a03fa0f0bd?w=1000`;
  }

  let buffer = file.buffer;
  let filename = `${section}/${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  let contentType = file.mimetype;

  // Only optimize images (skip videos entirely)
  if (file.mimetype.startsWith('image/')) {
    try {
      buffer = await optimizeImage(file.buffer, section);
      // Replace extension with webp
      filename = filename.replace(/\.[^.]+$/, '.webp');
      contentType = 'image/webp';
    } catch (err) {
      console.error('❌ [R2] Image optimization failed, uploading raw image:', err.message);
    }
  } else if (file.mimetype.startsWith('video/')) {
    // Videos pass through without any transformation
    console.log(`📹 [R2] Uploading video (${(file.buffer.length / 1024 / 1024).toFixed(1)} MB): ${file.originalname}`);
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);
  const fileUrl = `${PUBLIC_URL}/${filename}`;
  console.log(`✅ [R2] Asset uploaded to: ${fileUrl}`);
  return fileUrl;
};

/**
 * Deletes a file from Cloudflare R2 by its public URL.
 * @param {string} url - Public URL of the file to delete
 */
const deleteAsset = async (url) => {
  if (!url || !url.includes(PUBLIC_URL) || !process.env.R2_ACCESS_KEY_ID) return;

  try {
    const key = url.replace(`${PUBLIC_URL}/`, '');
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
    console.log(`✅ [R2] Asset deleted: ${key}`);
  } catch (err) {
    console.error('❌ [R2] Failed to delete asset:', err.message);
  }
};

module.exports = {
  uploadAsset,
  deleteAsset,
};
