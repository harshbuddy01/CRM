const express = require('express');
const multer = require('multer');
const broadcastController = require('../controllers/marketing-broadcast.controller');
const { authenticate } = require('../middlewares/authenticate');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max for PDFs or brochures
});

const handleSingleUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

const router = express.Router();

// Marketing Broadcast Routes (admin only via authenticate)
router.get('/audience',              authenticate, broadcastController.getAudience);
router.get('/stats',                 authenticate, broadcastController.getStats);
router.get('/campaigns',             authenticate, broadcastController.listCampaigns);
router.get('/campaigns/:id',         authenticate, broadcastController.getCampaign);
router.post('/campaigns',            authenticate, broadcastController.createCampaign);
router.post('/campaigns/:id/launch', authenticate, broadcastController.launchCampaign);
router.post('/upload',               authenticate, handleSingleUpload('file'), broadcastController.uploadCampaignAsset);

module.exports = router;
