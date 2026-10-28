// ============================================================
// TravelCRM — Tour Dispatch Controller
// Handles Hotel + Driver assignment per day, guest credentials
// ============================================================

const prisma = require('../config/prisma');
const { NotFoundError, BusinessError } = require('../utils/AppError');
const bcrypt = require('bcryptjs');

// ─── Helper: load tour with day-wise data ────────────────────
const loadTour = async (id) => {
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      query: { select: { id: true, name: true, phone: true, email: true } },
      tourDrivers: { include: { driver: true }, orderBy: { dayNumber: 'asc' } },
      bookingServices: {
        where: { serviceType: 'hotel' },
        orderBy: { dayNumber: 'asc' },
      },
      proposal: {
        include: {
          itinerary: {
            include: {
              days: {
                orderBy: { dayNumber: 'asc' },
                include: { events: { where: { type: 'accommodation' } } }
              }
            }
          }
        }
      }
    }
  });
  if (!tour || tour.deletedAt) throw new NotFoundError('Tour');
  return tour;
};

// ─── GET /tours/:id/dispatch ──────────────────────────────────
const getDispatch = async (req, res, next) => {
  try {
    const tour = await loadTour(req.params.id);

    // Build day-indexed map
    const totalDays = tour.proposal?.itinerary?.days?.length
      ?? Math.ceil((new Date(tour.endDate) - new Date(tour.startDate)) / 86400000) + 1;

    // Pre-calculate proposed hotels from itinerary & proposal days
    let lastProposedHotel = null;
    const proposedHotels = {};

    for (let i = 0; i < totalDays; i++) {
      const dayNum = i + 1;
      const itinDay = tour.proposal?.itinerary?.days?.[i];
      const proposedDay = tour.proposal?.days?.find(d => d.dayNumber === dayNum);

      const directHotel = proposedDay?.hotel?.name 
        || itinDay?.events?.find(e => e.type === 'accommodation')?.title
        || null;

      if (directHotel) lastProposedHotel = directHotel;

      const isDepartureDay = (i === totalDays - 1) && 
        (itinDay?.title?.toLowerCase().includes('drop') || itinDay?.title?.toLowerCase().includes('departure'));

      proposedHotels[dayNum] = isDepartureDay ? null : (directHotel || lastProposedHotel);
    }

    const days = Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const date = new Date(tour.startDate);
      date.setDate(date.getDate() + i);

      const driver = tour.tourDrivers.find(d => d.dayNumber === dayNum);
      const hotel = tour.bookingServices.find(b => b.dayNumber === dayNum);
      const itinDay = tour.proposal?.itinerary?.days?.[i];

      return {
        dayNumber: dayNum,
        date: date.toISOString().split('T')[0],
        itineraryTitle: itinDay?.title || `Day ${dayNum}`,
        driver: driver ? { 
          id: driver.driverId, 
          name: driver.driver.name, 
          phone: driver.driver.phone,
          vehicleName: driver.driver.vehicleName, 
          vehicleNo: driver.driver.vehicleNo 
        } : null,
        hotel: hotel ? { id: hotel.id, name: hotel.serviceName, checkIn: hotel.checkIn, checkOut: hotel.checkOut } : null,
        proposedHotel: proposedHotels[dayNum] || null,
      };
    });

    res.json({
      success: true,
      data: {
        tourId: tour.id,
        tourCode: tour.tourCode,
        guestName: tour.query?.name,
        guestPhone: tour.query?.phone,
        guestEmail: tour.query?.email,
        guestUsername: tour.guestUsername,
        guestPin: tour.guestPassword,
        guestCredentialsGenerated: !!tour.guestUsername,
        status: tour.status,
        startDate: tour.startDate,
        endDate: tour.endDate,
        days,
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /tours/:id/dispatch/driver ─────────────────────────
// Body: { driverId, days: [1,2,3] }  OR  { driverId, allDays: true }
const assignDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { driverId, days, allDays } = req.body;

    const tour = await loadTour(id);
    const totalDays = tour.proposal?.itinerary?.days?.length
      ?? Math.ceil((new Date(tour.endDate) - new Date(tour.startDate)) / 86400000) + 1;

    const targetDays = allDays
      ? Array.from({ length: totalDays }, (_, i) => i + 1)
      : (days || []);

    if (!targetDays.length) throw new BusinessError('Provide days array or allDays:true');

    // Support Unassigning / Removing Driver
    if (!driverId || driverId === 'unassigned' || driverId === 'none' || driverId === 'remove') {
      await prisma.tourDriver.deleteMany({
        where: {
          tourId: id,
          dayNumber: { in: targetDays }
        }
      });
      return res.json({ success: true, message: `Driver removed from ${targetDays.length} day(s)` });
    }

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver || driver.deletedAt) throw new NotFoundError('Driver');

    // Upsert TourDriver for each day
    await prisma.$transaction(
      targetDays.map(dayNumber =>
        prisma.tourDriver.upsert({
          where: { tourId_dayNumber: { tourId: id, dayNumber } },
          create: { tourId: id, driverId, dayNumber },
          update: { driverId },
        })
      )
    );

    res.json({ success: true, message: `Driver assigned to ${targetDays.length} day(s)` });
  } catch (error) {
    next(error);
  }
};

