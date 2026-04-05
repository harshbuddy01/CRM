// ============================================================
// TravelCRM — Safety Vault Utility (MinIO/S3)
// Automated backup and recovery helper
// ============================================================

const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const vaultConfig = {
  endpoint: process.env.VAULT_ENDPOINT || 'http://localhost:9000',
  region: 'us-east-1', // MinIO default
  credentials: {
    accessKeyId: process.env.VAULT_ACCESS_KEY,
    secretAccessKey: process.env.VAULT_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
};

const client = new S3Client(vaultConfig);

const BUCKET_NAME = process.env.VAULT_BUCKET || 'crm-backups';

/**
 * Uploads a backup file to the Safety Vault.
 * @param {string} filename - The name of the backup file (e.g. backup-2024-04-05.json)
 * @param {string} content - The body of the backup
 */
const uploadToVault = async (filename, content) => {
  if (!process.env.VAULT_ACCESS_KEY) {
    console.warn('⚠️ [Vault] Skip upload: No Access Key configured in Railway.');
    return;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `backups/${filename}`,
      Body: content,
      ContentType: 'application/json',
    });

    await client.send(command);
    console.log(`✅ [Vault] Backup secured: ${filename}`);
    return true;
  } catch (error) {
    console.error('❌ [VaultError] Backup failed to upload:', error.message);
    throw error;
  }
};

/**
 * Uploads a PDF to the Safety Vault.
 * @param {string} filename - The name of the PDF file (e.g. proposal-xyz.pdf)
 * @param {Buffer} buffer - The PDF binary buffer
 */
const uploadPdfToVault = async (filename, buffer) => {
  if (!process.env.VAULT_ACCESS_KEY) {
    throw new Error('Vault access keys not configured');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `pdfs/${filename}`,
    Body: buffer,
    ContentType: 'application/pdf',
  });

  await client.send(command);
  console.log(`✅ [Vault] PDF stored: ${filename}`);
  return `minio://${BUCKET_NAME}/pdfs/${filename}`; // Return a virtual URI
};

/**
 * Retrieves a PDF from the Safety Vault.
 * @param {string} filename - The name of the PDF file
 */
const getPdfStreamFromVault = async (filename) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `pdfs/${filename}`,
  });
  const response = await client.send(command);
  return response.Body; // Returns the readable stream (or byte array) natively
};

module.exports = {
  client,
  uploadToVault,
  uploadPdfToVault,
  getPdfStreamFromVault,
};
