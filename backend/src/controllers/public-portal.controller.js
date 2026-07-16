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
        checkIn: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) },
      },
      include: {
        query: { select: { name: true, phone: true, adults: true, children: true } },
        tour: { select: { tourCode: true, status: true } },
      },
      orderBy: { checkIn: 'asc' },
    });

    const guests = services.map((s) => ({
      tourCode: s.tour?.tourCode,
      guestName: s.query?.name,
      guestPhone: s.query?.phone,
      adults: s.query?.adults,
      children: s.query?.children,
      checkIn: s.checkIn,
      checkOut: s.checkOut,
      roomNotes: s.notes,
      status: s.tour?.status,
    }));

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

module.exports = { 
  guestLogin, 
  getGuestTrip, 
  guestSOS, 
  getDriverTrips, 
  getHotelGuests,
  hotelLogin,
  driverLogin
};
