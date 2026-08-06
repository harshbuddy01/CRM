// ============================================================
// TravelCRM — Tax Invoice / Billing Statement Template
// ============================================================

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const formatCurrencyDec = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatNumberDec = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '0.00';
  return Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getCapitalizedDestination = (dest) => {
  if (!dest) return 'Sikkim & Darjeeling';
  return dest.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return '—';
  }
};

const getAbbr = (name) => {
  if (!name) return 'INV';
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4);
};

const getPlaceOfSupply = (dest) => {
  if (!dest) return 'West Bengal';
  const d = dest.toLowerCase();
  if (d.includes('sikkim')) return 'Sikkim';
  if (d.includes('west bengal') || d.includes('darjeeling') || d.includes('pelling') || d.includes('lachung') || d.includes('gangtok')) return 'West Bengal';
  if (d.includes('kerala') || d.includes('munnar')) return 'Kerala';
  if (d.includes('kashmir')) return 'Jammu & Kashmir';
  if (d.includes('himachal') || d.includes('manali')) return 'Himachal Pradesh';
  if (d.includes('rajasthan') || d.includes('jaipur') || d.includes('udaipur')) return 'Rajasthan';
  if (d.includes('srinagar')) return 'Jammu & Kashmir';
  if (d.includes('karnataka') || d.includes('coorg') || d.includes('ooty') || d.includes('tamil nadu')) return 'Tamil Nadu';
  return dest;
};

const calculateNightsAndDays = (from, to) => {
  if (!from || !to) return '—';
  try {
    const dFrom = new Date(from);
    const dTo = new Date(to);
    if (isNaN(dFrom.getTime()) || isNaN(dTo.getTime())) return '—';
    const diffTime = dTo.getTime() - dFrom.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const days = nights + 1;
    return `${nights} Nights / ${days} Days`;
  } catch (e) {
    return '—';
  }
};

const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const g = ['', 'Thousand', 'Lakh', 'Crore'];

  const makeWords = (n) => {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n];
    }
    return str;
  };

  let n = Math.round(num);
  if (n === 0) return 'Zero Rupees Only';

  let parts = [];
  parts.push(n % 1000);
  n = Math.floor(n / 1000);
  
  if (n > 0) {
    parts.push(n % 100);
    n = Math.floor(n / 100);
  }
  if (n > 0) {
    parts.push(n % 100);
    n = Math.floor(n / 100);
  }
  if (n > 0) {
    parts.push(n % 100);
  }

  let words = '';
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] > 0) {
      words = makeWords(parts[i]) + (g[i] ? g[i] + ' ' : '') + words;
    }
  }

  return words.trim() + ' Rupees Only';
};

