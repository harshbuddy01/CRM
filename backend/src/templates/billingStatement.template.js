// ============================================================
// TravelCRM — Tax Invoice / Billing Statement Template
// ============================================================

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
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
  if (!dest) return 'Delhi (07)';
  const d = dest.toLowerCase();
  if (d.includes('sikkim')) return 'Sikkim (11)';
  if (d.includes('west bengal') || d.includes('darjeeling') || d.includes('pelling') || d.includes('lachung') || d.includes('gangtok')) return 'West Bengal (19)';
  if (d.includes('kerala') || d.includes('munnar')) return 'Kerala (32)';
  if (d.includes('kashmir')) return 'Jammu & Kashmir (01)';
  if (d.includes('himachal') || d.includes('manali')) return 'Himachal Pradesh (02)';
  if (d.includes('rajasthan') || d.includes('jaipur') || d.includes('udaipur')) return 'Rajasthan (08)';
  if (d.includes('srinagar')) return 'Jammu & Kashmir (01)';
  if (d.includes('karnataka') || d.includes('coorg') || d.includes('ooty') || d.includes('tamil nadu')) return 'Tamil Nadu (33)';
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

const getArtisanalTemplate = (data) => {
  const { query, customer, payments, date, orgSettings, tourCode } = data;
  
  const settings = orgSettings || {};
  const companyName = settings.companyName || 'Imagica Holidays Pvt. Ltd.';
  const companyEmail = settings.companyEmail || 'info@imagicaholidays.com';
  const companyPhone = settings.companyPhone || '+91 98765 43210';
  const companyWebsite = settings.companyWebsite || 'www.imagicaholidays.com';
  const companyAddress = settings.companyAddress || '2nd Floor, Adventure House, Hill Cart Road, Siliguri, West Bengal - 734001, India';
  const companyLogoUrl = settings.companyLogoUrl || '';
  const companyGst = settings.companyGst || '';
  const companyPan = settings.companyPan || '';
  const bankAccountName = settings.bankAccountName || companyName;
  const bankName = settings.bankName || 'Yes Bank';
  const bankAccountNumber = settings.bankAccountNumber || '002300800123456';
  const bankIfscCode = settings.bankIfscCode || 'YESB0002308';
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
  
  const gstRow = companyGst ? `
    <div class="details-row">
      <span class="details-label">GSTIN</span>
      <span class="details-value">: ${companyGst}</span>
    </div>
  ` : '';
  
  const panRow = companyPan ? `
    <div class="details-row">
      <span class="details-label">PAN</span>
      <span class="details-value">: ${companyPan}</span>
    </div>
  ` : '';

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
          padding: 22px 25px;
          width: 210mm;
          height: 297mm;
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          color: #2d3748;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        /* Layout Grid Components */
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .logo-box {
          width: 210px;
        }
        
        .logo-img {
          max-height: 48px;
          max-width: 100%;
          object-fit: contain;
        }
        
        .logo-text-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #0f3d2f;
          margin: 0;
          letter-spacing: -0.01em;
        }
        
        .logo-text-slogan {
          font-size: 7px;
          letter-spacing: 0.2em;
          color: #c5a059;
          font-weight: 700;
          margin-top: 1px;
        }
        
        .invoice-header-title {
          text-align: center;
          width: 260px;
        }
        
        .invoice-title-text {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #0f3d2f;
          margin: 0;
          letter-spacing: 0.05em;
        }
        
        .invoice-subtitle-text {
          font-size: 8px;
          letter-spacing: 0.25em;
          color: #a0aec0;
          font-weight: 600;
          margin-top: 4px;
          text-transform: uppercase;
        }
        
        .double-divider {
          border-top: 1px solid #c5a059;
          border-bottom: 1px solid #c5a059;
          height: 3px;
          margin: 5px 0;
        }
        
        .stamp-box {
          width: 150px;
          display: flex;
          justify-content: flex-end;
        }
        
        .stamp-badge {
          width: 82px;
          height: 82px;
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
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 1px;
          color: #c5a059;
        }
        
        .stamp-title {
          font-size: 7.5px;
          font-weight: 800;
          letter-spacing: 0.05em;
          line-height: 1.1;
          text-transform: uppercase;
        }
        
        .stamp-stars {
          font-size: 7px;
          color: #c5a059;
          margin-top: 1px;
          letter-spacing: 0.1em;
        }
        
        /* Three-Column Details Grid */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr 1.25fr;
          gap: 12px;
          margin-bottom: 15px;
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
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 5px 8px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .card-header svg {
          color: #c5a059;
        }
        
        .card-body {
          padding: 8px;
        }
        
        .details-row {
          display: flex;
          margin-bottom: 4.5px;
          font-size: 9px;
          line-height: 1.25;
        }
        
        .details-row:last-child {
          margin-bottom: 0;
        }
        
        .details-label {
          width: 76px;
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
          font-size: 10px;
          font-weight: 700;
          color: #0f3d2f;
          margin-bottom: 1px;
        }
        
        .company-slogan {
          font-size: 7.5px;
          font-style: italic;
          color: #718096;
          margin-bottom: 4px;
        }
        
        .company-address {
          font-size: 8px;
          color: #4a5568;
          margin-bottom: 6px;
          line-height: 1.3;
        }
        
        /* Middle Block: Payment Summary & Charges Ledger */
        .ledger-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .payment-summary-card {
          width: 24%;
          background: #0f3d2f;
          color: #ffffff;
          border-radius: 5px;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .summary-title {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 5px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .summary-title svg {
          color: #c5a059;
        }
        
        .summary-metric {
          margin-bottom: 7px;
        }
        
        .metric-label {
          font-size: 7.5px;
          color: #a0aec0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1px;
        }
        
        .metric-value {
          font-size: 12.5px;
          font-weight: 700;
        }
        
        .summary-status-badge {
          margin-top: auto;
          border: 1px solid #c5a059;
          border-radius: 20px;
          padding: 4px 6px;
          text-align: center;
          font-size: 7.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
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
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 5px 8px;
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
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #4a5568;
          padding: 5px 8px;
          text-transform: uppercase;
        }
        
        table.ledger-table td {
          border-bottom: 1px solid #edf2f7;
          padding: 6px 8px;
          font-size: 8.5px;
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
          margin-bottom: 15px;
        }
        
        .transaction-title-bar {
          background: #fcf8f2;
          border-bottom: 1px solid #e2e8f0;
          color: #8c6b30;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 5px 8px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        table.transaction-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        table.transaction-table th {
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 7.5px;
          font-weight: 700;
          color: #718096;
          padding: 4px 8px;
          text-transform: uppercase;
          text-align: left;
        }
        
        table.transaction-table td {
          border-bottom: 1px solid #edf2f7;
          padding: 5px 8px;
          font-size: 8px;
          color: #2d3748;
        }
        
        table.transaction-table tr:last-child td {
          border-bottom: none;
        }
        
        /* Bottom Split Section: Notes and Image Quote */
        .bottom-split {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .notes-card {
          width: 42%;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          padding: 8px;
          background: #fcfcfc;
        }
        
        .notes-title {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #0f3d2f;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 3px;
          margin-bottom: 6px;
        }
        
        .notes-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .notes-item {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          margin-bottom: 4px;
          font-size: 8px;
          line-height: 1.3;
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
          background: #000000;
          height: 104px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .quote-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.6;
        }
        
        .quote-overlay-content {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: #ffffff;
        }
        
        .quote-mark {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          color: #c5a059;
          line-height: 1;
          margin-bottom: 2px;
        }
        
        .quote-text {
          font-size: 9px;
          line-height: 1.4;
          font-weight: 500;
          margin: 0;
        }
        
        .quote-author {
          font-family: 'Pinyon Script', cursive;
          font-size: 18px;
          color: #c5a059;
          margin-top: 5px;
          text-align: right;
          line-height: 0.8;
        }
        
        /* Bank & Terms Section */
        .bottom-details-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr 1.15fr;
          gap: 12px;
          border-top: 1px solid #edf2f7;
          padding-top: 10px;
          margin-bottom: 12px;
        }
        
        .terms-block {
          font-size: 7.5px;
          line-height: 1.3;
          color: #718096;
        }
        
        .terms-title-text {
          font-weight: 700;
          color: #4a5568;
          margin-bottom: 3px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        
        .terms-list-ul {
          padding-left: 8px;
          margin: 0;
        }
        
        .terms-list-ul li {
          margin-bottom: 2px;
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
          font-size: 24px;
          color: #c5a059;
          line-height: 0.9;
        }
        
        .thankyou-team {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #0f3d2f;
          text-transform: uppercase;
          margin-top: 4px;
        }
        
        .bank-block {
          font-size: 8px;
          line-height: 1.35;
        }
        
        .bank-title-text {
          font-weight: 700;
          color: #4a5568;
          margin-bottom: 3px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        
        .bank-row {
          display: flex;
        }
        
        .bank-label {
          width: 72px;
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
          padding: 6px 12px;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8px;
        }
        
        .footer-contact-group {
          display: flex;
          gap: 15px;
        }
        
        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        
        .footer-contact-item svg {
          color: #c5a059;
        }
        
        .footer-social-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .footer-social-group svg {
          color: #ffffff;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
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
          <h1 class="invoice-title-text">TAX INVOICE</h1>
          <div class="double-divider"></div>
          <div class="invoice-subtitle-text">Thank You For Travelling With Us</div>
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
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="10" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
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
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
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
          <div class="notes-title">Important Notes</div>
          <ul class="notes-list">
            <li class="notes-item">
              <span class="notes-check-icon">✔</span>
              <span>Thank you for choosing ${companyName}.</span>
            </li>
            <li class="notes-item">
              <span class="notes-check-icon">✔</span>
              <span>This invoice is valid for all payments received.</span>
            </li>
            <li class="notes-item">
              <span class="notes-check-icon">✔</span>
              <span>${isPaidInFull ? 'No further payment is due for this booking.' : 'Kindly clear the remaining balance before travel start.'}</span>
            </li>
            <li class="notes-item">
              <span class="notes-check-icon">✔</span>
              <span>For any queries, contact our support team.</span>
            </li>
            <li class="notes-item">
              <span class="notes-check-icon">✔</span>
              <span>We look forward to hosting you again!</span>
            </li>
          </ul>
        </div>
        
        <!-- Image with Quote Overlay -->
        <div class="image-quote-card">
          <img src="${invoiceBannerUrl}" class="quote-bg-img" alt="Scenic Background" />
          <div class="quote-overlay-content">
            <span class="quote-mark">“</span>
            <p class="quote-text">
              Thank you for travelling with us. We hope your Himalayan journey creates memories for life.
            </p>
            <div class="quote-author">Team ${companyName.split(' ')[0]}</div>
          </div>
        </div>
      </div>
      
      <!-- Bank details and Terms -->
      <div class="bottom-details-grid">
        <!-- Terms -->
        <div class="terms-block">
          <div class="terms-title-text">Terms & Conditions</div>
          <ul class="terms-list-ul">
            <li>Check-in: 02:00 PM | Check-out: 11:00 AM (Varies by hotel)</li>
            <li>Early check-in/late check-out is subject to availability.</li>
            <li>Cancellation & refund policy as per booking terms.</li>
            <li>This is a system generated invoice and does not require signature.</li>
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
    </body>
    </html>
  `;
};

module.exports = { getArtisanalTemplate };
