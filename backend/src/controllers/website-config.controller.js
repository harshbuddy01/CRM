const prisma = require('../config/prisma');
const r2Service = require('../services/r2.service');

/**
 * Public endpoint to fetch complete website config (Homepage sections + Destination inside pages)
 */
const getWebsiteConfig = async (req, res, next) => {
  try {
    const configs = await prisma.websiteConfig.findMany();
    // Transform config list from [{ key: 'hero', value: {...} }] to { hero: {...} }
    const configMap = configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Also fetch all published destination CMS details
    const destCmsList = await prisma.destinationCms.findMany({
      include: { destination: { select: { id: true, name: true } } },
    });

    res.json({
      success: true,
      data: {
        config: configMap,
        destinations: destCmsList,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin endpoint to update homepage config sections
 * Supports body updates + file uploads
 */
const updateWebsiteSection = async (req, res, next) => {
  const { section } = req.params;
  try {
    let payload = {};
    if (req.body.data) {
      try {
        payload = JSON.parse(req.body.data);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid JSON payload in "data" field' });
      }
    } else {
      payload = req.body;
    }

    // Handle file uploads if any
    // Multer places single file in req.file, or multiple files in req.files
    if (req.file) {
      const imageUrl = await r2Service.uploadAsset(req.file, section);
      payload.imageUrl = imageUrl;
    } else if (req.files) {
      // Handle multiple file inputs (e.g. custom mappings)
      const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat().filter(Boolean);
      const uploadPromises = filesArray.map(async (file) => {
        const uploadedUrl = await r2Service.uploadAsset(file, section);
        return { fieldname: file.fieldname, url: uploadedUrl };
      });
      const uploadedResults = await Promise.all(uploadPromises);
      uploadedResults.forEach(({ fieldname, url }) => {
        // We parse standard structures: e.g. "spot_0" translates to payload.spots[0].image
        const parts = fieldname.split('_'); // e.g. ["spot", "0", "image"] or ["video", "1"]
        if (parts[0] === 'spot' && payload.spots) {
          const idx = parseInt(parts[1], 10);
          if (payload.spots[idx]) payload.spots[idx].image = url;
        } else if (parts[0] === 'fallback' && payload.fallbackSlides) {
          const idx = parseInt(parts[1], 10);
          if (payload.fallbackSlides[idx]) payload.fallbackSlides[idx].image = url;
        } else if (parts[0] === 'destination' && Array.isArray(payload)) {
          const idx = parseInt(parts[1], 10);
          if (payload[idx]) {
            if (parts[2] === 'main') payload[idx].mainImage = url;
            if (parts[2] === 'overlay') payload[idx].overlayImage = url;
          }
        } else if (parts[0] === 'activity' && Array.isArray(payload)) {
          const idx = parseInt(parts[1], 10);
          if (payload[idx]) payload[idx].image = url;
        } else if (parts[0] === 'villa') {
          const idx = parseInt(parts[1], 10);
          const targetArray = Array.isArray(payload) ? payload : (payload.items || []);
          if (targetArray[idx]) targetArray[idx].image = url;
        } else if (fieldname === 'video1') {
          payload.videoUrl1 = url;
        } else if (fieldname === 'video2') {
          payload.videoUrl2 = url;
        }
      });
    }

    const updated = await prisma.websiteConfig.upsert({
      where: { key: section },
      update: { value: payload },
      create: { key: section, value: payload },
    });

    res.json({ success: true, message: `Section ${section} updated successfully`, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin endpoint to update destination inside page CMS details (Cover + Attractions)
 */
const updateDestinationCmsPage = async (req, res, next) => {
  const { destinationId } = req.params;
  try {
    let payload = {};
    if (req.body.data) {
      try {
        payload = JSON.parse(req.body.data);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid JSON payload in "data" field' });
      }
    } else {
      payload = req.body;
    }

    // Initialize pageContent structure if not present
    if (!payload.pageContent) {
      payload.pageContent = { heroImage: '', attractions: [] };
    }

    // Process file uploads (Cover image and Attraction photos)
    if (req.files) {
      const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat().filter(Boolean);
      const uploadPromises = filesArray.map(async (file) => {
        const uploadedUrl = await r2Service.uploadAsset(file, 'destinations');
        return { fieldname: file.fieldname, url: uploadedUrl };
      });
      const uploadedResults = await Promise.all(uploadPromises);
      uploadedResults.forEach(({ fieldname, url }) => {
        if (fieldname === 'coverImage') {
          payload.pageContent.heroImage = url;
        } else if (fieldname.startsWith('attraction_')) {
          const idx = parseInt(fieldname.replace('attraction_', ''), 10);
          if (payload.pageContent.attractions && payload.pageContent.attractions[idx]) {
            payload.pageContent.attractions[idx].image = url;
          }
        }
      });
    }

    // Separate DestinationCMS fields from payload
    const { aboutHtml, heroImage, galleryImages, seoTitle, seoDesc, isPublished, pageContent } = payload;

    const data = {
      aboutHtml: aboutHtml || undefined,
      heroImage: heroImage || pageContent?.heroImage || undefined,
      galleryImages: galleryImages ? (typeof galleryImages === 'string' ? JSON.parse(galleryImages) : galleryImages) : undefined,
      seoTitle: seoTitle || undefined,
      seoDesc: seoDesc || undefined,
      isPublished: isPublished === 'true' || isPublished === true,
      pageContent: pageContent || undefined,
    };

    const updated = await prisma.destinationCms.upsert({
      where: { destinationId },
      update: data,
      create: { destinationId, ...data },
    });

    res.json({ success: true, message: 'Destination page updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle individual file uploads for Journeys, map image and gallery
 */
const uploadJourneyFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    const section = req.query.section || 'journeys';
    const fileUrl = await r2Service.uploadAsset(req.file, section);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a file from Cloudflare R2 by its public URL.
 * Body: { url: string }
 */
const deleteAssetFromR2 = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });
    await r2Service.deleteAsset(url);
    res.json({ success: true, message: 'Asset deleted from R2' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWebsiteConfig,
  updateWebsiteSection,
  updateDestinationCmsPage,
  uploadJourneyFile,
  deleteAssetFromR2,
};
