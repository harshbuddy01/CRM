// ============================================================
// TravelCRM — Itinerary Service
// Full CRUD, day/event management, image upload, share & export
// ============================================================

const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const { nanoid } = require('nanoid');
const { NotFoundError, ValidationError } = require('../utils/AppError');
const { syncToMeili, removeFromMeili } = require('../utils/meilisearch');


// ── Helpers ──────────────────────────────────────────────────

const VALID_EVENT_TYPES = [
  'accommodation', 'sightseeing', 'activity', 'transport',
  'flight', 'meal', 'checkin', 'checkout', 'freeTime',
];

const fullInclude = {
  creator: { select: { id: true, name: true } },
  days: {
    orderBy: { dayNumber: 'asc' },
    include: {
      destination: { select: { id: true, name: true } },
      events: { orderBy: { sortOrder: 'asc' } },
    },
  },
  galleryImages: { orderBy: { sortOrder: 'asc' } },
  proposals: {
    where: { deletedAt: null },
    orderBy: { version: 'desc' },
    take: 1,
    select: {
      id: true,
      version: true,
      query: { select: { id: true, queryCode: true, name: true, travelDateFrom: true, travelDateTo: true, destination: true } },
    },
  },
};

const formatItinerary = (itinerary) => {
  if (!itinerary) return null;
  return {
    ...itinerary,
    gallery: itinerary.galleryImages || []
  };
};

const sanitizePublicId = (filename) => {
  if (!filename) return undefined;
  const name = String(filename).replace(/\.[^.]+$/, '');
  const sanitized = name.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').substring(0, 100);
  return sanitized || `upload-${Date.now()}`;
};

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 */
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `travelcrm/itineraries/${folder}`,
        resource_type: 'auto',
        public_id: sanitizePublicId(file.originalname),
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
};

// ── Core CRUD ────────────────────────────────────────────────

const create = async (userId, data) => {
  const { title, description, days } = data;
  if (!title) throw new ValidationError('Title is required');

  const itinerary = await prisma.itinerary.create({
    data: {
      title,
      description: description || null,
      nights: data.nights !== undefined ? Number(data.nights) : null,
      travelDateFrom: data.travelDateFrom ? new Date(data.travelDateFrom) : null,
      travelDateTo: data.travelDateTo ? new Date(data.travelDateTo) : null,
      createdBy: userId,
      days: days && days.length
        ? {
            create: days.map((day, idx) => ({
              dayNumber: idx + 1,
              title: day.title || null,
              destinationId: day.destinationId || null,
              events: day.events && day.events.length
                ? {
                    create: day.events.map((ev, eidx) => ({
                      type: ev.type && VALID_EVENT_TYPES.includes(ev.type) ? ev.type : 'sightseeing',
                      title: ev.title || 'Untitled Event',
                      description: ev.description || null,
                      startTime: ev.startTime || null,
                      endTime: ev.endTime || null,
                      cost: ev.cost !== null && ev.cost !== undefined ? Number(ev.cost) : null,
                      metadata: ev.metadata || null,
                      sortOrder: eidx,
                    })),
                  }
                : undefined,
            })),
          }
        : undefined,
    },
    include: fullInclude,
  });

  // MeiliSync
  syncToMeili('itineraries', [{
    id: itinerary.id,
    title: itinerary.title,
    description: itinerary.description,
    image: itinerary.coverPhotoUrl,
    totalDays: itinerary.days.length,
    sellingPrice: Number(itinerary.sellingPrice || itinerary.totalCost || 0),
    destinations: [...new Set(itinerary.days.map(d => d.destination?.name).filter(Boolean))],
    createdAt: itinerary.createdAt
  }]);

  return formatItinerary(itinerary);

};

const list = async (options = {}) => {
  const { status, search, page = 1, limit = 50, isTemplate } = options;
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  const skip = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);
  const take = Math.min(100, Math.max(1, isNaN(parsedLimit) ? 50 : parsedLimit));
  const where = { deletedAt: null };

  if (status) where.status = status;
  if (isTemplate !== undefined) {
    where.isTemplate = isTemplate === 'true' || isTemplate === true;
  }
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const [items, total] = await Promise.all([
    prisma.itinerary.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (skip - 1) * take,
      take: take,
      include: {
        creator: { select: { id: true, name: true } },
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            destination: { select: { id: true, name: true } },
          },
        },
        _count: { select: { days: true, galleryImages: true } },
        proposals: {
          where: { deletedAt: null },
          orderBy: { version: 'desc' },
          take: 1,
          select: {
            id: true,
            version: true,
            status: true,
            query: { select: { id: true, queryCode: true, name: true } },
          },
        },
      },
    }),
    prisma.itinerary.count({ where }),
  ]);

  return { items, total };
};

