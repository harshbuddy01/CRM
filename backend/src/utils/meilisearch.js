// ============================================================
// TravelCRM — Meilisearch Utility
// High-performance instant search sync helper
// ============================================================

const { MeiliSearch } = require('meilisearch');
const config = {
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY,
};

const client = new MeiliSearch(config);

/**
 * Syncs an array of objects to a Meilisearch index.
 * @param {string} indexName - Name of the index (e.g. 'itineraries')
 * @param {Array} documents - Array of objects to index
 */
const syncToMeili = async (indexName, documents) => {
  if (!config.apiKey) {
    console.warn('[MeiliSync] Skip sync: No Master Key configured.');
    return;
  }

  try {
    const index = client.index(indexName);
    
    // Ensure the index exists and has correct settings on first sync
    if (indexName === 'itineraries') {
      await index.updateSettings({
        searchableAttributes: ['title', 'description', 'destinations'],
        filterableAttributes: ['isActive', 'totalDays'],
        sortableAttributes: ['createdAt', 'sellingPrice'],
      });
    } else if (indexName === 'destinations') {
      await index.updateSettings({
        searchableAttributes: ['name', 'country', 'description'],
        filterableAttributes: ['isActive'],
      });
    }

    const task = await index.addDocuments(documents);
    console.log(`[MeiliSync] Task queued for index "${indexName}": ${task.taskUid}`);
    return task;
  } catch (error) {
    console.error(`[MeiliError] Sync failed for index "${indexName}":`, error.message);
  }
};

/**
 * Removes a specific document from a Meilisearch index.
 */
const removeFromMeili = async (indexName, documentId) => {
  try {
    const index = client.index(indexName);
    const task = await index.deleteDocument(documentId);
    return task;
  } catch (error) {
    console.error(`[MeiliError] Deletion failed for index "${indexName}":`, error.message);
  }
};

module.exports = {
  client,
  syncToMeili,
  removeFromMeili,
};
