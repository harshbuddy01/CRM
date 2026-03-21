// ============================================================
// TravelCRM — CMS Controller (Sprint 8)
// ============================================================

const cmsService = require('../services/cms.service');

// ─── CMS Pages ───────────────────────────────────────────────
const listCmsPages = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.listCmsPages() }); }
  catch (e) { next(e); }
};
const getCmsPage = async (req, res, next) => {
  try {
    const page = await cmsService.getCmsPageBySlug(req.params.slug);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (e) { next(e); }
};
const createCmsPage = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await cmsService.createCmsPage(req.body) }); }
  catch (e) { next(e); }
};
const updateCmsPage = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.updateCmsPage(req.params.id, req.body) }); }
  catch (e) { next(e); }
};
const deleteCmsPage = async (req, res, next) => {
  try { await cmsService.deleteCmsPage(req.params.id); res.json({ success: true, message: 'Page deleted' }); }
  catch (e) { next(e); }
};

// ─── Home Banners ────────────────────────────────────────────
const listBanners = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.listBanners() }); }
  catch (e) { next(e); }
};
const createBanner = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await cmsService.createBanner(req.body, req.file) }); }
  catch (e) { next(e); }
};
const updateBanner = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.updateBanner(req.params.id, req.body, req.file) }); }
  catch (e) { next(e); }
};
const deleteBanner = async (req, res, next) => {
  try { await cmsService.deleteBanner(req.params.id); res.json({ success: true, message: 'Banner deleted' }); }
  catch (e) { next(e); }
};

// ─── Testimonials ────────────────────────────────────────────
const listTestimonials = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.listTestimonials() }); }
  catch (e) { next(e); }
};
const createTestimonial = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await cmsService.createTestimonial(req.body, req.file) }); }
  catch (e) { next(e); }
};
const updateTestimonial = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.updateTestimonial(req.params.id, req.body, req.file) }); }
  catch (e) { next(e); }
};
const deleteTestimonial = async (req, res, next) => {
  try { await cmsService.deleteTestimonial(req.params.id); res.json({ success: true, message: 'Testimonial deleted' }); }
  catch (e) { next(e); }
};

// ─── Gallery ─────────────────────────────────────────────────
const listGallery = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.listGallery(req.query.category) }); }
  catch (e) { next(e); }
};
const createGalleryImage = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await cmsService.createGalleryImage(req.body, req.file) }); }
  catch (e) { next(e); }
};
const updateGalleryImage = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.updateGalleryImage(req.params.id, req.body, req.file) }); }
  catch (e) { next(e); }
};
const deleteGalleryImage = async (req, res, next) => {
  try { await cmsService.deleteGalleryImage(req.params.id); res.json({ success: true, message: 'Image deleted' }); }
  catch (e) { next(e); }
};

// ─── Blog Posts ──────────────────────────────────────────────
const listBlogPosts = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.listBlogPosts(req.query.published === 'true') }); }
  catch (e) { next(e); }
};
const getBlogPost = async (req, res, next) => {
  try {
    const post = await cmsService.getBlogBySlug(req.params.slug);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (e) { next(e); }
};
const createBlogPost = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await cmsService.createBlogPost(req.body, req.file) }); }
  catch (e) { next(e); }
};
const updateBlogPost = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.updateBlogPost(req.params.id, req.body, req.file) }); }
  catch (e) { next(e); }
};
const deleteBlogPost = async (req, res, next) => {
  try { await cmsService.deleteBlogPost(req.params.id); res.json({ success: true, message: 'Post deleted' }); }
  catch (e) { next(e); }
};

// ─── Destination CMS ─────────────────────────────────────────
const listDestinationCms = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.listDestinationCms() }); }
  catch (e) { next(e); }
};
const getDestinationCms = async (req, res, next) => {
  try {
    const cms = await cmsService.getDestinationCms(req.params.destinationId);
    res.json({ success: true, data: cms });
  } catch (e) { next(e); }
};
const upsertDestinationCms = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.upsertDestinationCms(req.params.destinationId, req.body, req.file) }); }
  catch (e) { next(e); }
};

// ─── Package Terms ───────────────────────────────────────────
const listPackageTerms = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.listPackageTerms() }); }
  catch (e) { next(e); }
};
const createPackageTerms = async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await cmsService.createPackageTerms(req.body) }); }
  catch (e) { next(e); }
};
const updatePackageTerms = async (req, res, next) => {
  try { res.json({ success: true, data: await cmsService.updatePackageTerms(req.params.id, req.body) }); }
  catch (e) { next(e); }
};
const deletePackageTerms = async (req, res, next) => {
  try { await cmsService.deletePackageTerms(req.params.id); res.json({ success: true, message: 'Terms deleted' }); }
  catch (e) { next(e); }
};

module.exports = {
  listCmsPages, getCmsPage, createCmsPage, updateCmsPage, deleteCmsPage,
  listBanners, createBanner, updateBanner, deleteBanner,
  listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  listGallery, createGalleryImage, updateGalleryImage, deleteGalleryImage,
  listBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost,
  listDestinationCms, getDestinationCms, upsertDestinationCms,
  listPackageTerms, createPackageTerms, updatePackageTerms, deletePackageTerms,
};