const getById = async (id) => {
  const itinerary = await prisma.itinerary.findUnique({
    where: { id },
    include: fullInclude,
  });
  if (!itinerary || itinerary.deletedAt) {
    throw new NotFoundError('Itinerary not found');
  }

  return formatItinerary(itinerary);
};

const update = async (id, data) => {
  await getById(id); // ensure exists
  const {
    title, description, status, totalCost, perPersonCost,
    currency, adults, children, nights, markupPct, 
    inclusionsHtml, exclusionsHtml, paymentPolicyHtml, cancellationPolicyHtml, termsHtml,
    costingBreakdown, sellingPrice, travelDateFrom, travelDateTo,
    coverPhotoUrl
  } = data;

  if (status !== undefined && !['draft', 'published'].includes(status)) {
    throw new ValidationError('Invalid status');
  }

  const validateNum = (val) => {
    const num = Number(val);
    if (!Number.isFinite(num)) throw new ValidationError(`Invalid number provided`);
    return num;
  };

  const updated = await prisma.itinerary.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(coverPhotoUrl !== undefined && { coverPhotoUrl }),
      ...(travelDateFrom !== undefined && { travelDateFrom: travelDateFrom ? new Date(travelDateFrom) : null }),
      ...(travelDateTo !== undefined && { travelDateTo: travelDateTo ? new Date(travelDateTo) : null }),
      ...(totalCost !== undefined && { totalCost: validateNum(totalCost) }),
      ...(perPersonCost !== undefined && { perPersonCost: validateNum(perPersonCost) }),
      ...(currency !== undefined && { currency }),
      ...(adults !== undefined && { adults: validateNum(adults) }),
      ...(children !== undefined && { children: validateNum(children) }),
      ...(nights !== undefined && { nights: nights !== null ? validateNum(nights) : null }),
      ...(markupPct !== undefined && { markupPct: validateNum(markupPct) }),
      ...(inclusionsHtml !== undefined && { inclusionsHtml }),
      ...(exclusionsHtml !== undefined && { exclusionsHtml }),
      ...(paymentPolicyHtml !== undefined && { paymentPolicyHtml }),
      ...(cancellationPolicyHtml !== undefined && { cancellationPolicyHtml }),
      ...(termsHtml !== undefined && { termsHtml }),
      ...(costingBreakdown !== undefined && { costingBreakdown: costingBreakdown !== null ? costingBreakdown : null }),
      ...(sellingPrice !== undefined && { sellingPrice: validateNum(sellingPrice) }),
    },
    include: fullInclude,
  });

  // Automatically sync selling price to all proposals linked to this itinerary.
  if (sellingPrice !== undefined) {
    await prisma.proposal.updateMany({
      where: { itineraryId: id, deletedAt: null },
      data: { sellingPrice: validateNum(sellingPrice), totalCost: totalCost !== undefined ? validateNum(totalCost) : updated.totalCost }
    });

    // Auto-sync with Finance/Billing module if the linked proposal is confirmed
    const linkedProposals = await prisma.proposal.findMany({
      where: { itineraryId: id, deletedAt: null, status: 'confirmed' },
      select: { queryId: true }
    });
    
    for (const prop of linkedProposals) {
      if (!prop.queryId) continue;
      // Find active invoices tied to this query
      const invoices = await prisma.invoice.findMany({
        where: { queryId: prop.queryId, deletedAt: null }
      });
      
      if (invoices.length > 0) {
        const financeService = require('./finance.service');
        for (const inv of invoices) {
          try {
            await financeService.regenerateInvoice(inv.id);
          } catch (err) {
            console.error('Auto-sync Invoice Error:', err.message);
          }
        }
      }
    }
  }

  // MeiliSync
  syncToMeili('itineraries', [{
    id: updated.id,
    title: updated.title,
    description: updated.description,
    image: updated.coverPhotoUrl,
    totalDays: updated.days.length,
    sellingPrice: Number(updated.sellingPrice || updated.totalCost || 0),
    destinations: [...new Set(updated.days.map(d => d.destination?.name).filter(Boolean))],
    createdAt: updated.createdAt
  }]);

  return formatItinerary(updated);

};

