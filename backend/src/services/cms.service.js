// ============================================================
// TravelCRM — CMS Service (Sprint 8)
// ============================================================

const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');

// ─── Helpers ─────────────────────────────────────────────────
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `travelcrm/${folder}`, resource_type: 'image' },
      (err, result) => {
        if (err) {
          console.error(`[CMS] Cloudinary upload failed for ${folder}:`, err);
          return reject(err);
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// ─── CMS Pages ───────────────────────────────────────────────
const listCmsPages = () => prisma.cmsPage.findMany({ orderBy: { title: 'asc' } });
const getCmsPageBySlug = (slug) => prisma.cmsPage.findUnique({ where: { slug } });
const createCmsPage = (data) => prisma.cmsPage.create({ data });
const updateCmsPage = (id, data) => prisma.cmsPage.update({ where: { id }, data });
const deleteCmsPage = (id) => prisma.cmsPage.delete({ where: { id } });

// ─── Home Banners ────────────────────────────────────────────
const listBanners = () => prisma.homeBanner.findMany({ orderBy: { sequence: 'asc' } });
const createBanner = async (data, file) => {
  if (file) data.imageUrl = await uploadToCloudinary(file.buffer, 'banners');
  return prisma.homeBanner.create({ data });
};
const updateBanner = async (id, data, file) => {
  if (file) data.imageUrl = await uploadToCloudinary(file.buffer, 'banners');
  return prisma.homeBanner.update({ where: { id }, data });
};
const deleteBanner = (id) => prisma.homeBanner.delete({ where: { id } });

// ─── Testimonials ────────────────────────────────────────────
const listTestimonials = () => prisma.testimonial.findMany({ orderBy: { customerName: 'asc' } });
const createTestimonial = async (data, file) => {
  if (file) data.photoUrl = await uploadToCloudinary(file.buffer, 'testimonials');
  if (data.rating) data.rating = parseInt(data.rating, 10);
  return prisma.testimonial.create({ data });
};
const updateTestimonial = async (id, data, file) => {
  if (file) data.photoUrl = await uploadToCloudinary(file.buffer, 'testimonials');
  if (data.rating) data.rating = parseInt(data.rating, 10);
  return prisma.testimonial.update({ where: { id }, data });
};
const deleteTestimonial = (id) => prisma.testimonial.delete({ where: { id } });

// ─── Gallery ─────────────────────────────────────────────────
const listGallery = (category, search) => {
  const where = { isActive: true };
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { caption: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }
  return prisma.galleryImage.findMany({ where, orderBy: { createdAt: 'desc' } });
};
const createGalleryImage = async (data, file) => {
  if (file) {
    try {
      data.imageUrl = await uploadToCloudinary(file.buffer, 'gallery');
    } catch (e) {
      console.error('[CMS] createGalleryImage failed at cloudinary:', e);
      throw e;
    }
  }
  if (data.sequence) data.sequence = parseInt(data.sequence, 10);
  data.isActive = true;
  return prisma.galleryImage.create({ data });
};
const updateGalleryImage = async (id, data, file) => {
  if (file) data.imageUrl = await uploadToCloudinary(file.buffer, 'gallery');
  if (data.sequence) data.sequence = parseInt(data.sequence, 10);
  return prisma.galleryImage.update({ where: { id }, data });
};
const deleteGalleryImage = (id) => prisma.galleryImage.delete({ where: { id } });

// ─── Blog Posts ──────────────────────────────────────────────
const listBlogPosts = (publishedOnly = false) => {
  const where = publishedOnly ? { isPublished: true } : {};
  return prisma.blogPost.findMany({ where, orderBy: { createdAt: 'desc' } });
};
const getBlogBySlug = (slug) => prisma.blogPost.findUnique({ where: { slug } });
const createBlogPost = async (data, file) => {
  if (file) data.coverImage = await uploadToCloudinary(file.buffer, 'blog');
  if (data.isPublished === 'true' || data.isPublished === true) {
    data.isPublished = true;
    data.publishedAt = new Date();
  } else {
    data.isPublished = false;
  }
  return prisma.blogPost.create({ data });
};
const updateBlogPost = async (id, data, file) => {
  if (file) data.coverImage = await uploadToCloudinary(file.buffer, 'blog');
  if (data.isPublished === 'true' || data.isPublished === true) {
    data.isPublished = true;
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing?.publishedAt) data.publishedAt = new Date();
  } else if (data.isPublished === 'false' || data.isPublished === false) {
    data.isPublished = false;
  }
  return prisma.blogPost.update({ where: { id }, data });
};
const deleteBlogPost = (id) => prisma.blogPost.delete({ where: { id } });

// ─── Destination CMS ─────────────────────────────────────────
const listDestinationCms = () =>
  prisma.destinationCms.findMany({ include: { destination: { select: { id: true, name: true } } } });
const getDestinationCms = (destinationId) =>
  prisma.destinationCms.findUnique({ where: { destinationId }, include: { destination: true } });
const upsertDestinationCms = async (destinationId, data, file) => {
  if (file) data.heroImage = await uploadToCloudinary(file.buffer, 'destinations');
  return prisma.destinationCms.upsert({
    where: { destinationId },
    create: { destinationId, ...data },
    update: data,
  });
};

// ─── Package Terms ───────────────────────────────────────────
const listPackageTerms = () => prisma.packageTerms.findMany({ orderBy: { name: 'asc' } });
const createPackageTerms = (data) => {
  if (data.isDefault === 'true' || data.isDefault === true) data.isDefault = true;
  else data.isDefault = false;
  return prisma.packageTerms.create({ data });
};
const updatePackageTerms = (id, data) => {
  if (data.isDefault === 'true' || data.isDefault === true) data.isDefault = true;
  else if (data.isDefault === 'false' || data.isDefault === false) data.isDefault = false;
  return prisma.packageTerms.update({ where: { id }, data });
};
const deletePackageTerms = (id) => prisma.packageTerms.delete({ where: { id } });

module.exports = {
  listCmsPages, getCmsPageBySlug, createCmsPage, updateCmsPage, deleteCmsPage,
  listBanners, createBanner, updateBanner, deleteBanner,
  listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  listGallery, createGalleryImage, updateGalleryImage, deleteGalleryImage,
  listBlogPosts, getBlogBySlug, createBlogPost, updateBlogPost, deleteBlogPost,
  listDestinationCms, getDestinationCms, upsertDestinationCms,
  listPackageTerms, createPackageTerms, updatePackageTerms, deletePackageTerms,
};
