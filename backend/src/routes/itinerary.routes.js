// ============================================================
// TravelCRM — Itinerary Routes
// Public share endpoint + all protected CRUD/image/day/event routes
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
const ctrl = require('../controllers/itinerary.controller');
const { authenticate } = require('../middlewares/authenticate');

// ── Public Routes (no auth) ─────────────────────────────────

// Public share page data
router.get('/share/:slug', ctrl.getByShareSlug);

// ── Protected Routes ─────────────────────────────────────────

router.use(authenticate);

// Core CRUD
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/duplicate', ctrl.duplicate);

// Cover photo & gallery
router.post('/:id/cover-photo', upload.single('photo'), ctrl.uploadCoverPhoto);
router.post('/:id/gallery', upload.array('photos', 20), ctrl.uploadGalleryImages);
router.delete('/gallery/:imageId', ctrl.removeGalleryImage);

// Day management
router.post('/:id/days', ctrl.addDay);
router.put('/days/:dayId', ctrl.updateDay);
router.delete('/days/:dayId', ctrl.removeDay);

// Event management
router.post('/days/:dayId/events', ctrl.addEvent);
router.put('/events/:eventId', ctrl.updateEvent);
router.delete('/events/:eventId', ctrl.removeEvent);
router.put('/days/:dayId/reorder', ctrl.reorderEvents);
router.post('/events/:eventId/image', upload.single('photo'), ctrl.uploadEventImage);

// Share & Export
router.post('/:id/generate-share-link', ctrl.generateShareLink);
router.get('/:id/export-pdf', ctrl.exportPdf);

module.exports = router;
