// ============================================================
// TravelCRM — Master V2 Controller (Sprint 7)
// ============================================================

const masterService = require('../services/master-v2.service');
const multer = require('multer');

// Multer in-memory storage (file goes to Cloudinary, not disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// Middleware for single photo upload
const uploadMiddleware = upload.single('photo');

const getList = (modelName) => async (req, res, next) => {
  try {
    const data = await masterService.getMasters(modelName, req.query);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const create = (modelName) => (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    try {
      const photoBuffer = req.file?.buffer || null;
      const item = await masterService.createMaster(modelName, req.body, photoBuffer);
      res.status(201).json({ success: true, data: item });
    } catch (error) { next(error); }
  });
};

const update = (modelName) => (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    try {
      const photoBuffer = req.file?.buffer || null;
      const item = await masterService.updateMaster(modelName, req.params.id, req.body, photoBuffer);
      res.json({ success: true, data: item });
    } catch (error) { next(error); }
  });
};

const remove = (modelName) => async (req, res, next) => {
  try {
    await masterService.deleteMaster(modelName, req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) { next(error); }
};

const getDestinations = async (req, res, next) => {
  try {
    const data = await masterService.getDestinations();
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

module.exports = { getList, create, update, remove, getDestinations };
