const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  try {
    const hotels = await p.$queryRawUnsafe(`
      SELECT id, name, login_id, login_password FROM hotels
    `);
    console.log("HOTEL RECORDS:", hotels);

    const drivers = await p.$queryRawUnsafe(`
      SELECT id, name, login_id, login_password FROM drivers
    `);
    console.log("DRIVER RECORDS:", drivers);
  } catch(e) {
    console.error("ERROR:", e.message);
  }
  await p.$disconnect();
})();
