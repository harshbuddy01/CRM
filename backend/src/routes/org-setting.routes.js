const express = require('express');
const router = express.Router();
const orgSettingController = require('../controllers/org-setting.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');
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

router.use(authenticate);

// Settings can be viewed by anyone, but updated only by admin
router.get('/', orgSettingController.getAllSettings);
router.post('/upload', can('users.manage'), handleSingleUpload('file'), orgSettingController.uploadAsset);
router.get('/:key', orgSettingController.getSettingByKey);
router.post('/', can('users.manage'), orgSettingController.saveSettings);

module.exports = router;
