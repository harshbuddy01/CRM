const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  try {
    const hotelCols = await p.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'hotels'
    `);
    console.log("HOTEL COLUMNS:", hotelCols.map(c => c.column_name));

    const driverCols = await p.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'drivers'
    `);
    console.log("DRIVER COLUMNS:", driverCols.map(c => c.column_name));
  } catch(e) {
    console.error("ERROR:", e.message);
  }
  await p.$disconnect();
})();
