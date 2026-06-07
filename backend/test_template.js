const { getArtisanalTemplate, getBillingStatementTemplate } = require('./src/templates/billingStatement.template');

const mockData = {
  query: {
    id: 'd8bf3665-b34d-4806-8e59-78c8ad782b0a',
    queryCode: 'Q-2026-001',
    name: 'Mr. Harsh Anand',
    phone: '+91 7004823531',
    email: 'harsh@example.com',
    destination: 'Sikkim & Darjeeling',
    adults: 8,
    children: 1,
    travelDateFrom: '2026-06-04',
    travelDateTo: '2026-06-08',
  },
  customer: {
    totalAmount: 377004,
    totalReceived: 300000,
    totalPending: 77004,
    grossProfit: 77004
  },
  payments: [
    {
      id: 'pay-1',
      paymentDate: '2026-06-07',
      mode: 'upi',
      amount: 300000,
      referenceUtr: 'UPI82734634',
      user: { name: 'Harsh Anand' }
    }
  ],
  date: '07 Jun 2026',
  orgSettings: {
    companyName: 'Imagica Holidays Pvt. Ltd.',
    companyEmail: 'info@imagicaholidays.com',
    companyPhone: '+91 98765 43210',
    companyWebsite: 'www.imagicaholidays.com',
    companyAddress: '2nd Floor, Adventure House, Hill Cart Road, Siliguri, West Bengal - 734001, India',
    companyLogoUrl: 'https://example.com/logo.png',
    companyGst: '19AABCI1234K1ZV',
    companyPan: 'AABCI1234K',
  },
  tourCode: 'IMH-3803969',
  proposal: {
    sellingPrice: 377004,
    markupPct: 5,
    itinerary: {
      markupPct: 5
    }
  }
};

try {
  console.log("Testing getBillingStatementTemplate...");
  const htmlBilling = getBillingStatementTemplate(mockData);
  console.log("getBillingStatementTemplate generated HTML length:", htmlBilling.length);
  
  console.log("Testing getArtisanalTemplate...");
  const htmlInvoice = getArtisanalTemplate(mockData);
  console.log("getArtisanalTemplate generated HTML length:", htmlInvoice.length);
  
  console.log("TEST SUCCESSFUL");
  process.exit(0);
} catch (err) {
  console.error("TEMPLATE RUNTIME ERROR:", err);
  process.exit(1);
}
