const prisma = require('./src/config/prisma');

async function checkCreds() {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: 'e197d313-89d3-477e-8d01-47a94f9ae9a3' }
    });
    console.log('Tour by ID:', tour);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkCreds();
