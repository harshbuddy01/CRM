const prisma = require('./src/config/prisma');

async function main() {
  const queryId = 'e6c4c9a8-7e2b-46ec-aa5b-45b11b1d260c';
  console.log(`=== RUNNING DIAGNOSTICS FOR LEAD/QUERY: ${queryId} ===\n`);

  try {
    // 1. Fetch Query
    const query = await prisma.query.findUnique({ where: { id: queryId } });
    if (!query) {
      console.log("❌ Query not found in database!");
      return;
    }
    console.log(`[Query] Name: "${query.name}", Adults: ${query.adults}, Children: ${query.children}`);

    // 2. Fetch Latest Proposal
    const proposal = await prisma.proposal.findFirst({
      where: { queryId, deletedAt: null },
      orderBy: { version: 'desc' }
    });
    if (!proposal) {
      console.log("❌ No active proposal found for this query!");
      return;
    }
    console.log(`[Proposal] Version: v${proposal.version}, Status: "${proposal.status}", Itinerary ID: "${proposal.itineraryId}"`);

    if (proposal.itineraryId) {
      // 3. Fetch Itinerary
      const itinerary = await prisma.itinerary.findUnique({
        where: { id: proposal.itineraryId },
        include: {
          days: {
            include: { events: true }
          }
        }
      });
      if (!itinerary) {
        console.log(`❌ Itinerary "${proposal.itineraryId}" not found in database!`);
      } else {
        console.log(`[Itinerary] Title: "${itinerary.title}", Days count: ${itinerary.days.length}`);
        let totalEvents = 0;
        let hotelEvents = 0;
        let transportEvents = 0;
        
        itinerary.days.forEach(day => {
          totalEvents += day.events.length;
          day.events.forEach(ev => {
            if (ev.type === 'accommodation') hotelEvents++;
            if (['transport', 'activity', 'sightseeing'].includes(ev.type)) transportEvents++;
          });
        });
        console.log(`[Itinerary Events] Total: ${totalEvents}, Accommodation: ${hotelEvents}, Transport/Activity: ${transportEvents}`);
      }
    }

    // 4. Fetch Booking Services
    const bookings = await prisma.bookingService.findMany({ where: { queryId } });
    console.log(`[Booking Services] Current count in DB: ${bookings.length}`);
    bookings.forEach(b => {
      console.log(` - ID=${b.id}, Type=${b.serviceType}, Name="${b.serviceName}", Dates=${b.checkIn ? b.checkIn.toISOString().split('T')[0] : 'None'} -> ${b.checkOut ? b.checkOut.toISOString().split('T')[0] : 'None'}`);
    });

  } catch (err) {
    console.error("❌ Diagnostics encountered error:", err);
  }
}

main().then(() => process.exit(0));
