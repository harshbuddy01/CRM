const express = require('express');
const router = express.Router();
const multer = require('multer');
const controller = require('../controllers/website-config.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

// Multer memory storage config — 100 MB to allow hero background videos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for video uploads
});

// Image / Video type check
const ALLOWED_MIMETYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'
];
const checkFileTypes = (req, res, next) => {
  const checkSingle = (file) => ALLOWED_MIMETYPES.includes(file.mimetype);
  
  if (req.file && !checkSingle(req.file)) {
    return res.status(400).json({ success: false, message: `File type ${req.file.mimetype} not allowed` });
  }
  
  if (req.files) {
    const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat().filter(Boolean);
    for (const file of filesArray) {
      if (!checkSingle(file)) {
        return res.status(400).json({ success: false, message: `File type ${file.mimetype} not allowed` });
      }
    }
  }
  next();
};

// ─── Public Endpoints ───
router.get('/public', controller.getWebsiteConfig);

// ─── Admin/CMS Endpoints (Authentication & Authorization required) ───
router.use(authenticate);

// Update specific website sections (Hero, Odyssey, Destinations, Activities, Villas)
router.put('/cms/:section', can('master.manage_destinations'), upload.any(), checkFileTypes, controller.updateWebsiteSection);

// Update destination inside pages (Cover, Attractions, aboutHtml, etc.)
router.put('/destinations/:destinationId', can('master.manage_destinations'), upload.any(), checkFileTypes, controller.updateDestinationCmsPage);

// Generic R2 file upload for Itinerary Days / Banners / Map images
router.post('/cms/upload', upload.single('file'), checkFileTypes, controller.uploadJourneyFile);

// Delete a file from Cloudflare R2 by public URL
router.delete('/cms/delete-asset', can('master.manage_destinations'), controller.deleteAssetFromR2);

module.exports = router;
