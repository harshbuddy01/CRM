// ============================================================
// TravelCRM — Query Document Routes (Sprint 10)
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
const queryDocService = require('../services/query-document.service');
const { authenticate } = require('../middlewares/authenticate');

router.use(authenticate);

// List documents for a query
router.get('/queries/:id/documents', async (req, res, next) => {
  try {
    const docs = await queryDocService.listByQuery(req.params.id);
    res.json({ success: true, data: docs });
  } catch (err) { next(err); }
});

// Upload a document
router.post('/queries/:id/documents', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
    const doc = await queryDocService.uploadDocument(req.params.id, req.file, req.body.label, req.user.id);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
});

// Delete a document
router.delete('/documents/:id', async (req, res, next) => {
  try {
    await queryDocService.deleteDocument(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
