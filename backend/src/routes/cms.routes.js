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
router.post('/banners', can('master.manage_destinations'), upload.single('image'), cms.createBanner);
router.put('/banners/:id', can('master.manage_destinations'), upload.single('image'), cms.updateBanner);
router.delete('/banners/:id', can('master.manage_destinations'), cms.deleteBanner);

// ─── Testimonials ────────────────────────────────────────────
router.get('/testimonials', cms.listTestimonials);
router.post('/testimonials', can('master.manage_destinations'), upload.single('photo'), cms.createTestimonial);
router.put('/testimonials/:id', can('master.manage_destinations'), upload.single('photo'), cms.updateTestimonial);
router.delete('/testimonials/:id', can('master.manage_destinations'), cms.deleteTestimonial);

// ─── Gallery ─────────────────────────────────────────────────
router.get('/gallery', cms.listGallery);
router.post('/gallery', can('master.manage_destinations'), upload.single('image'), cms.createGalleryImage);
router.put('/gallery/:id', can('master.manage_destinations'), upload.single('image'), cms.updateGalleryImage);
router.delete('/gallery/:id', can('master.manage_destinations'), cms.deleteGalleryImage);

// ─── Blog Posts ──────────────────────────────────────────────
router.get('/blog', cms.listBlogPosts);
router.get('/blog/:slug', cms.getBlogPost);
router.post('/blog', can('master.manage_destinations'), upload.single('cover'), cms.createBlogPost);
router.put('/blog/:id', can('master.manage_destinations'), upload.single('cover'), cms.updateBlogPost);
router.delete('/blog/:id', can('master.manage_destinations'), cms.deleteBlogPost);

// ─── Destination CMS ─────────────────────────────────────────
router.get('/destinations', cms.listDestinationCms);
router.get('/destinations/:destinationId', cms.getDestinationCms);
router.put('/destinations/:destinationId', can('master.manage_destinations'), upload.single('heroImage'), cms.upsertDestinationCms);

// ─── Package Terms ───────────────────────────────────────────
router.get('/package-terms', cms.listPackageTerms);
router.post('/package-terms', can('master.manage_destinations'), cms.createPackageTerms);
router.put('/package-terms/:id', can('master.manage_destinations'), cms.updatePackageTerms);
router.delete('/package-terms/:id', can('master.manage_destinations'), cms.deletePackageTerms);

module.exports = router;
