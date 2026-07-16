const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  try {
    const hotels = await p.hotel.findMany({
      include: { destination: { select: { name: true } } }
    });
    console.log("PRISMA HOTEL FIND MANY:", JSON.stringify(hotels, null, 2));

    const drivers = await p.driver.findMany();
    console.log("PRISMA DRIVER FIND MANY:", JSON.stringify(drivers, null, 2));
  } catch(e) {
    console.error("ERROR:", e.message);
  }
  await p.$disconnect();
})();
