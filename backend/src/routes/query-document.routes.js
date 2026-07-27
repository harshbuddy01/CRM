// ============================================================
// TravelCRM — Query Document Routes (Sprint 10)
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB
const queryDocService = require('../services/query-document.service');
const { authenticate } = require('../middlewares/authenticate');

const ALLOWED_TYPES = ['image/jpeg','image/png','image/gif','image/webp','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'];

// List documents for a query
router.get('/queries/:id/documents', authenticate, async (req, res, next) => {
  try {
    const docs = await queryDocService.listByQuery(req.params.id);
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
});

// Upload a document
router.post('/queries/:id/documents', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'File type not allowed' });
    }
    const doc = await queryDocService.uploadDocument(req.params.id, req.file, req.body.label, req.user.id);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
});

// Delete a document
router.delete('/documents/:id', authenticate, async (req, res, next) => {
  try {
    await queryDocService.deleteDocument(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