const getBillingStatementTemplate = (data) => {
  const { query, customer, payments, date, orgSettings, tourCode } = data;
  
  const settings = orgSettings || {};
  const companyName = settings.companyName || process.env.APP_NAME || 'TravelCRM';
  const companyEmail = settings.companyEmail || process.env.APP_EMAIL || 'noreply@travelcrm.app';
  const companyPhone = settings.companyPhone || '+91 99999 99999';
  const companyWebsite = settings.companyWebsite || process.env.APP_DOMAIN || 'travelcrm.app';
  const companyAddress = settings.companyAddress || '2nd Floor, Adventure House, Hill Cart Road, Siliguri, West Bengal - 734001, India';
  const companyLogoUrl = settings.companyLogoUrl || '';
  const companyGst = settings.companyGst || '';
  const companyPan = settings.companyPan || '';
  const bankAccountName = settings.bankAccountName || 'Imagica Holidays';
  const bankName = settings.bankName || 'Indian Bank';
  const bankAccountNumber = settings.bankAccountNumber || '8349072629';
  const bankIfscCode = settings.bankIfscCode || 'IDIB000K688';
  const invoiceBannerUrl = settings.invoiceBannerUrl || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop';
  
  const companyAbbr = getAbbr(companyName);
  const year = new Date().getFullYear();
  const queryNum = query.queryCode ? query.queryCode.split('-').pop() : query.id.slice(0, 6).toUpperCase();
  const invoiceNumber = `${companyAbbr}/INV/${year}/${queryNum.padStart(6, '0')}`;
  
  const referenceId = `#${(query.queryCode || query.id.slice(0, 8)).replace(/-/g, '').toUpperCase()}`;
  const tripId = tourCode || `${companyAbbr}-${queryNum}`;
  const placeOfSupply = getPlaceOfSupply(query.destination);
  const invoiceDate = date;
  
  let guestsText = `${query.adults} Adults`;
  if (query.children > 0) {
    guestsText += `, ${query.children} Child`;
  }
  
  const nightsDaysText = calculateNightsAndDays(query.travelDateFrom, query.travelDateTo);
  const travelDatesFormatted = (query.travelDateFrom && query.travelDateTo) 
    ? `${formatDate(query.travelDateFrom)} - ${formatDate(query.travelDateTo)}`
    : '—';
    
  const isPaidInFull = customer.totalPending <= 0;
  
  const gstRow = '';
  const panRow = '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Tax Invoice - ${invoiceNumber}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Pinyon+Script&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        @page { size: A4; margin: 0; }
        body {
          margin: 0;
          padding: 35px 35px 30px 35px;
          width: 210mm;
          height: 297mm;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          color: #2d3748;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .main-content-wrapper {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        
        /* Layout Grid Components */
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }
        
        .logo-box {
          width: 220px;
        }
        
        .logo-img {
          max-height: 54px;
          max-width: 100%;
          object-fit: contain;
        }
        
        .logo-text-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f3d2f;
          margin: 0;
          letter-spacing: -0.01em;
        }
        
        .logo-text-slogan {
          font-size: 8px;
          letter-spacing: 0.2em;
          color: #c5a059;
          font-weight: 700;
          margin-top: 2px;
        }
        
        .invoice-header-title {
          text-align: center;
          width: 280px;
        }
        
        .invoice-title-text {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #0f3d2f;
          margin: 0;
          letter-spacing: 0.05em;
        }
        
        .invoice-subtitle-text {
          font-size: 9px;
          letter-spacing: 0.25em;
          color: #a0aec0;
          font-weight: 600;
          margin-top: 5px;
          text-transform: uppercase;
        }
        
        .double-divider {
          border-top: 1px solid #c5a059;
          border-bottom: 1px solid #c5a059;
          height: 4px;
          margin: 6px 0;
        }
        
        .stamp-box {
          width: 160px;
          display: flex;
          justify-content: flex-end;
        }
        
        .stamp-badge {
          width: 86px;
          height: 86px;
          border-radius: 50%;
          border: 2px dashed #c5a059;
          background: #0f3d2f;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .stamp-badge.due {
          background: #742a2a;
        }
        
        .stamp-check {
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 1px;
          color: #c5a059;
        }
        
        .stamp-title {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.05em;
          line-height: 1.1;
          text-transform: uppercase;
        }
        
        .stamp-stars {
          font-size: 8px;
          color: #c5a059;
          margin-top: 1px;
          letter-spacing: 0.1em;
        }
        
        /* Three-Column Details Grid */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr 1.25fr;
          gap: 15px;
          margin-bottom: 22px;
        }
        
        .card-container {
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        
        .card-header {
          background: #0f3d2f;
          color: #ffffff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 6px 10px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .card-header svg {
          color: #c5a059;
        }
        
        .card-body {
          padding: 10px;
        }
        
        .details-row {
          display: flex;
          margin-bottom: 5.5px;
          font-size: 9.5px;
          line-height: 1.3;
        }
        
        .details-row:last-child {
          margin-bottom: 0;
        }
        
        .details-label {
          width: 82px;
          color: #718096;
          font-weight: 500;
          flex-shrink: 0;
        }
        
        .details-value {
          color: #2d3748;
          font-weight: 600;
          word-break: break-word;
        }
        
        .company-name-large {
          font-size: 11px;
          font-weight: 700;
          color: #0f3d2f;
          margin-bottom: 2px;
        }
        
        .company-slogan {
          font-size: 8.5px;
          font-style: italic;
          color: #718096;
          margin-bottom: 5px;
        }
        
        .company-address {
          font-size: 8.5px;
          color: #4a5568;
          margin-bottom: 8px;
          line-height: 1.35;
        }
        
        /* Middle Block: Payment Summary & Charges Ledger */
        .ledger-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 22px;
        }
        
        .payment-summary-card {
          width: 24%;
          background: #0f3d2f;
          color: #ffffff;
          border-radius: 5px;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .summary-title {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 6px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .summary-title svg {
          color: #c5a059;
        }
        
        .summary-metric {
          margin-bottom: 10px;
        }
        
        .metric-label {
          font-size: 8px;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        
        .metric-value {
          font-size: 14px;
          font-weight: 700;
        }
        
        .summary-status-badge {
          margin-top: auto;
          border: 1px solid #c5a059;
          border-radius: 20px;
          padding: 5px 8px;
          text-align: center;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        
        .summary-status-badge.due {
          border-color: #fc8181;
          color: #fc8181;
        }
        
        .charges-ledger-card {
          width: 74.5%;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          overflow: hidden;
          background: #ffffff;
        }
        
        .ledger-title-bar {
          background: #0f3d2f;
          color: #ffffff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 6px 10px;
          text-transform: uppercase;
          text-align: center;
        }
        
        table.ledger-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        table.ledger-table th {
          background: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #4a5568;
          padding: 6px 10px;
          text-transform: uppercase;
        }
        
        table.ledger-table td {
          border-bottom: 1px solid #edf2f7;
          padding: 8px 10px;
          font-size: 9.5px;
          color: #2d3748;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .amount-highlight {
          font-weight: 700;
        }
        
        .amount-green {
          color: #38a169;
          font-weight: 700;
        }
        
        .amount-red {
          color: #e53e3e;
          font-weight: 700;
        }
        
        .ledger-subtotal-row td {
          border-top: 1px solid #cbd5e0;
          font-weight: 600;
          background: #fdfdfd;
        }
        
        .ledger-final-row td {
          border-top: 2px solid #0f3d2f;
          font-weight: 700;
          background: #fafafc;
        }
        
        /* Transaction Details Table */
        .transaction-section {
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 22px;
        }
        
        .transaction-title-bar {
          background: #fcf8f2;
          border-bottom: 1px solid #e2e8f0;
          color: #8c6b30;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 6px 10px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        table.transaction-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        table.transaction-table th {
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 8px;
          font-weight: 700;
          color: #718096;
          padding: 6px 10px;
          text-transform: uppercase;
          text-align: left;
        }
        
        table.transaction-table td {
          border-bottom: 1px solid #edf2f7;
          padding: 7px 10px;
          font-size: 9px;
          color: #2d3748;
        }
        
        table.transaction-table tr:last-child td {
          border-bottom: none;
        }
        
        /* Bottom Split Section: Notes and Image Quote */
        .bottom-split {
          display: flex;
          justify-content: space-between;
          margin-bottom: 22px;
        }
        
        .notes-card {
          width: 42%;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          padding: 10px;
          background: #fcfcfc;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        
        .notes-title {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #0f3d2f;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }
        
        .notes-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .notes-item {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin-bottom: 5px;
          font-size: 9px;
          line-height: 1.35;
          color: #4a5568;
        }
        
        .notes-item:last-child {
          margin-bottom: 0;
        }
        
        .notes-check-icon {
          color: #38a169;
          font-weight: bold;
          flex-shrink: 0;
          margin-top: 1px;
        }
        
        .image-quote-card {
          width: 56.5%;
          position: relative;
          border-radius: 5px;
          overflow: hidden;
          background: #0f3d2f;
          height: 120px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .quote-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 0.95;
        }
        
        .quote-overlay-content {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          padding: 12px 15px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(90deg, rgba(15, 61, 47, 0.7) 0%, rgba(15, 61, 47, 0.4) 60%, rgba(15, 61, 47, 0.1) 100%);
          color: #ffffff;
        }
        
        .postcard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: #c5a059;
          text-transform: uppercase;
        }
        
        .postcard-header span {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        
        .quote-text {
          font-family: 'Playfair Display', serif;
          font-size: 11.5px;
          font-style: italic;
          line-height: 1.45;
          font-weight: 500;
          margin: 6px 0;
          max-width: 78%;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
        }
        
        .quote-author {
          font-family: 'Pinyon Script', cursive;
          font-size: 20px;
          color: #c5a059;
          text-align: right;
          margin-top: -2px;
          line-height: 0.8;
        }
        
        /* Bank & Terms Section */
        .bottom-details-grid {
          display: grid;
          grid-template-columns: 1.35fr 0.9fr 1.2fr;
          gap: 15px;
          border-top: 1px solid #edf2f7;
          padding-top: 14px;
          margin-bottom: 18px;
        }
        
        .terms-block {
          font-size: 8px;
          line-height: 1.4;
          color: #718096;
        }
        
        .terms-title-text {
          font-weight: 700;
          color: #4a5568;
          margin-bottom: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        
        .terms-list-ul {
          padding-left: 10px;
          margin: 0;
        }
        
        .terms-list-ul li {
          margin-bottom: 3.5px;
        }
        
        .thankyou-block {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        
        .thankyou-script {
          font-family: 'Pinyon Script', cursive;
          font-size: 26px;
          color: #c5a059;
          line-height: 0.9;
        }
        
        .thankyou-team {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #0f3d2f;
          text-transform: uppercase;
          margin-top: 4px;
        }
        
        .bank-block {
          font-size: 8.5px;
          line-height: 1.4;
        }
        
        .bank-title-text {
          font-weight: 700;
          color: #4a5568;
          margin-bottom: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        
        .bank-row {
          display: flex;
          margin-bottom: 2px;
        }
        
        .bank-label {
          width: 76px;
          color: #718096;
          flex-shrink: 0;
        }
        
        .bank-value-text {
          font-weight: 600;
          color: #2d3748;
        }
        
        /* Dark Social Contact Footer Bar */
        .footer-bar {
          background: #0f3d2f;
          color: #ffffff;
          padding: 8px 15px;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          margin-top: auto;
        }
        
        .footer-contact-group {
          display: flex;
          gap: 18px;
        }
        
        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .footer-contact-item svg {
          color: #c5a059;
        }
        
        .footer-social-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .footer-social-group svg {
          color: #ffffff;
        }
      </style>
    </head>
    <body>
      <div class="main-content-wrapper">
        <!-- Top Header Container -->
        <div class="header-container">
          <!-- Brand Logo Box -->
          <div class="logo-box">
            ${companyLogoUrl ? `
              <img src="${companyLogoUrl}" class="logo-img" alt="${companyName}" />
            ` : `
              <div class="logo-text-title">${companyName}</div>
              <div class="logo-text-slogan">CURATED JOURNEYS. LASTING MEMORIES.</div>
            `}
          </div>
          
          <!-- Tax Invoice Title Block -->
          <div class="invoice-header-title">
            <h1 class="invoice-title-text">BILLING STATEMENT</h1>
            <div class="double-divider"></div>
            <div class="invoice-subtitle-text">${process.env.APP_NAME || 'TravelCRM'} — Internal Ledger Report</div>
          </div>
          
          <!-- Status Stamp Badge -->
          <div class="stamp-box">
            <div class="stamp-badge ${isPaidInFull ? '' : 'due'}">
              <span class="stamp-check">✔</span>
              <span class="stamp-title">${isPaidInFull ? 'PAYMENT<br>COMPLETED' : 'BALANCE<br>DUE'}</span>
              <span class="stamp-stars">★★★★★</span>
            </div>
          </div>
        </div>
        
        <!-- Three Column Details Section -->
        <div class="info-grid">
          <!-- Column 1: Invoice Details -->
          <div class="card-container">
            <div class="card-header">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Invoice Details
            </div>
            <div class="card-body">
              <div class="details-row">
                <span class="details-label">Invoice No.</span>
                <span class="details-value">: ${invoiceNumber}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Reference ID</span>
                <span class="details-value">: ${referenceId}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Trip ID</span>
                <span class="details-value">: ${tripId}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Invoice Date</span>
                <span class="details-value">: ${invoiceDate}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Place of Supply</span>
                <span class="details-value">: ${placeOfSupply}</span>
              </div>
              <div class="details-row">
                <span class="details-label">GST Treatment</span>
                <span class="details-value">: GST Inclusive</span>
              </div>
            </div>
          </div>
          
          <!-- Column 2: Guest Details -->
          <div class="card-container">
            <div class="card-header">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Guest Details
            </div>
            <div class="card-body">
              <div class="details-row">
                <span class="details-label">Guest Name</span>
                <span class="details-value">: ${query.name}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Contact No.</span>
                <span class="details-value">: ${query.phone}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Email</span>
                <span class="details-value">: ${query.email || '—'}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Destination</span>
                <span class="details-value">: ${query.destination || '—'}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Travel Dates</span>
                <span class="details-value">: ${travelDatesFormatted}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Guests</span>
                <span class="details-value">: ${guestsText}</span>
              </div>
              <div class="details-row">
                <span class="details-label">No. of Nights</span>
                <span class="details-value">: ${nightsDaysText}</span>
              </div>
            </div>
          </div>
          
          <!-- Column 3: Company Details -->
          <div class="card-container">
            <div class="card-header">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="15" y1="22" x2="15" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path><path d="M12 14h.01"></path></svg>
              Company Details
            </div>
            <div class="card-body">
              <div class="company-name-large">${companyName}</div>
              <div class="company-slogan">Curated Himalayan Experiences</div>
              <div class="company-address">${companyAddress}</div>
              
              <div class="details-row">
                <span class="details-label">Phone</span>
                <span class="details-value">: ${companyPhone}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Email</span>
                <span class="details-value">: ${companyEmail}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Website</span>
                <span class="details-value">: ${companyWebsite}</span>
              </div>
              ${gstRow}
              ${panRow}
            </div>
          </div>
        </div>
        
        <!-- Payment Summary & Journey Charges Table -->
        <div class="ledger-container">
          <!-- Left Payment Summary Card -->
          <div class="payment-summary-card">
            <div class="summary-title">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="10" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              Payment Summary
            </div>
            
            <div class="summary-metric">
              <div class="metric-label">Total Amount</div>
              <div class="metric-value">${formatCurrency(customer.totalAmount)}</div>
            </div>
            
            <div class="summary-metric">
              <div class="metric-label">Amount Received</div>
              <div class="metric-value">${formatCurrency(customer.totalReceived)}</div>
            </div>
            
            <div class="summary-metric" style="margin-bottom: 0;">
              <div class="metric-label">Balance Due</div>
              <div class="metric-value" style="color: ${isPaidInFull ? '#ffffff' : '#f56565'};">${formatCurrency(customer.totalPending)}</div>
            </div>
            
            <div class="summary-status-badge ${isPaidInFull ? '' : 'due'}">
              <span>✔</span>
              <span>${isPaidInFull ? 'Paid in Full' : 'Amount Due'}</span>
            </div>
          </div>
          
          <!-- Right Ledger Table -->
          <div class="charges-ledger-card">
            <div class="ledger-title-bar">Statement of Journey & Charges</div>
            <table class="ledger-table">
              <thead>
                <tr>
                  <th style="width: 42%; text-align: left;">Description</th>
                  <th style="width: 20%;" class="text-center">Date</th>
                  <th style="width: 18%;" class="text-center">Mode</th>
                  <th style="width: 20%;" class="text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <!-- Base Cost Row -->
                <tr>
                  <td style="font-weight: 600;">Total Itinerary Cost</td>
                  <td class="text-center" style="color: #a0aec0;">—</td>
                  <td class="text-center" style="color: #a0aec0;">—</td>
                  <td class="text-right amount-highlight">${formatCurrency(customer.totalAmount)}</td>
                </tr>
                
                <!-- Payment Received Rows -->
                ${payments.map(p => `
                  <tr>
                    <td style="color: #4a5568; font-weight: 500;">Payment Received (${p.mode.toUpperCase()})</td>
                    <td class="text-center" style="color: #4a5568;">${formatDate(p.paymentDate)}</td>
                    <td class="text-center" style="text-transform: uppercase; color: #4a5568;">${p.mode}</td>
                    <td class="text-right amount-green">- ${formatCurrency(p.amount)}</td>
                  </tr>
                `).join('')}
                
                <!-- Sub Total Row -->
                <tr class="ledger-subtotal-row">
                  <td>SUB TOTAL</td>
                  <td class="text-center">—</td>
                  <td class="text-center">—</td>
                  <td class="text-right">${formatCurrency(customer.totalAmount)}</td>
                </tr>
                
                <!-- Final Rows -->
                <tr class="ledger-final-row">
                  <td colspan="3" style="text-transform: uppercase;">Total Amount</td>
                  <td class="text-right">${formatCurrency(customer.totalAmount)}</td>
                </tr>
                <tr class="ledger-final-row">
                  <td colspan="3" style="text-transform: uppercase; color: #38a169;">Amount Received</td>
                  <td class="text-right amount-green">- ${formatCurrency(customer.totalReceived)}</td>
                </tr>
                <tr class="ledger-final-row">
                  <td colspan="3" style="text-transform: uppercase; color: ${isPaidInFull ? '#2d3748' : '#e53e3e'};">Balance Due</td>
                  <td class="text-right ${isPaidInFull ? '' : 'amount-red'}">${formatCurrency(customer.totalPending)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Transaction Details Section -->
        <div class="transaction-section">
          <div class="transaction-title-bar">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Transaction Details
          </div>
          <table class="transaction-table">
            <thead>
              <tr>
                <th style="width: 18%;">Payment Date</th>
                <th style="width: 16%;">Payment Method</th>
                <th style="width: 25%;">Transaction ID</th>
                <th style="width: 20%;">Bank Reference</th>
                <th style="width: 21%;">Received By</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(p => `
                <tr>
                  <td>${formatDate(p.paymentDate)}</td>
                  <td style="text-transform: uppercase;">${p.mode}</td>
                  <td>${p.referenceUtr || p.id.slice(0, 18).toUpperCase()}</td>
                  <td>${p.notes && p.notes.toLowerCase().includes('bank') ? p.notes : bankName} - ${bankAccountNumber.slice(-4)}</td>
                  <td>${p.user?.name || 'Harsh Buddy'}</td>
                </tr>
              `).join('')}
              ${payments.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align: center; color: #a0aec0; padding: 8px;">No transaction details recorded for verified payments.</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
        
        <!-- Notes and Banner Row -->
        <div class="bottom-split">
          <!-- Notes Section -->
          <div class="notes-card">
            <div class="notes-title">Internal Accounting Notes</div>
            <ul class="notes-list">
              <li class="notes-item">
                <span class="notes-check-icon">✔</span>
                <span>This document is for internal records and bookkeeping verification only.</span>
              </li>
              <li class="notes-item">
                <span class="notes-check-icon">✔</span>
                <span>Verify all transactions against bank ledger and gateway dashboards.</span>
              </li>
              <li class="notes-item">
                <span class="notes-check-icon">✔</span>
                <span>${isPaidInFull ? 'Booking payment is fully settled in the internal system.' : 'Follow up internally for the outstanding balance.'}</span>
              </li>
              <li class="notes-item">
                <span class="notes-check-icon">✔</span>
                <span>Do not share this internal ledger report directly with the customer.</span>
              </li>
            </ul>
          </div>
          
          <!-- Image with Postcard Callout Overlay -->
          <div class="image-quote-card">
            <img src="${invoiceBannerUrl}" class="quote-bg-img" alt="Scenic Background" />
            <div class="quote-overlay-content">
              <div class="postcard-header">
                <span>✉ POSTCARD ✦</span>
                <span>🏔️✈✨</span>
              </div>
              <p class="quote-text">
                "Thank you for travelling with ${process.env.APP_NAME || 'TravelCRM'}."
              </p>
              <div class="quote-author">Team ${process.env.APP_NAME || 'TravelCRM'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bank details and Terms (Always pinned to bottom) -->
      <div>
        <div class="bottom-details-grid">
          <!-- Terms -->
          <div class="terms-block">
            <div class="terms-title-text">Internal Ledger Guidelines</div>
            <ul class="terms-list-ul">
              <li>For internal bookkeeping and audit purposes only. Do not share with customers.</li>
              <li>Reconcile transaction entries against bank statements on a daily basis.</li>
              <li>Ensure bank reference UTR and payment mode details are fully populated.</li>
              <li>Report accounting discrepancies to the team immediately for settlement.</li>
            </ul>
          </div>
          
          <!-- Thank You / Team -->
          <div class="thankyou-block">
            <div class="thankyou-script">Thank You!</div>
            <div class="thankyou-team">TEAM ${companyName.toUpperCase()}</div>
          </div>
          
          <!-- Bank Details -->
          <div class="bank-block">
            <div class="bank-title-text">Bank Details</div>
            <div class="bank-row">
              <span class="bank-label">Account Name</span>
              <span class="bank-value-text">: ${bankAccountName}</span>
            </div>
            <div class="bank-row">
              <span class="bank-label">Bank Name</span>
              <span class="bank-value-text">: ${bankName}</span>
            </div>
            <div class="bank-row">
              <span class="bank-label">Account No.</span>
              <span class="bank-value-text">: ${bankAccountNumber}</span>
            </div>
            <div class="bank-row">
              <span class="bank-label">IFSC Code</span>
              <span class="bank-value-text">: ${bankIfscCode}</span>
            </div>
          </div>
        </div>
        
        <!-- Dark Footer Bar -->
        <div class="footer-bar">
          <div class="footer-contact-group">
            <div class="footer-contact-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              ${companyPhone}
            </div>
            <div class="footer-contact-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              ${companyEmail}
            </div>
            <div class="footer-contact-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              ${companyWebsite}
            </div>
          </div>
          <div class="footer-social-group">
            <!-- Facebook Icon -->
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8H7v3h2v9h3v-9h3.6l.4-3H12V6c0-.9.2-1.2 1-1.2h2.5V1h-4C8.7 1 7 2.5 7 5.5V8h2z"></path></svg>
            <!-- Instagram Icon -->
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            <!-- Youtube Icon -->
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getBillingStatementTemplate };
