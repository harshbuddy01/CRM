// ============================================================
// TravelCRM — Itinerary Routes
// Public share endpoint + all protected CRUD/image/day/event routes
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

const handleSingleUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

const handleArrayUpload = (field, maxCount) => (req, res, next) => {
  upload.array(field, maxCount)(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

const ctrl = require('../controllers/itinerary.controller');
const { authenticate } = require('../middlewares/authenticate');

// ── Public Routes (no auth) ─────────────────────────────────

// Public share page data
router.get('/share/:slug', ctrl.getByShareSlug);
router.get('/share/:slug/html', ctrl.exportHtmlByShareSlug);

// ── Protected Routes ─────────────────────────────────────────

router.use(authenticate);

// Core CRUD
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/duplicate', ctrl.duplicate);
router.post('/:id/publish-template', ctrl.publishToTemplates);

// Cover photo & gallery
router.post('/:id/cover-photo', handleSingleUpload('photo'), ctrl.uploadCoverPhoto);
router.post('/:id/gallery', handleArrayUpload('photos', 20), ctrl.uploadGalleryImages);
router.post('/:id/gallery-bulk', ctrl.uploadGalleryByUrl);
router.delete('/gallery/:imageId', ctrl.removeGalleryImage);

// Day management
router.post('/:id/days', ctrl.addDay);
router.put('/days/:dayId', ctrl.updateDay);
router.put('/days/:dayId/image', handleSingleUpload('photo'), ctrl.uploadDayImage);
router.delete('/days/:dayId', ctrl.removeDay);

// Event management
router.post('/days/:dayId/events', ctrl.addEvent);
router.put('/events/:eventId', ctrl.updateEvent);
router.delete('/events/:eventId', ctrl.removeEvent);
router.put('/days/:dayId/reorder', ctrl.reorderEvents);
router.post('/events/:eventId/image', handleSingleUpload('photo'), ctrl.uploadEventImage);

// Share & Export
router.post('/:id/generate-share-link', ctrl.generateShareLink);
router.get('/:id/export-pdf', ctrl.exportPdf);
router.get('/:id/html', ctrl.exportHtml);

module.exports = router;
