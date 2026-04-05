// ============================================================
// TravelCRM — Safety Vault Utility (MinIO/S3)
// Automated backup and recovery helper
// ============================================================

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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
    const bucket = process.env.VAULT_BUCKET || 'crm-backups';
    const command = new PutObjectCommand({
      Bucket: bucket,
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

module.exports = {
  uploadToVault,
};
