const prisma = require('./src/config/prisma');

async function check() {
  try {
    const hotel = await prisma.hotel.findFirst({
      where: {
        OR: [
          { id: 'cf9b15fe-cb9c-4c02-b14d-fa7d2b374d34' },
          { name: { contains: 'Sai Residency', mode: 'insensitive' } }
        ]
      }
    });
    console.log('Hotel found:', hotel);

    const tour = await prisma.tour.findUnique({
      where: { id: 'e197d313-89d3-477e-8d01-47a94f9ae9a3' },
      include: {
        bookingServices: true,
        tourDrivers: true
      }
    });
    console.log('Tour BookingServices:', tour ? tour.bookingServices : 'No Tour');

    if (hotel) {
      const services = await prisma.bookingService.findMany({
        where: {
          serviceType: 'hotel',
          serviceName: { contains: hotel.name, mode: 'insensitive' }
        }
      });
      console.log('Booking services matching hotel name:', services);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
