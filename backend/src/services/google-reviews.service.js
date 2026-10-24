const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const IMAGICA_PLACE_ID = 'ChIJ3UbvD4Kb-DkRFvv1VdWmFm4';
const DEFAULT_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyAb7PWktk-ExGldWC0bgQ-zf7dvxR149Is';

/**
 * Sync Google Reviews using Google Places API (New):
 * Fetches the real customer reviews from Google Maps for Imagica Holidays
 * and upserts them into the database.
 */
async function syncGoogleReviews(options = {}) {
  const apiKey = options.apiKey || process.env.GOOGLE_PLACES_API_KEY || DEFAULT_API_KEY;
  const placeId = options.placeId || process.env.GOOGLE_PLACE_ID || IMAGICA_PLACE_ID;

  let liveFetched = [];
  let apiSuccess = false;
  let errorMsg = null;
  let placeInfo = { name: 'IMAGICA HOLIDAYS', rating: 4.8, totalReviews: 16 };

  if (apiKey) {
    // 1. Try Google Places API (New) first (preferred and active on the project)
    try {
      const newUrl = `https://places.googleapis.com/v1/places/${placeId}?languageCode=en&key=${apiKey}`;
      const newRes = await fetch(newUrl, {
        headers: { 'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews' }
      });
      if (newRes.ok) {
        const newJson = await newRes.json();
        if (newJson.rating) placeInfo.rating = newJson.rating;
        if (newJson.userRatingCount) placeInfo.totalReviews = newJson.userRatingCount;
        if (newJson.displayName?.text) placeInfo.name = newJson.displayName.text;

        if (newJson.reviews?.length) {
          liveFetched = newJson.reviews.map(r => ({
            customerName: r.authorAttribution?.displayName || 'Google Reviewer',
            rating: r.rating || 5,
            text: r.text?.text || r.originalText?.text || '',
            destination: r.relativePublishTimeDescription || 'Google Maps Verified Review',
            photoUrl: r.authorAttribution?.photoUri || null,
            googleUrl: r.authorAttribution?.uri || r.googleMapsUri || 'https://maps.app.goo.gl/nYMH3mYr92GBcfCTA'
          }));
          apiSuccess = true;
        }
      } else {
        const errJson = await newRes.json().catch(() => ({}));
        errorMsg = errJson.error?.message || `Places API HTTP ${newRes.status}`;
      }
    } catch (e) {
      errorMsg = e.message;
    }

    // 2. Fallback to Legacy Places Details API if needed
    if (!apiSuccess) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,photos&language=en&reviews_sort=newest&key=${apiKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'OK' && json.result?.reviews?.length) {
            if (json.result.rating) placeInfo.rating = json.result.rating;
            if (json.result.user_ratings_total) placeInfo.totalReviews = json.result.user_ratings_total;
            liveFetched = json.result.reviews.map(r => ({
              customerName: r.author_name,
              rating: r.rating || 5,
              text: r.text || '',
              destination: r.relative_time_description || 'Google Maps Verified Review',
              photoUrl: r.profile_photo_url || null,
              googleUrl: r.author_url || 'https://maps.app.goo.gl/nYMH3mYr92GBcfCTA'
            }));
            apiSuccess = true;
          }
        }
      } catch (e) {
        if (!errorMsg) errorMsg = e.message;
      }
    }
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of liveFetched) {
    if (!item.customerName || !item.text) continue;

    const existing = await prisma.testimonial.findFirst({
      where: {
        OR: [
          { customerName: item.customerName },
          { text: item.text }
        ]
      }
    });

    if (existing) {
      await prisma.testimonial.update({
        where: { id: existing.id },
        data: {
          customerName: item.customerName,
          rating: item.rating,
          text: item.text,
          photoUrl: item.photoUrl || existing.photoUrl,
          destination: item.destination || existing.destination,
          isActive: true
        }
      });
      updatedCount++;
    } else {
      await prisma.testimonial.create({
        data: {
          customerName: item.customerName,
          rating: item.rating,
          text: item.text,
          photoUrl: item.photoUrl,
          destination: item.destination,
          isActive: true
        }
      });
      createdCount++;
    }
  }

  const allTestimonials = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { customerName: 'asc' }
  });

  return {
    success: true,
    source: apiSuccess ? 'google_places_new_api' : 'fallback',
    apiSuccess,
    apiError: errorMsg,
    place: placeInfo,
    syncedCount: createdCount + updatedCount,
    createdCount,
    updatedCount,
    totalInDatabase: allTestimonials.length,
    reviews: allTestimonials
  };
}

/**
 * Returns formatted Google reviews for website integration
 */
async function getPublicGoogleReviews() {
  const syncResult = await syncGoogleReviews();
  const list = syncResult.reviews || [];

  const reviews = list.map(t => ({
    author: t.customerName,
    avatar: t.photoUrl || '',
    rating: t.rating || 5,
    text: t.text,
    relativeTime: t.destination || 'Verified Review',
    googleUrl: 'https://maps.app.goo.gl/nYMH3mYr92GBcfCTA',
    tag: t.destination,
    isGoogle: true
  }));

  return {
    success: true,
    place: syncResult.place || {
      name: 'IMAGICA HOLIDAYS',
      rating: 4.8,
      totalReviews: 16
    },
    reviews
  };
}

module.exports = {
  syncGoogleReviews,
  getPublicGoogleReviews,
  IMAGICA_PLACE_ID
};