const remove = async (id) => {
  await getById(id);
  const result = await prisma.itinerary.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  // MeiliSync (Remove from search index)
  removeFromMeili('itineraries', id);

  return result;

};

const duplicate = async (id, userId) => {
  const source = await getById(id);

  const newItinerary = await prisma.itinerary.create({
    data: {
      title: source.title,
      description: source.description,
      coverPhotoUrl: source.coverPhotoUrl,
      status: 'draft',
      isTemplate: false,
      sourceTemplateId: source.isTemplate ? source.id : source.sourceTemplateId,
      totalCost: source.totalCost,
      perPersonCost: source.perPersonCost,
      sellingPrice: source.sellingPrice,
      costingBreakdown: source.costingBreakdown || undefined,
      currency: source.currency,
      adults: source.adults,
      children: source.children,
      nights: source.nights,
      markupPct: source.markupPct,
      inclusionsHtml: source.inclusionsHtml,
      exclusionsHtml: source.exclusionsHtml,
      paymentPolicyHtml: source.paymentPolicyHtml,
      cancellationPolicyHtml: source.cancellationPolicyHtml,
      termsHtml: source.termsHtml,
      createdBy: userId,
      days: {
        create: source.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          imageUrl: day.imageUrl,
          destinationId: day.destinationId,
          events: {
            create: day.events.map((ev) => ({
              type: ev.type,
              title: ev.title,
              description: ev.description,
              startTime: ev.startTime,
              endTime: ev.endTime,
              cost: ev.cost,
              imageUrl: ev.imageUrl,
              metadata: ev.metadata,
              sortOrder: ev.sortOrder,
            })),
          },
        })),
      },
      galleryImages: {
        create: source.galleryImages.map((img) => ({
          imageUrl: img.imageUrl,
          caption: img.caption,
          sortOrder: img.sortOrder,
        })),
      },
    },
    include: fullInclude,
  });

  return formatItinerary(newItinerary);
};

const publishToTemplates = async (id, userId) => {
  const source = await getById(id);

  const newTemplate = await prisma.itinerary.create({
    data: {
      title: source.title + " (Template)",
      description: source.description,
      coverPhotoUrl: source.coverPhotoUrl,
      status: 'published',
      isTemplate: true,
      totalCost: source.totalCost,
      perPersonCost: source.perPersonCost,
      sellingPrice: source.sellingPrice,
      costingBreakdown: source.costingBreakdown || undefined,
      currency: source.currency,
      adults: source.adults,
      children: source.children,
      nights: source.nights,
      markupPct: source.markupPct,
      inclusionsHtml: source.inclusionsHtml,
      exclusionsHtml: source.exclusionsHtml,
      paymentPolicyHtml: source.paymentPolicyHtml,
      cancellationPolicyHtml: source.cancellationPolicyHtml,
      termsHtml: source.termsHtml,
      createdBy: userId,
      days: {
        create: source.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          imageUrl: day.imageUrl,
          destinationId: day.destinationId,
          events: {
            create: day.events.map((ev) => ({
              type: ev.type,
              title: ev.title,
              description: ev.description,
              startTime: ev.startTime,
              endTime: ev.endTime,
              cost: ev.cost,
              imageUrl: ev.imageUrl,
              metadata: ev.metadata,
              sortOrder: ev.sortOrder,
            })),
          },
        })),
      },
      galleryImages: {
        create: source.galleryImages.map((img) => ({
          imageUrl: img.imageUrl,
          caption: img.caption,
          sortOrder: img.sortOrder,
        })),
      },
    },
    include: fullInclude,
  });

  return formatItinerary(newTemplate);
};


// ── Share Logic ──────────────────────────────────────────────

const generateShareSlug = async (id) => {
  const itinerary = await getById(id);
  const slug = nanoid(12);
  
  // Only set status to 'published' for master templates.
  // Client working copies (isTemplate=false) keep their 'draft' status —
  // their lifecycle is managed by the proposal system (draft → confirmed → completed).
  const updateData = { shareSlug: slug };
  if (itinerary.isTemplate) {
    updateData.status = 'published';
  }
  
  return prisma.itinerary.update({
    where: { id },
    data: updateData,
    include: fullInclude,
  });
};

