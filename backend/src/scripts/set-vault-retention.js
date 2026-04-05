// ============================================================
// TravelCRM — Vault Retention Policy (Auto-Cleanup)
// Sets a 30-day lifecycle rule on the crm-backups bucket
// ============================================================

require('dotenv').config({ path: '.env' });
const { S3Client, PutBucketLifecycleConfigurationCommand } = require('@aws-sdk/client-s3');

const vaultConfig = {
  endpoint: process.env.VAULT_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.VAULT_ACCESS_KEY,
    secretAccessKey: process.env.VAULT_SECRET_KEY,
  },
  forcePathStyle: true,
};

const client = new S3Client(vaultConfig);

async function setRetention() {
  console.log('🚀 [Vault] Configuring 30-Day Retention Policy...');

  try {
    const bucket = process.env.VAULT_BUCKET || 'crm-backups';
    
    const command = new PutBucketLifecycleConfigurationCommand({
      Bucket: bucket,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: 'KeepLast30Days',
            Status: 'Enabled',
            Filter: { Prefix: 'backups/' }, // Only clean up files in the backups folder
            Expiration: { Days: 30 }, // Automatically delete after 30 days
          },
        ],
      },
    });

    await client.send(command);
    console.log('✅ [Vault] Retention Policy Active: Backups older than 30 days will be auto-deleted.');
  } catch (error) {
    console.error('❌ [VaultError] Failed to set retention policy:', error.message);
  }
}

setRetention();