// ─── POST /tours/:id/dispatch/hotel ──────────────────────────
// Body: { dayNumber, hotelName, checkIn, checkOut }
const assignHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dayNumber, hotelName, checkIn, checkOut } = req.body;

    if (!dayNumber) throw new BusinessError('dayNumber is required');

    const tour = await loadTour(id);

    // Support Clearing / Removing Hotel
    if (!hotelName || hotelName.trim() === '' || hotelName === 'clear' || hotelName === 'none') {
      await prisma.bookingService.deleteMany({
        where: {
          tourId: id,
          dayNumber: Number(dayNumber),
          serviceType: 'hotel'
        }
      });
      return res.json({ success: true, message: `Hotel removed for Day ${dayNumber}` });
    }

    // Find existing hotel BookingService for this day, or create one
    const existing = tour.bookingServices.find(b => b.dayNumber === Number(dayNumber));

    if (existing) {
      await prisma.bookingService.update({
        where: { id: existing.id },
        data: {
          serviceName: hotelName.trim(),
          ...(checkIn && { checkIn: new Date(checkIn) }),
          ...(checkOut && { checkOut: new Date(checkOut) }),
        }
      });
    } else {
      await prisma.bookingService.create({
        data: {
          queryId: tour.queryId,
          tourId: id,
          serviceType: 'hotel',
          serviceName: hotelName.trim(),
          dayNumber: Number(dayNumber),
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          totalCost: 0,
          units: tour.totalPax || 1,
          createdBy: req.user.id,
          mailStatus: 'not_sent',
          paymentStatus: 'pending',
        }
      });
    }

    res.json({ success: true, message: `Hotel assigned for Day ${dayNumber}` });
  } catch (error) {
    next(error);
  }
};

// ─── POST /tours/:id/guest-credentials ───────────────────────
// Auto-generates a username + 6-digit PIN for the guest portal
const generateGuestCredentials = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tour = await prisma.tour.findUnique({ where: { id }, include: { query: true } });
    if (!tour) throw new NotFoundError('Tour');

    // Idempotent: return existing if already generated (unless force: true is passed)
    if (tour.guestUsername && !req.body.force) {
      return res.json({
        success: true,
        data: { username: tour.guestUsername, pin: tour.guestPassword, note: 'Credentials already generated' }
      });
    }

    // Generate username from customer name + tourCode
    const namePart = (tour.query?.name || 'guest').toLowerCase().replace(/\s+/g, '').slice(0, 8);
    const username = `${namePart}@${tour.tourCode.toLowerCase()}`;

    // Generate a 6-digit numeric PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.tour.update({
      where: { id },
      data: { guestUsername: username, guestPassword: pin },
    });

    // Return the plain PIN
    res.json({
      success: true,
      data: {
        username,
        pin, // Show plain PIN to Ops agent
        guestLink: `https://guest.${process.env.APP_DOMAIN || 'travelcrm.app'}/${tour.tourCode}`,
      }
    });
  } catch (error) {
    next(error);
  }
};

const sendGuestCredentialsEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      throw new BusinessError('Recipient email, subject, and body are required');
    }

    const { sendMail } = require('../config/mailer');
    await sendMail({
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    });

    res.json({ success: true, message: 'Email sent successfully via system mailer' });
  } catch (error) {
    next(error);
  }
};

// ─── POST /tours/:id/dispatch/auto-hotels ────────────────────
// Auto-populates all days' hotels from client's itinerary
const autoFillHotelsFromItinerary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tour = await loadTour(id);
    const totalDays = tour.proposal?.itinerary?.days?.length
      ?? Math.ceil((new Date(tour.endDate) - new Date(tour.startDate)) / 86400000) + 1;

    let lastProposedHotel = null;
    const hotelAssignments = [];

    for (let i = 0; i < totalDays; i++) {
      const dayNum = i + 1;
      const itinDay = tour.proposal?.itinerary?.days?.[i];
      const proposedDay = tour.proposal?.days?.find(d => d.dayNumber === dayNum);

      const directHotel = proposedDay?.hotel?.name 
        || itinDay?.events?.find(e => e.type === 'accommodation')?.title
        || null;

      if (directHotel) lastProposedHotel = directHotel;

      const isDepartureDay = (i === totalDays - 1) && 
        (itinDay?.title?.toLowerCase().includes('drop') || itinDay?.title?.toLowerCase().includes('departure'));

      const hotelName = isDepartureDay ? null : (directHotel || lastProposedHotel);

      if (hotelName) {
        hotelAssignments.push({ dayNumber: dayNum, hotelName });
      }
    }

    if (!hotelAssignments.length) {
      throw new BusinessError('No proposed accommodation found in this client’s itinerary');
    }

    for (const { dayNumber, hotelName } of hotelAssignments) {
      const existing = tour.bookingServices.find(b => b.dayNumber === dayNumber && b.serviceType === 'hotel');
      if (existing) {
        await prisma.bookingService.update({
          where: { id: existing.id },
          data: { serviceName: hotelName }
        });
      } else {
        await prisma.bookingService.create({
          data: {
            queryId: tour.queryId,
            tourId: id,
            serviceType: 'hotel',
            serviceName: hotelName,
            dayNumber,
            totalCost: 0,
            units: tour.totalPax || 1,
            createdBy: req.user.id,
            mailStatus: 'not_sent',
            paymentStatus: 'pending',
          }
        });
      }
    }

    res.json({ 
      success: true, 
      message: `Successfully populated hotels for ${hotelAssignments.length} days from itinerary.` 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getDispatch, 
  assignDriver, 
  assignHotel, 
  generateGuestCredentials, 
  sendGuestCredentialsEmail,
  autoFillHotelsFromItinerary 
};
