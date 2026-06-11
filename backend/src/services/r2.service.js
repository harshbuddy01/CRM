const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const hasFfmpeg = () => {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
};

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
 * Transcodes a video file to HLS playlist and segment files, and uploads all of them to R2.
 * Returns the public URL of the playlist.m3u8 file.
 */
const transcodeAndUploadHls = async (file, section) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hls-'));
  const inputPath = path.join(tempDir, 'input.mp4');
  
  try {
    fs.writeFileSync(inputPath, file.buffer);
    
    const folderId = uuidv4();
    const r2Folder = `${section}/hls/${folderId}`;
    const playlistName = 'playlist.m3u8';
    const playlistPath = path.join(tempDir, playlistName);
    
    console.log(`🎬 [HLS] Transcoding video to HLS: ${r2Folder}`);
    execSync(
      `ffmpeg -y -i "${inputPath}" ` +
      `-codec:v libx264 -profile:v main -preset medium -crf 22 ` +
      `-g 100 -keyint_min 100 -sc_threshold 0 ` +
      `-codec:a aac -b:a 128k ` +
      `-hls_time 4 ` +
      `-hls_playlist_type vod ` +
      `-hls_segment_filename "${tempDir}/segment_%03d.ts" ` +
      `"${playlistPath}"`,
      { stdio: 'pipe' }
    );
    
    const files = fs.readdirSync(tempDir);
    let playlistUrl = '';
    
    for (const filename of files) {
      if (filename === 'input.mp4') continue;
      
      const filePath = path.join(tempDir, filename);
      const fileBuffer = fs.readFileSync(filePath);
      const fileKey = `${r2Folder}/${filename}`;
      
      let contentType = 'application/octet-stream';
      if (filename.endsWith('.m3u8')) {
        contentType = 'application/x-mpegURL';
      } else if (filename.endsWith('.ts')) {
        contentType = 'video/MP2T';
      }
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: contentType,
      });
      
      await r2Client.send(command);
      
      if (filename === playlistName) {
        playlistUrl = `${PUBLIC_URL}/${fileKey}`;
      }
    }
    
    console.log(`✅ [HLS] Video transcoded and uploaded to R2 successfully: ${playlistUrl}`);
    return playlistUrl;
  } catch (error) {
    console.error('❌ [HLS] Transcoding failed, falling back to raw upload:', error.message);
    throw error;
  } finally {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error('⚠️ [HLS] Failed to clean up temp files:', cleanupError.message);
    }
  }
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
    console.log(`📹 [R2] Processing video upload (${(file.buffer.length / 1024 / 1024).toFixed(1)} MB): ${file.originalname}`);
    if (hasFfmpeg()) {
      try {
        const playlistUrl = await transcodeAndUploadHls(file, section);
        return playlistUrl;
      } catch (err) {
        console.warn('⚠️ [R2] HLS transcoding failed. Falling back to normal video upload.');
      }
    } else {
      console.log('⚠️ [R2] ffmpeg not found. Skipping HLS transcoding and uploading raw video.');
    }
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
