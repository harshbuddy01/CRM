// ============================================================
// TravelCRM — Query Document Service (Sprint 10)
// ============================================================

const prisma = require('../config/prisma');
const cloudinary = require('cloudinary').v2;

/**
 * List all documents for a query
 */
const listByQuery = async (queryId) => {
  return prisma.queryDocument.findMany({
    where: { queryId },
    include: {
      uploader: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Upload a document (file buffer from multer)
 */
const uploadDocument = async (queryId, file, label, userId) => {
  // Upload to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `travelcrm/documents/${queryId}`,
        resource_type: 'auto',
        public_id: file.originalname.replace(/\.[^.]+$/, ''),
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });

  const ext = file.originalname.split('.').pop().toUpperCase();

  return prisma.queryDocument.create({
    data: {
      queryId,
      fileName: file.originalname,
      fileUrl: result.secure_url,
      fileType: ext,
      fileSize: Math.round(file.size / 1024), // bytes to KB
      uploadedBy: userId,
      label: label || null,
    },
    include: {
      uploader: { select: { id: true, name: true } },
    },
  });
};

/**
 * Delete a document
 */
const deleteDocument = async (id) => {
  return prisma.queryDocument.delete({ where: { id } });
};

module.exports = {
  listByQuery,
  uploadDocument,
  deleteDocument,
};