const formatPublicItinerary = (itinerary) => {
  if (!itinerary) return null;
  
  // Strip internal financial metadata before sending to customer
  const { 
    markupPct, 
    totalCost, 
    sellingPrice, 
    perPersonCost, 
    costingBreakdown, 
    createdBy, 
    creator, 
    ...publicItinerary 
  } = itinerary;

  // Sanitize days and events to remove individual costs
  if (publicItinerary.days) {
    publicItinerary.days = publicItinerary.days.map(day => ({
      ...day,
      events: day.events ? day.events.map(event => {
        // Remove 'cost' field from each event to hide internal pricing from customers
        const { cost, ...safeEvent } = event;
        return safeEvent;
      }) : []
    }));
  }

  // Ensure gallery images are mapped if needed
  publicItinerary.gallery = publicItinerary.galleryImages || [];

  return publicItinerary;
};

const getByShareSlug = async (slug) => {
  const itinerary = await prisma.itinerary.findUnique({
    where: { shareSlug: slug },
    include: fullInclude,
  });
  if (!itinerary || itinerary.deletedAt) {
    throw new NotFoundError('Itinerary not found or link expired');
  }
  return formatPublicItinerary(itinerary);
};

// ── Day Management ───────────────────────────────────────────

const addDay = async (itineraryId, data) => {
  await getById(itineraryId);

  // Auto-calculate next day number
  const maxDay = await prisma.itineraryDay.aggregate({
    where: { itineraryId },
    _max: { dayNumber: true },
  });
  const nextDayNumber = (maxDay._max.dayNumber || 0) + 1;

  return prisma.itineraryDay.create({
    data: {
      itineraryId,
      dayNumber: data.dayNumber || nextDayNumber,
      title: data.title || null,
      description: data.description || null,
      destinationId: data.destinationId || null,
    },
    include: {
      destination: { select: { id: true, name: true } },
      events: { orderBy: { sortOrder: 'asc' } },
    },
  });
};

