// ============================================================
// TravelCRM — CMS Routes (Sprint 8)
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const cms = require('../controllers/cms.controller');
const { authenticate } = require('../middlewares/authenticate');
const { can } = require('../middlewares/can');

const ALLOWED_IMAGE_TYPES = ['image/jpeg','image/png','image/gif','image/webp'];
const checkImageType = (req, res, next) => {
  if (req.file && !ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ success: false, message: 'File type not allowed' });
  }
  next();
};

// All CMS routes require authentication + admin/master management permission
router.use(authenticate);

// ─── CMS Pages (About, Terms, Privacy) ──────────────────────
router.get('/pages', cms.listCmsPages);
router.get('/pages/:slug', cms.getCmsPage);
router.post('/pages', can('master.manage_destinations'), cms.createCmsPage);
router.put('/pages/:id', can('master.manage_destinations'), cms.updateCmsPage);
router.delete('/pages/:id', can('master.manage_destinations'), cms.deleteCmsPage);

// ─── Home Banners ────────────────────────────────────────────
router.get('/banners', cms.listBanners);
router.post('/banners', can('master.manage_destinations'), upload.single('image'), checkImageType, cms.createBanner);
router.put('/banners/:id', can('master.manage_destinations'), upload.single('image'), checkImageType, cms.updateBanner);
router.delete('/banners/:id', can('master.manage_destinations'), cms.deleteBanner);

// ─── Testimonials ────────────────────────────────────────────
router.get('/testimonials', cms.listTestimonials);
router.post('/testimonials', can('master.manage_destinations'), upload.single('photo'), checkImageType, cms.createTestimonial);
router.put('/testimonials/:id', can('master.manage_destinations'), upload.single('photo'), checkImageType, cms.updateTestimonial);
router.delete('/testimonials/:id', can('master.manage_destinations'), cms.deleteTestimonial);

// ─── Gallery ─────────────────────────────────────────────────
router.get('/gallery', cms.listGallery);
router.post('/gallery', can('master.manage_destinations'), upload.single('image'), checkImageType, cms.createGalleryImage);
router.put('/gallery/:id', can('master.manage_destinations'), upload.single('image'), checkImageType, cms.updateGalleryImage);
router.delete('/gallery/:id', can('master.manage_destinations'), cms.deleteGalleryImage);

// ─── Blog Posts ──────────────────────────────────────────────
router.get('/blog', cms.listBlogPosts);
router.get('/blog/:slug', cms.getBlogPost);
router.post('/blog', can('master.manage_destinations'), upload.single('cover'), checkImageType, cms.createBlogPost);
router.put('/blog/:id', can('master.manage_destinations'), upload.single('cover'), checkImageType, cms.updateBlogPost);
router.delete('/blog/:id', can('master.manage_destinations'), cms.deleteBlogPost);

// ─── Destination CMS ─────────────────────────────────────────
router.get('/destinations', cms.listDestinationCms);
router.get('/destinations/:destinationId', cms.getDestinationCms);
router.put('/destinations/:destinationId', can('master.manage_destinations'), upload.single('heroImage'), checkImageType, cms.upsertDestinationCms);

// ─── Package Terms ───────────────────────────────────────────
router.get('/package-terms', cms.listPackageTerms);
router.post('/package-terms', can('master.manage_destinations'), cms.createPackageTerms);
router.put('/package-terms/:id', can('master.manage_destinations'), cms.updatePackageTerms);
router.delete('/package-terms/:id', can('master.manage_destinations'), cms.deletePackageTerms);

module.exports = router;
