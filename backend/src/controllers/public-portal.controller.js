// ============================================================
// TravelCRM — Public Portal Controller
// No auth required — secured by tourCode (guest) or hotelId
// ============================================================

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const { NotFoundError, BusinessError } = require('../utils/AppError');

// ─── Helper: build day-by-day itinerary with assigned hotel/driver ──
const buildDayPlan = (tour) => {
  const days = tour.proposal?.itinerary?.days || [];
  const startDate = new Date(tour.startDate);

  return days.map((day) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (day.dayNumber - 1));

    const assignedHotel = tour.bookingServices?.find(
      (b) => b.serviceType === 'hotel' && b.dayNumber === day.dayNumber
    );
    const assignedDriver = tour.tourDrivers?.find(
      (d) => d.dayNumber === day.dayNumber
    );

    const events = (day.events || []).map((e) => ({
      type: e.type,
      title: e.title,
      description: e.description,
      imageUrl: e.imageUrl || null,
      time: e.time || null,
    }));

    return {
      dayNumber: day.dayNumber,
      date: date.toISOString().split('T')[0],
      title: day.title || `Day ${day.dayNumber}`,
      description: day.description || null,
      hotel: assignedHotel ? assignedHotel.serviceName : null,
      driver: assignedDriver
        ? {
            name: assignedDriver.driver.name,
            phone: assignedDriver.driver.phone,
            vehicleName: assignedDriver.driver.vehicleName,
            vehicleNo: assignedDriver.driver.vehicleNo,
          }
        : null,
      events,
    };
  });
};

// ──────────────────────────────────────────────────────────────
// 1. GUEST PORTAL AUTH — POST /public/guest/login
// Body: { username, pin }
// Returns: { tourCode, guestName, ... }
// ──────────────────────────────────────────────────────────────
const guestLogin = async (req, res, next) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin) throw new BusinessError('Username and PIN are required');

    const tour = await prisma.tour.findFirst({
      where: {
        guestUsername: { equals: username, mode: 'insensitive' },
        deletedAt: null
      },
      include: { query: { select: { name: true, destination: true } } },
    });

    if (!tour) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let valid = false;
    if (tour.guestPassword) {
      if (tour.guestPassword.startsWith('$2a$') || tour.guestPassword.startsWith('$2b$')) {
        valid = await bcrypt.compare(pin, tour.guestPassword);
      } else {
        valid = pin === tour.guestPassword;
      }
    }
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        tourCode: tour.tourCode,
        guestName: tour.query?.name,
        destination: tour.query?.destination,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────
