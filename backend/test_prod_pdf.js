const prisma = require('./src/config/prisma');
const { generatePdfFromHtml } = require('./src/services/pdf.service');
const fs = require('fs');

async function main() {
  const serviceId = '4f4e4e0a-57d2-4274-b588-14f35304f4b1';
  console.log(`=== TESTING PDF GENERATION FOR SERVICE: ${serviceId} ===\n`);

  try {
    const service = await prisma.bookingService.findUnique({
      where: { id: serviceId },
      include: {
        query: true,
      }
    });

    if (!service) {
      console.log(`❌ Error: Booking service ${serviceId} not found in database!`);
      return;
    }

    console.log(`[Found Service] Name: "${service.serviceName}", Type: "${service.serviceType}"`);

    // Fetch payments logged for this query and supplier name
    const payments = await prisma.vendorPayment.findMany({
      where: {
        queryId: service.queryId,
        vendorName: service.supplierName || 'Unknown Supplier',
        deletedAt: null
      },
      orderBy: { paymentDate: 'asc' }
    });

    console.log(`[Payments logged] Count: ${payments.length}`);

    const checkInStr = service.checkIn ? new Date(service.checkIn).toLocaleDateString('en-IN') : 'TBD';
    const checkOutStr = service.checkOut ? new Date(service.checkOut).toLocaleDateString('en-IN') : 'TBD';
    const serviceDateStr = service.serviceDate ? new Date(service.serviceDate).toLocaleDateString('en-IN') : 'TBD';

    const datesHtml = service.serviceType === 'hotel'
      ? `<p><strong>Check-in:</strong> ${checkInStr} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Check-out:</strong> ${checkOutStr}</p>`
      : `<p><strong>Service Date:</strong> ${serviceDateStr}</p>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Purchase Order & Billing Statement</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #374151; line-height: 1.6; margin: 40px; }
        </style>
      </head>
      <body>
        <h1>Purchase Order</h1>
        <p>Service Name: ${service.serviceName}</p>
        ${datesHtml}
      </body>
      </html>
    `;

    console.log("Launching PDF generator...");
    const pdfBuffer = await generatePdfFromHtml(htmlContent);
    console.log(`✅ SUCCESS! Generated PDF Buffer size: ${pdfBuffer.length} bytes.`);
    fs.writeFileSync('test_po.pdf', pdfBuffer);
    console.log("Saved test output as test_po.pdf");

  } catch (err) {
    console.error("❌ ERROR STACK TRACE:");
    console.error(err);
  }
}

main().then(() => process.exit(0));
