const prisma = require('./src/config/prisma');

async function main() {
  console.log("=== STARTING DUPLICATE TOURS CLEANUP ===");

  try {
    // 1. Group tours by queryId to find duplicates
    const toursGrouped = await prisma.tour.groupBy({
      by: ['queryId'],
      _count: {
        id: true
      },
      having: {
        queryId: {
          _count: {
            gt: 1
          }
        }
      }
    });

    console.log(`Found ${toursGrouped.length} queries with duplicate tours.`);

    for (const group of toursGrouped) {
      const { queryId } = group;
      console.log(`\nProcessing duplicates for Query ID: ${queryId}`);

      // Fetch all tours for this query, sorted by creation date descending (latest first)
      const queryTours = await prisma.tour.findMany({
        where: { queryId },
        orderBy: { createdAt: 'desc' }
      });

      console.log(` - Total tours found for this query: ${queryTours.length}`);
      
      // Keep the latest tour (first one in descending order)
      const keepTour = queryTours[0];
      const deleteTourIds = queryTours.slice(1).map(t => t.id);

      console.log(` - Keeping Tour: ID=${keepTour.id}, Code=${keepTour.tourCode}, Created=${keepTour.createdAt}`);
      console.log(` - Deleting ${deleteTourIds.length} duplicate tours...`);

      // Delete payments and drivers associated with the duplicate tours to avoid foreign key failures
      await prisma.payment.deleteMany({
        where: { tourId: { in: deleteTourIds } }
      });
      await prisma.tourDriver.deleteMany({
        where: { tourId: { in: deleteTourIds } }
      });
      
      // Delete the duplicate tours themselves
      const deleted = await prisma.tour.deleteMany({
        where: { id: { in: deleteTourIds } }
      });

      console.log(` - Successfully deleted ${deleted.count} duplicate tours.`);
    }

    console.log("\n=== CLEANUP COMPLETED SUCCESSFULLY ===");

  } catch (err) {
    console.error("❌ Cleanup failed with error:", err);
  }
}

main().then(() => process.exit(0));