const updateDay = async (dayId, data) => {
  const { title, description, destinationId, imageUrl } = data;
  return prisma.itineraryDay.update({
    where: { id: dayId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(destinationId !== undefined && { destinationId: destinationId || null }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
    include: {
      destination: { select: { id: true, name: true } },
      events: { orderBy: { sortOrder: 'asc' } },
    },
  });
};

const uploadDayImage = async (dayId, file) => {
  const day = await prisma.itineraryDay.findUnique({ where: { id: dayId } });
  if (!day) throw new NotFoundError('Day not found');

  const result = await uploadToCloudinary(file, `days`);
  return prisma.itineraryDay.update({
    where: { id: dayId },
    data: { imageUrl: result.secure_url },
    include: {
      destination: { select: { id: true, name: true } },
      events: { orderBy: { sortOrder: 'asc' } },
    },
  });
};

const removeDay = async (dayId) => {
  const day = await prisma.itineraryDay.findUnique({ where: { id: dayId } });
  if (!day) throw new NotFoundError('Day not found');

  await prisma.$transaction(async (tx) => {
    await tx.itineraryDay.delete({ where: { id: dayId } });
    const remaining = await tx.itineraryDay.findMany({
      where: { itineraryId: day.itineraryId },
      orderBy: { dayNumber: 'asc' },
    });
    for (let idx = 0; idx < remaining.length; idx++) {
      await tx.itineraryDay.update({
        where: { id: remaining[idx].id },
        data: { dayNumber: idx + 1 },
      });
    }
  });

  return { success: true };
};

// ── Event Management ─────────────────────────────────────────

const addEvent = async (dayId, data) => {
  const day = await prisma.itineraryDay.findUnique({ where: { id: dayId } });
  if (!day) throw new NotFoundError('Day not found');

  if (data.type && !VALID_EVENT_TYPES.includes(data.type)) {
    throw new ValidationError(`Invalid event type: ${data.type}. Allowed: ${VALID_EVENT_TYPES.join(', ')}`);
  }

  // Auto-calculate sort order
  const maxSort = await prisma.itineraryEvent.aggregate({
    where: { dayId },
    _max: { sortOrder: true },
  });
  const nextSort = (maxSort._max.sortOrder || 0) + 1;

  return prisma.itineraryEvent.create({
    data: {
      dayId,
      type: data.type || 'sightseeing',
      title: data.title || 'Untitled Event',
      description: data.description || null,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      cost: data.cost ? Number(data.cost) : null,
      metadata: data.metadata || null,
      sortOrder: data.sortOrder ?? nextSort,
    },
  });
};

const updateEvent = async (eventId, data) => {
  const event = await prisma.itineraryEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event not found');

  if (data.type && !VALID_EVENT_TYPES.includes(data.type)) {
    throw new ValidationError(`Invalid event type: ${data.type}`);
  }

  return prisma.itineraryEvent.update({
    where: { id: eventId },
    data: {
      ...(data.type !== undefined && { type: data.type }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.cost !== undefined && { cost: data.cost !== null && data.cost !== undefined ? Number(data.cost) : null }),
      ...(data.metadata !== undefined && { metadata: data.metadata }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
};

const removeEvent = async (eventId) => {
  const event = await prisma.itineraryEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event not found');
  await prisma.itineraryEvent.delete({ where: { id: eventId } });
  return { success: true };
};

const reorderEvents = async (dayId, eventIds) => {
  if (!Array.isArray(eventIds) || eventIds.length === 0) {
    throw new ValidationError('eventIds must be a non-empty array');
  }

  const existing = await prisma.itineraryEvent.findMany({
    where: { id: { in: eventIds } }
  });

  if (existing.length !== eventIds.length) {
    throw new ValidationError('One or more events not found');
  }
  
  if (existing.some(e => e.dayId !== dayId)) {
    throw new ValidationError('Event ownership verification failed');
  }

  await prisma.$transaction(
    eventIds.map((id, idx) =>
      prisma.itineraryEvent.update({
        where: { id },
        data: { sortOrder: idx },
      })
    )
  );

  return prisma.itineraryEvent.findMany({
    where: { dayId },
    orderBy: { sortOrder: 'asc' },
  });
};

// ── Image Upload ─────────────────────────────────────────────

const uploadCoverPhoto = async (id, file) => {
  await getById(id);
  const result = await uploadToCloudinary(file, `${id}/cover`);
  const itinerary = await prisma.itinerary.update({
    where: { id },
    data: { coverPhotoUrl: result.secure_url },
    include: fullInclude,
  });
  return formatItinerary(itinerary);
};

const uploadEventImage = async (eventId, file) => {
  const event = await prisma.itineraryEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event not found');

  const result = await uploadToCloudinary(file, `events/${eventId}`);
  return prisma.itineraryEvent.update({
    where: { id: eventId },
    data: { imageUrl: result.secure_url },
  });
};

const addGalleryImages = async (id, files) => {
  await getById(id);

  const maxSort = await prisma.itineraryGalleryImage.aggregate({
    where: { itineraryId: id },
    _max: { sortOrder: true },
  });
  let nextSort = (maxSort._max.sortOrder || 0) + 1;

  const uploadResults = [];
  for (const file of files) {
    const result = await uploadToCloudinary(file, `${id}/gallery`);
    const image = await prisma.itineraryGalleryImage.create({
      data: {
        itineraryId: id,
        imageUrl: result.secure_url,
        caption: null,
        sortOrder: nextSort++,
      },
    });
    uploadResults.push(image);
  }

  return uploadResults;
};

const addGalleryImagesByUrl = async (id, imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) {
    return [];
  }

  // Ensure all elements are strings
  const validUrls = imageUrls.filter(url => typeof url === 'string' && url.length > 0);
  if (validUrls.length === 0) return [];

  await getById(id);

  const maxSort = await prisma.itineraryGalleryImage.aggregate({
    where: { itineraryId: id },
    _max: { sortOrder: true },
  });
  let nextSort = (maxSort._max.sortOrder || 0) + 1;

  const results = [];
  for (const url of validUrls) {
    const image = await prisma.itineraryGalleryImage.create({
      data: {
        itineraryId: id,
        imageUrl: url,
        caption: null,
        sortOrder: nextSort++,
      },
    });
    results.push(image);
  }
  return results;
};

const removeGalleryImage = async (imageId) => {
  const image = await prisma.itineraryGalleryImage.findUnique({ where: { id: imageId } });
  if (!image) throw new NotFoundError('Gallery image not found');
  await prisma.itineraryGalleryImage.delete({ where: { id: imageId } });
  return { success: true };
};

// ── Export ────────────────────────────────────────────────────

const getExportData = async (id) => {
  return getById(id);
};

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  duplicate,
  publishToTemplates,
  generateShareSlug,
  getByShareSlug,
  addDay,
  updateDay,
  uploadDayImage,
  removeDay,
  addEvent,
  updateEvent,
  removeEvent,
  reorderEvents,
  uploadCoverPhoto,
  uploadEventImage,
  addGalleryImages,
  addGalleryImagesByUrl,
  removeGalleryImage,
  getExportData,
};