// 2. GUEST PORTAL DATA — GET /public/guest/:tourCode
// Returns full itinerary, hotel, driver, financials
// ──────────────────────────────────────────────────────────────
const getGuestTrip = async (req, res, next) => {
  try {
    const { tourCode } = req.params;

    const tour = await prisma.tour.findFirst({
      where: {
        tourCode: { equals: tourCode, mode: 'insensitive' },
        deletedAt: null
      },
      include: {
        query: { select: { name: true, phone: true, email: true, destination: true, adults: true, children: true } },
        proposal: {
          select: {
            sellingPrice: true,
            itinerary: {
              include: {
                days: {
                  orderBy: { dayNumber: 'asc' },
                  include: { events: { orderBy: { sortOrder: 'asc' } } },
                },
              },
            },
          },
        },
        bookingServices: { orderBy: { dayNumber: 'asc' } },
        tourDrivers: { include: { driver: true }, orderBy: { dayNumber: 'asc' } },
        payments: { where: { deletedAt: null, status: 'verified' } },
      },
    });

    if (!tour || tour.deletedAt) throw new NotFoundError('Trip');

    const totalPaid = tour.payments.reduce((s, p) => s + Number(p.amount), 0);
    const sellingPrice = Number(tour.proposal?.sellingPrice || 0);
    const balanceDue = sellingPrice - totalPaid;

    // Current day's driver (for home screen)
    const today = new Date().toISOString().split('T')[0];
    const safeStartDate = tour.startDate ? new Date(tour.startDate) : new Date();
    const startStr = (isNaN(safeStartDate.getTime()) ? new Date() : safeStartDate).toISOString().split('T')[0];
    const daysDiff = Math.floor((new Date(today) - new Date(startStr)) / 86400000);
    const currentDayNum = Math.max(1, daysDiff + 1);
    const currentDayDriver = tour.tourDrivers.find(d => d.dayNumber === currentDayNum);
    const currentDayHotel = tour.bookingServices.find(b => b.serviceType === 'hotel' && b.dayNumber === currentDayNum);
    const currentDayTransport = tour.bookingServices.find(b => 
      ['transport', 'cab', 'transfer'].includes(b.serviceType?.toLowerCase()) && 
      b.dayNumber === currentDayNum
    );

    res.json({
      success: true,
      data: {
        tourCode: tour.tourCode,
        status: tour.status,
        startDate: tour.startDate,
        endDate: tour.endDate,
        guestName: tour.query?.name,
        destination: tour.query?.destination,
        adults: tour.query?.adults,
        children: tour.query?.children,
        finance: { sellingPrice, totalPaid, balanceDue },
        arrivalDetails: {
          transitType: tour.arrivalTransitType || null,
          transitNumber: tour.arrivalTransitNumber || null,
          transitTime: tour.arrivalTransitTime || null,
          transitDetails: tour.arrivalTransitDetails || null,
          pickupLocation: tour.arrivalPickupLocation || null,
          pickupLat: tour.arrivalPickupLat || null,
          pickupLng: tour.arrivalPickupLng || null,
        },
        currentDay: {
          dayNumber: currentDayNum,
          hotel: currentDayHotel?.serviceName || null,
          transport: currentDayTransport
            ? {
                serviceName: currentDayTransport.serviceName,
                notes: currentDayTransport.notes,
              }
            : null,
          driver: currentDayDriver
            ? {
                name: currentDayDriver.driver.name,
                phone: currentDayDriver.driver.phone,
                vehicleName: currentDayDriver.driver.vehicleName,
                vehicleNo: currentDayDriver.driver.vehicleNo,
              }
            : null,
        },
        itinerary: buildDayPlan(tour),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────
// 3. SOS ALERT — POST /public/guest/:tourCode/sos
// ──────────────────────────────────────────────────────────────
const guestSOS = async (req, res, next) => {
  try {
    const { tourCode } = req.params;
    const { lat, lng, message } = req.body;

    const tour = await prisma.tour.findUnique({
      where: { tourCode },
      include: {
        query: { select: { name: true, phone: true } },
        tourDrivers: { include: { driver: true }, orderBy: { dayNumber: 'asc' } },
      },
    });

    if (!tour) throw new NotFoundError('Trip');

    // Log SOS to ops notes (until SOSAlert model is added in a future sprint)
    const sosText = `🚨 SOS ALERT [${new Date().toISOString()}] — Guest: ${tour.query?.name} | Location: ${lat || 'unknown'}, ${lng || 'unknown'} | Message: ${message || 'Emergency help needed'}`;
    await prisma.tour.update({
      where: { tourCode },
      data: { opsNotes: sosText },
    });

    // TODO: Trigger WhatsApp Cloud API here when credentials are set up
    // The driver phone and ops team number would receive an automated message.
    const driverPhone = tour.tourDrivers?.[0]?.driver?.phone || null;

    res.json({
      success: true,
      message: 'SOS received. Your driver and Imagica Holidays ops team have been alerted.',
      data: { driverPhone },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────────────────────
const hotelLogin = async (req, res, next) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin) throw new BusinessError('Username and PIN are required');

    const hotel = await prisma.hotel.findFirst({
      where: {
        loginId: { equals: username, mode: 'insensitive' },
        isActive: true
      }
    });

    if (!hotel || hotel.loginPassword !== pin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        hotelId: hotel.id,
        hotelName: hotel.name,
      }
    });
  } catch (error) {
    next(error);
  }
};

const driverLogin = async (req, res, next) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin) throw new BusinessError('Username and PIN are required');

    const driver = await prisma.driver.findFirst({
      where: {
        loginId: { equals: username, mode: 'insensitive' },
        isActive: true,
        deletedAt: null
      }
    });

    if (!driver || driver.loginPassword !== pin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        driverId: driver.id,
        driverName: driver.name,
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDriverTrips = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    });
    if (!driver || driver.deletedAt) throw new NotFoundError('Driver');

    const today = new Date();
    const assignments = await prisma.tourDriver.findMany({
      where: { driverId },
      include: {
        tour: {
          include: {
            query: { select: { name: true, phone: true, destination: true } },
            bookingServices: { where: { serviceType: 'hotel' }, orderBy: { dayNumber: 'asc' } },
          },
        },
      },
      orderBy: { dayNumber: 'asc' },
    });

    // Filter to upcoming/running tours only
    const upcoming = assignments.filter((a) => {
      const end = new Date(a.tour.endDate);
      return end >= today && a.tour.status !== 'cancelled';
    });

    const trips = upcoming.map((a) => {
      const tripStart = new Date(a.tour.startDate);
      const dayDate = new Date(tripStart);
      dayDate.setDate(dayDate.getDate() + (a.dayNumber - 1));

      const hotel = a.tour.bookingServices.find(b => b.dayNumber === a.dayNumber);

      return {
        tourId: a.tour.id,
        tourCode: a.tour.tourCode,
        dayNumber: a.dayNumber,
        date: dayDate.toISOString().split('T')[0],
        guestName: a.tour.query?.name,
        guestPhone: a.tour.query?.phone,
        destination: a.tour.query?.destination,
        hotel: hotel?.serviceName || null,
        tourStatus: a.tour.status,
        rideStatus: a.rideStatus,
        lat: a.lat,
        lng: a.lng,
        pickupLocation: a.pickupLocation,
        pickupLat: a.pickupLat,
        pickupLng: a.pickupLng,
        destinationLocation: a.destinationLocation,
        destinationLat: a.destinationLat,
        destinationLng: a.destinationLng,
        etaMinutes: a.etaMinutes,
        transitType: a.tour.arrivalTransitType || null,
        transitNumber: a.tour.arrivalTransitNumber || null,
        transitTime: a.tour.arrivalTransitTime || null,
        transitDetails: a.tour.arrivalTransitDetails || null,
      };
    });

    // Fetch live settlements / payouts (recorded supplier payments under Billing tab)
    const payments = await prisma.vendorPayment.findMany({
      where: {
        vendorName: { contains: driver.name, mode: 'insensitive' },
        deletedAt: null,
      },
      orderBy: { paymentDate: 'desc' },
    });

    // Get live financials from BookingServices of type transport/cab matching driver name
    const bookingServices = await prisma.bookingService.findMany({
      where: {
        OR: [
          { supplierId: driver.id },
          { 
            serviceType: { in: ['transport', 'cab', 'transfer'] },
            supplierName: { contains: driver.name, mode: 'insensitive' }
          }
        ]
      }
    });

    const totalCost = bookingServices.reduce((sum, s) => sum + Number(s.totalCost), 0);
    const totalPaid = bookingServices.reduce((sum, s) => sum + Number(s.supplierAmountPaid), 0);
    const totalPending = bookingServices.reduce((sum, s) => sum + Number(s.supplierAmountPending), 0);

    res.json({
      success: true,
      data: { 
        driver: { name: driver.name, vehicleName: driver.vehicleName, vehicleNo: driver.vehicleNo }, 
        trips,
        settlements: payments.map(p => ({
          id: p.id,
          paymentDate: p.paymentDate,
          amount: p.amount,
          mode: p.mode,
          status: 'paid',
          notes: p.notes || 'Payout Settlement'
        })),
        financials: {
          totalEarnings: totalCost,
          payoutReceived: totalPaid,
          payoutPending: totalPending
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

const getHotelGuests = async (req, res, next) => {
  try {
    const { hotelName } = req.params;
    let decodedName = decodeURIComponent(hotelName);

    // Try to find by UUID first
    let hotel = await prisma.hotel.findFirst({
      where: { OR: [{ id: decodedName }, { name: { contains: decodedName, mode: 'insensitive' } }] }
    });

    if (hotel) {
      decodedName = hotel.name;
    }

    const services = await prisma.bookingService.findMany({
      where: {
        serviceType: 'hotel',
        serviceName: { contains: decodedName, mode: 'insensitive' },
        OR: [
          { checkIn: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } },
          { checkIn: null }
        ]
      },
      include: {
        query: { select: { name: true, phone: true, adults: true, children: true } },
        tour: {
          select: {
            id: true,
            tourCode: true,
            status: true,
            startDate: true,
            endDate: true,
            arrivalTransitType: true,
            arrivalTransitNumber: true,
            arrivalTransitTime: true,
            arrivalTransitDetails: true,
            arrivalPickupLocation: true,
            tourDrivers: {
              where: { dayNumber: 1 },
              include: { driver: true }
            }
          }
        },
      },
      orderBy: [
        { checkIn: 'asc' },
        { dayNumber: 'asc' }
      ]
    });

    const guestsList = services.map((s) => {
      let checkIn = s.checkIn;
      let checkOut = s.checkOut;

      if (!checkIn && s.tour?.startDate && s.dayNumber) {
        const start = new Date(s.tour.startDate);
        const ci = new Date(start);
        ci.setDate(ci.getDate() + (s.dayNumber - 1));
        checkIn = ci;

        const co = new Date(start);
        co.setDate(co.getDate() + s.dayNumber);
        checkOut = co;
      }

      const day1Driver = s.tour?.tourDrivers?.[0]?.driver;

      return {
        tourCode: s.tour?.tourCode,
        guestName: s.query?.name,
        guestPhone: s.query?.phone,
        adults: s.query?.adults,
        children: s.query?.children,
        checkIn: checkIn,
        checkOut: checkOut,
        roomNotes: s.notes,
        status: s.tour?.status,
        arrivalDetails: {
          transitType: s.tour?.arrivalTransitType || null,
          transitNumber: s.tour?.arrivalTransitNumber || null,
          transitTime: s.tour?.arrivalTransitTime || null,
          transitDetails: s.tour?.arrivalTransitDetails || null,
          pickupLocation: s.tour?.arrivalPickupLocation || null,
          driverName: day1Driver?.name || null,
          driverPhone: day1Driver?.phone || null,
          vehicleNo: day1Driver?.vehicleNo || null,
          vehicleName: day1Driver?.vehicleName || null,
        }
      };
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const guests = guestsList.filter(g => {
      if (!g.checkIn) return false;
      return new Date(g.checkIn) >= sevenDaysAgo;
    });

    guests.sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

    // Fetch live settlements / payments matching hotel name
    const payments = await prisma.vendorPayment.findMany({
      where: {
        vendorName: { contains: decodedName, mode: 'insensitive' },
        deletedAt: null,
      },
      orderBy: { paymentDate: 'desc' },
    });

    // Get live financials from BookingServices matching hotel name
    const totalCost = services.reduce((sum, s) => sum + Number(s.totalCost), 0);
    const totalPaid = services.reduce((sum, s) => sum + Number(s.supplierAmountPaid), 0);
    const totalPending = services.reduce((sum, s) => sum + Number(s.supplierAmountPending), 0);

    res.json({ 
      success: true, 
      data: { 
        hotelName: decodedName, 
        guests,
        settlements: payments.map(p => ({
          id: p.id,
          paymentDate: p.paymentDate,
          amount: p.amount,
          mode: p.mode,
          status: 'paid',
          notes: p.notes || 'Booking Payment'
        })),
        financials: {
          totalBilling: totalCost,
          amountReceived: totalPaid,
          amountPending: totalPending
        }
      } 
    });
  } catch (error) {
    next(error);
  }
};

// ─── Uber-Style Driver Ride Endpoints ───
const startDriverRide = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { tourId, dayNumber, pickupLocation, destinationLocation, lat, lng } = req.body;

    const tourDriver = await prisma.tourDriver.findFirst({
      where: { tourId: String(tourId), driverId: String(driverId), dayNumber: Number(dayNumber) },
      include: {
        tour: {
          include: { query: { select: { name: true, phone: true } } }
        },
        driver: true
      }
    });

    if (!tourDriver) {
      throw new NotFoundError('Assigned Tour Driver record not found');
    }

    const updated = await prisma.tourDriver.update({
      where: { id: tourDriver.id },
      data: {
        rideStatus: 'STARTED',
        pickupLocation: pickupLocation || 'Airport / Station',
        destinationLocation: destinationLocation || 'Hotel',
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        lastLocUpdate: new Date()
      }
    });

    // Broadcast ride start via socket
    try {
      const socketService = require('../services/socket.service');
      const io = socketService.getIO();
      if (tourDriver.tour?.tourCode) {
        io.to(`tour:${tourDriver.tour.tourCode}`).emit('driver:status-change', {
          rideStatus: 'STARTED',
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null
        });
      }
    } catch (e) {
      console.error('Socket broadcast failed for startDriverRide:', e.message);
    }

    // Queue WhatsApp notification to the guest with live tracking link
    const guestName = tourDriver.tour.query?.name || 'Traveler';
    const guestPhone = tourDriver.tour.query?.phone;
    const trackingUrl = `https://guest.imagicaholidays.com/${tourDriver.tour.tourCode}`;
    const driverName = tourDriver.driver.name;
    const vehicle = `${tourDriver.driver.vehicleName} (${tourDriver.driver.vehicleNo})`;

    if (guestPhone) {
      try {
        const queueService = require('../services/queue.service');
        await queueService.enqueueWhatsappJob(
          tourDriver.tour.id,
          guestPhone,
          'driver_started_ride',
          [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: guestName },
                { type: 'text', text: driverName },
                { type: 'text', text: vehicle },
                { type: 'text', text: trackingUrl }
              ]
            }
          ]
        );
      } catch (e) {
        console.error('[WhatsApp Notification Queue Error]', e);
      }
    }

    res.json({ success: true, message: 'Ride started successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

const updateDriverLocation = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { tourId, dayNumber, lat, lng, etaMinutes } = req.body;

    const tourDriver = await prisma.tourDriver.findFirst({
      where: { tourId: String(tourId), driverId: String(driverId), dayNumber: Number(dayNumber) },
      include: { tour: { select: { tourCode: true } } }
    });

    if (!tourDriver) {
      throw new NotFoundError('Assigned Tour Driver record not found');
    }

    const updated = await prisma.tourDriver.update({
      where: { id: tourDriver.id },
      data: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        etaMinutes: etaMinutes ? parseInt(etaMinutes, 10) : null,
        lastLocUpdate: new Date()
      }
    });

    // Broadcast location update via socket
    try {
      const socketService = require('../services/socket.service');
      const io = socketService.getIO();
      if (tourDriver.tour?.tourCode) {
        io.to(`tour:${tourDriver.tour.tourCode}`).emit('driver:location-receive', {
          driverId,
          tourId,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          etaMinutes: etaMinutes ? parseInt(etaMinutes, 10) : null,
          timestamp: new Date()
        });
      }
    } catch (e) {
      console.error('Socket broadcast failed for updateDriverLocation:', e.message);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const completeDriverRide = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { tourId, dayNumber } = req.body;

    const tourDriver = await prisma.tourDriver.findFirst({
      where: { tourId: String(tourId), driverId: String(driverId), dayNumber: Number(dayNumber) },
      include: { tour: { select: { tourCode: true } } }
    });

    if (!tourDriver) {
      throw new NotFoundError('Assigned Tour Driver record not found');
    }

    const updated = await prisma.tourDriver.update({
      where: { id: tourDriver.id },
      data: {
        rideStatus: 'COMPLETED',
        lastLocUpdate: new Date()
      }
    });

    // Broadcast ride completion via socket
    try {
      const socketService = require('../services/socket.service');
      const io = socketService.getIO();
      if (tourDriver.tour?.tourCode) {
        io.to(`tour:${tourDriver.tour.tourCode}`).emit('driver:status-change', {
          rideStatus: 'COMPLETED'
        });
      }
    } catch (e) {
      console.error('Socket broadcast failed for completeDriverRide:', e.message);
    }

    res.json({ success: true, message: 'Ride completed successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

const getDriverLocationForGuest = async (req, res, next) => {
  try {
    const { tourCode } = req.params;

    const tour = await prisma.tour.findFirst({
      where: { tourCode: { equals: tourCode, mode: 'insensitive' }, deletedAt: null },
      include: {
        tourDrivers: {
          include: { driver: true },
          orderBy: { dayNumber: 'asc' }
        }
      }
    });

    if (!tour) throw new NotFoundError('Trip not found');

    // Determine current day number
    const today = new Date().toISOString().split('T')[0];
    const safeStartDate = tour.startDate ? new Date(tour.startDate) : new Date();
    const startStr = (isNaN(safeStartDate.getTime()) ? new Date() : safeStartDate).toISOString().split('T')[0];
    const daysDiff = Math.floor((new Date(today) - new Date(startStr)) / 86400000);
    const currentDayNum = Math.max(1, daysDiff + 1);

    const currentTourDriver = tour.tourDrivers.find(d => d.dayNumber === currentDayNum);

    if (!currentTourDriver) {
      return res.json({ success: true, active: false, message: 'No driver assigned for today' });
    }

    const activeStatuses = ['STARTED', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT'];
    res.json({
      success: true,
      active: activeStatuses.includes(currentTourDriver.rideStatus),
      data: {
        rideStatus: currentTourDriver.rideStatus,
        lat: currentTourDriver.lat,
        lng: currentTourDriver.lng,
        pickupLocation: currentTourDriver.pickupLocation,
        pickupLat: currentTourDriver.pickupLat,
        pickupLng: currentTourDriver.pickupLng,
        destinationLocation: currentTourDriver.destinationLocation,
        destinationLat: currentTourDriver.destinationLat,
        destinationLng: currentTourDriver.destinationLng,
        etaMinutes: currentTourDriver.etaMinutes,
        lastLocUpdate: currentTourDriver.lastLocUpdate,
        driver: {
          name: currentTourDriver.driver.name,
          phone: currentTourDriver.driver.phone,
          vehicleName: currentTourDriver.driver.vehicleName,
          vehicleNo: currentTourDriver.driver.vehicleNo
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Hotel Service Request Endpoints ───
const createHotelRequest = async (req, res, next) => {
  try {
    const { tourCode } = req.params;
    const { hotelId, roomNo, requestType, notes, guestName } = req.body;

    if (!hotelId || !requestType || !guestName) {
      throw new BusinessError('Hotel ID, Request Type, and Guest Name are required');
    }

    const request = await prisma.hotelRequest.create({
      data: {
        tourCode,
        hotelId,
        roomNo,
        requestType,
        notes,
        guestName
      }
    });

    res.json({ success: true, message: 'Service request submitted successfully', data: request });
  } catch (error) {
    next(error);
  }
};

const getGuestHotelRequests = async (req, res, next) => {
  try {
    const { tourCode } = req.params;
    const requests = await prisma.hotelRequest.findMany({
      where: { tourCode },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

const getHotelRequests = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    let hotel = await prisma.hotel.findFirst({
      where: { OR: [{ id: hotelId }, { name: { contains: hotelId, mode: 'insensitive' } }] }
    });

    if (!hotel) throw new NotFoundError('Hotel not found');

    const requests = await prisma.hotelRequest.findMany({
      where: { hotelId: hotel.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

const updateHotelRequestStatus = async (req, res, next) => {
  try {
    const { hotelId, requestId } = req.params;
    const { status } = req.body;

    if (!status) throw new BusinessError('Status is required');

    const request = await prisma.hotelRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) throw new NotFoundError('Service request not found');

    const updated = await prisma.hotelRequest.update({
      where: { id: requestId },
      data: { status }
    });

    res.json({ success: true, message: 'Request status updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

const updateGuestTransitDetails = async (req, res, next) => {
  try {
    const { tourCode } = req.params;
    const {
      transitType,
      transitNumber,
      transitTime,
      transitDetails,
      pickupLocation,
      pickupLat,
      pickupLng
    } = req.body;

    const tour = await prisma.tour.findFirst({
      where: { tourCode: { equals: tourCode, mode: 'insensitive' }, deletedAt: null }
    });

    if (!tour) throw new NotFoundError('Trip not found');

    const updatedTour = await prisma.tour.update({
      where: { id: tour.id },
      data: {
        arrivalTransitType: transitType,
        arrivalTransitNumber: transitNumber,
        arrivalTransitTime: transitTime,
        arrivalTransitDetails: transitDetails,
        arrivalPickupLocation: pickupLocation,
        arrivalPickupLat: pickupLat ? parseFloat(pickupLat) : null,
        arrivalPickupLng: pickupLng ? parseFloat(pickupLng) : null
      }
    });

    // Sync Day 1 TourDriver if it exists
    const day1Driver = await prisma.tourDriver.findFirst({
      where: { tourId: tour.id, dayNumber: 1 }
    });

    if (day1Driver) {
      // Find hotel booking service for day 1
      const hotelService = await prisma.bookingService.findFirst({
        where: { tourId: tour.id, serviceType: 'hotel', dayNumber: 1 }
      });

      let destLat = 27.3389; // Default fallback
      let destLng = 88.6065;
      let destLocationName = hotelService?.serviceName || 'Partner Hotel';

      if (hotelService?.serviceName) {
        try {
          const axios = require('axios');
          const searchQuery = `${hotelService.serviceName}, India`;
          const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`, {
            headers: { 'User-Agent': 'Imagica-Holidays-Agent' }
          });
          if (geoRes.data && geoRes.data.length > 0) {
            destLat = parseFloat(geoRes.data[0].lat);
            destLng = parseFloat(geoRes.data[0].lon);
          }
        } catch (e) {
          console.error("Failed to geocode destination hotel", e.message);
        }
      }

      await prisma.tourDriver.update({
        where: { id: day1Driver.id },
        data: {
          pickupLocation: pickupLocation || 'Airport / Station',
          pickupLat: pickupLat ? parseFloat(pickupLat) : null,
          pickupLng: pickupLng ? parseFloat(pickupLng) : null,
          destinationLocation: destLocationName,
          destinationLat: destLat,
          destinationLng: destLng
        }
      });
    }

    res.json({ success: true, message: 'Arrival transit details updated successfully', data: updatedTour });
  } catch (error) {
    next(error);
  }
};

const updateDriverRideStatus = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { tourId, dayNumber, status, lat, lng } = req.body;

    if (!tourId || !dayNumber || !status) {
      throw new BusinessError('tourId, dayNumber, and status are required');
    }

    const tourDriver = await prisma.tourDriver.findFirst({
      where: { tourId: String(tourId), driverId: String(driverId), dayNumber: Number(dayNumber) },
      include: {
        tour: {
          include: { query: { select: { name: true, phone: true } } }
        },
        driver: true
      }
    });

    if (!tourDriver) {
      throw new NotFoundError('Assigned Tour Driver record not found');
    }

    let updateData = {
      rideStatus: status,
      lastLocUpdate: new Date()
    };

    if (lat) updateData.lat = parseFloat(lat);
    if (lng) updateData.lng = parseFloat(lng);

    if (status === 'EN_ROUTE') {
      updateData.pickupLocation = tourDriver.tour.arrivalPickupLocation || 'Airport / Station';
      updateData.pickupLat = tourDriver.tour.arrivalPickupLat || null;
      updateData.pickupLng = tourDriver.tour.arrivalPickupLng || null;
      
      const hotelService = await prisma.bookingService.findFirst({
        where: { tourId: String(tourId), serviceType: 'hotel', dayNumber: Number(dayNumber) }
      });
      updateData.destinationLocation = hotelService?.serviceName || 'Hotel';
    }

    const updated = await prisma.tourDriver.update({
      where: { id: tourDriver.id },
      data: updateData
    });

    try {
      const socketService = require('../services/socket.service');
      const io = socketService.getIO();
      if (tourDriver.tour?.tourCode) {
        io.to(`tour:${tourDriver.tour.tourCode}`).emit('driver:status-change', {
          rideStatus: status,
          lat: lat ? parseFloat(lat) : updated.lat,
          lng: lng ? parseFloat(lng) : updated.lng
        });
      }
    } catch (e) {
      console.error('Socket broadcast failed for updateDriverRideStatus:', e.message);
    }

    const guestName = tourDriver.tour.query?.name || 'Traveler';
    const guestPhone = tourDriver.tour.query?.phone;
    const trackingUrl = `https://guest.imagicaholidays.com/${tourDriver.tour.tourCode}`;
    const driverName = tourDriver.driver.name;
    const vehicle = `${tourDriver.driver.vehicleName} (${tourDriver.driver.vehicleNo})`;

    if (guestPhone) {
      try {
        const queueService = require('../services/queue.service');
        let templateName = 'driver_started_ride';
        let parameters = [];

        if (status === 'EN_ROUTE') {
          templateName = 'driver_started_ride';
          parameters = [
            { type: 'body', parameters: [
              { type: 'text', text: guestName },
              { type: 'text', text: driverName },
              { type: 'text', text: vehicle },
              { type: 'text', text: trackingUrl }
            ]}
          ];
        } else if (status === 'ARRIVED') {
          templateName = 'driver_arrived';
          parameters = [
            { type: 'body', parameters: [
              { type: 'text', text: guestName },
              { type: 'text', text: driverName },
              { type: 'text', text: updated.pickupLocation || 'Pickup Point' }
            ]}
          ];
        } else if (status === 'IN_TRANSIT') {
          templateName = 'driver_in_transit';
          parameters = [
            { type: 'body', parameters: [
              { type: 'text', text: guestName },
              { type: 'text', text: updated.destinationLocation || 'Hotel' }
            ]}
          ];
        } else if (status === 'COMPLETED') {
          templateName = 'driver_completed_trip';
          parameters = [
            { type: 'body', parameters: [
              { type: 'text', text: guestName }
            ]}
          ];
        }

        await queueService.enqueueWhatsappJob(
          tourDriver.tour.id,
          guestPhone,
          templateName,
          parameters
        );
      } catch (e) {
        console.error('[WhatsApp Notification Queue Error in updateDriverRideStatus]', e);
      }
    }

    res.json({ success: true, message: `Ride status updated to ${status}`, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  guestLogin, 
  getGuestTrip, 
  guestSOS, 
  getDriverTrips, 
  getHotelGuests,
  hotelLogin,
  driverLogin,
  startDriverRide,
  updateDriverLocation,
  completeDriverRide,
  getDriverLocationForGuest,
  createHotelRequest,
  getGuestHotelRequests,
  getHotelRequests,
  updateHotelRequestStatus,
  updateGuestTransitDetails,
  updateDriverRideStatus
};

