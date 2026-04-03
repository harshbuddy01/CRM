// ============================================================
// TravelCRM — Itinerary Service
// Full CRUD, day/event management, image upload, share & export
// ============================================================

const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const { nanoid } = require('nanoid');
const { NotFoundError, ValidationError } = require('../utils/AppError');

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

  return prisma.itinerary.create({
    data: {
      title,
      description: description || null,
      nights: data.nights !== undefined ? Number(data.nights) : null,
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
  return formatItinerary(itinerary);
};

const list = async (filters = {}) => {
  const { search, status } = filters;
  const parsedPage = parseInt(filters.page, 10);
  const parsedLimit = parseInt(filters.limit, 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);
  const limit = Math.min(100, Math.max(1, isNaN(parsedLimit) ? 50 : parsedLimit));
  const where = { deletedAt: null };

  if (status) where.status = status;
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const [items, total] = await Promise.all([
    prisma.itinerary.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        creator: { select: { id: true, name: true } },
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            destination: { select: { id: true, name: true } },
          },
        },
        _count: { select: { days: true, galleryImages: true } },
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
    costingBreakdown, sellingPrice
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

  // Automatically sync selling price to all pending/active proposals linked to this itinerary.
  if (sellingPrice !== undefined) {
    await prisma.proposal.updateMany({
      where: { itineraryId: id, status: 'pending', deletedAt: null },
      data: { sellingPrice: validateNum(sellingPrice), totalCost: totalCost !== undefined ? validateNum(totalCost) : updated.totalCost }
    });
  }

  return formatItinerary(updated);
};

const remove = async (id) => {
  await getById(id);
  return prisma.itinerary.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

const duplicate = async (id, userId) => {
  const source = await getById(id);

  return prisma.itinerary.create({
    data: {
      title: `${source.title} (Copy)`,
      description: source.description,
      coverPhotoUrl: source.coverPhotoUrl,
      status: 'draft',
      totalCost: source.totalCost,
      perPersonCost: source.perPersonCost,
      currency: source.currency,
      adults: source.adults,
      children: source.children,
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

// ── Share Logic ──────────────────────────────────────────────

const generateShareSlug = async (id) => {
  await getById(id);
  const slug = nanoid(12);
  return prisma.itinerary.update({
    where: { id },
    data: { shareSlug: slug, status: 'published' },
    include: fullInclude,
  });
};

const formatPublicItinerary = (itinerary) => {
  if (!itinerary) return null;
  
  // Strip internal financial metadata before sending to customer
  const { markupPct, ...publicItinerary } = itinerary;

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
