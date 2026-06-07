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

const getArtisanalTemplate = (data) => {
  const { query, customer, payments, date, orgSettings, tourCode, proposal } = data;
  
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
  
  // Custom Settings Banner and QR assets
  const invoiceHeaderBannerUrl = settings.invoiceHeaderBannerUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop';
  const invoiceMiddleBannerUrl = settings.invoiceMiddleBannerUrl || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1400&auto=format&fit=crop';
  const invoiceQrCodeUrl = settings.invoiceQrCodeUrl || 'https://images.unsplash.com/photo-1571867424488-456593dc3f8f?q=80&w=300&auto=format&fit=crop';
  
  const companyAbbr = getAbbr(companyName);
  const year = new Date().getFullYear();
  const queryNum = query.queryCode ? query.queryCode.split('-').pop() : query.id.slice(0, 6).toUpperCase();
  const invoiceNumber = `${companyAbbr}/INV/${year}/${queryNum.padStart(6, '0')}`;
  
  const referenceId = `#${(query.queryCode || query.id.slice(0, 8)).replace(/-/g, '').toUpperCase()}`;
  const tripId = tourCode || `${companyAbbr}-${queryNum}`;
  const placeOfSupply = getPlaceOfSupply(query.destination);
  const invoiceDate = date;
  const dueDate = date; // standard due date same as invoice date
  
  let guestsText = `${query.adults} Adults`;
  if (query.children > 0) {
    guestsText += `, ${query.children} Child`;
  }
  if (query.children > 0 && query.adults > 0) {
    guestsText = `${query.adults} Adults + ${query.children} Child`;
  }
  
  const nightsDaysText = calculateNightsAndDays(query.travelDateFrom, query.travelDateTo);
  const nightsCount = query.travelDateFrom && query.travelDateTo
    ? Math.max(1, Math.ceil((new Date(query.travelDateTo).getTime() - new Date(query.travelDateFrom).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const daysCount = nightsCount + 1;
  const durationText = `${nightsCount} Nights / ${daysCount} Days`;

  const travelDatesFormatted = (query.travelDateFrom && query.travelDateTo) 
    ? `${formatDate(query.travelDateFrom)} - ${formatDate(query.travelDateTo)}`
    : '—';
    
  const totalAmount = Number(customer.totalAmount || 0);
  const totalReceived = Number(customer.totalReceived || 0);
  const balanceDue = Number(customer.totalPending || 0);
  const isPaidInFull = balanceDue <= 0;
  
  // Dynamic GST tax calculation (GST Inclusive)
  const gstPct = Number(proposal?.itinerary?.markupPct || proposal?.markupPct || 0);
  let subtotal = totalAmount;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  const halfGstPct = gstPct / 2;
  
  const companyState = companyAddress.toLowerCase().includes('west bengal') ? 'west bengal' : '';
  const supplyState = placeOfSupply.toLowerCase();
  const isSameState = companyState ? supplyState.includes(companyState) : supplyState.includes('west bengal');
  
  if (gstPct > 0) {
    subtotal = totalAmount / (1 + gstPct / 100);
    const totalGst = totalAmount - subtotal;
    if (isSameState) {
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    } else {
      igst = totalGst;
    }
  }
  
  const descriptionText = `${query.destination || 'Sikkim & Darjeeling'} Tour Package`;
  const amountInWordsText = numberToWords(totalAmount);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Tax Invoice - ${invoiceNumber}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,500;0,700;0,800;1,500;1,700&family=Pinyon+Script&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        @page { size: A4; margin: 0; }
        body {
          margin: 0;
          padding: 0;
          width: 210mm;
          height: 297mm;
          font-family: 'Outfit', sans-serif;
          font-size: 9px;
          color: #2d3748;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .main-content-wrapper {
          padding: 0 25px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        
        /* 1. Header Banner Layout */
        .top-banner-container {
          position: relative;
          width: 100%;
          height: 140px;
          background: #0f3d2f;
          overflow: hidden;
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }
        
        .top-banner-img {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.35;
          z-index: 1;
        }
        
        .top-banner-content {
          position: relative;
          z-index: 2;
          text-align: center;
          width: 100%;
        }
        
        .top-logo-img {
          max-height: 40px;
          object-fit: contain;
          margin-bottom: 2px;
        }
        
        .top-company-name {
          font-family: 'Playfair Display', serif;
          font-size: 19px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.1em;
          text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
        }
        
        .top-company-slogan {
          font-size: 7px;
          letter-spacing: 0.25em;
          color: #c5a059;
          font-weight: 700;
          margin-top: 1px;
          text-transform: uppercase;
        }
        
        .top-invoice-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.08em;
          margin: 6px 0 0 0;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.6);
        }
        
        .top-divider-line {
          width: 140px;
          height: 1.5px;
          background: #c5a059;
          margin: 4px auto;
        }
        
        /* 2. Top Location Icons Bar */
        .locations-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 25px;
          background: #ffffff;
          padding: 8px 0;
          border-bottom: 1.5px solid #edf2f7;
          margin-bottom: 15px;
        }
        
        .location-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 8.5px;
          font-weight: 700;
          color: #4a5568;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .location-item svg {
          color: #c5a059;
        }
        
        /* 3. Details Row Grid (Invoice & Company Details) */
        .details-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .details-card {
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          background: #ffffff;
          overflow: hidden;
        }
        
        .details-card-header {
          background: #0f3d2f;
          color: #ffffff;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.12em;
          padding: 5px 8px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .details-card-header svg {
          color: #c5a059;
        }
        
        .details-card-body {
          padding: 8px 10px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .details-col-val {
          display: flex;
          margin-bottom: 4px;
          font-size: 8.5px;
          line-height: 1.25;
        }
        
        .details-col-val:last-child {
          margin-bottom: 0;
        }
        
        .details-col-lbl {
          width: 70px;
          color: #718096;
          font-weight: 500;
          flex-shrink: 0;
        }
        
        .details-col-txt {
          color: #2d3748;
          font-weight: 700;
        }
        
        .details-col-txt.red-due {
          color: #e53e3e;
        }
        
        .company-info-large {
          font-size: 10px;
          font-weight: 700;
          color: #0f3d2f;
          margin-bottom: 2px;
        }
        
        .company-info-desc {
          font-size: 8px;
          color: #4a5568;
          line-height: 1.35;
          margin-bottom: 4px;
        }
        
        /* 4. Middle Layout Block: Bill To, Summary Table, Payment Summary */
        .middle-block {
          display: grid;
          grid-template-columns: 1fr 2.1fr 1.05fr;
          gap: 12px;
          margin-bottom: 15px;
        }
        
        .middle-card {
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          overflow: hidden;
          background: #ffffff;
        }
        
        .middle-card-header {
          background: #0f3d2f;
          color: #ffffff;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.12em;
          padding: 5px 8px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .middle-card-header svg {
          color: #c5a059;
        }
        
        .middle-card-body {
          padding: 8px;
        }
        
        .billto-row {
          display: flex;
          margin-bottom: 5px;
          font-size: 8.5px;
          line-height: 1.3;
        }
        
        .billto-row:last-child {
          margin-bottom: 0;
        }
        
        .billto-lbl {
          width: 62px;
          color: #718096;
          font-weight: 500;
          flex-shrink: 0;
        }
        
        .billto-val {
          color: #2d3748;
          font-weight: 700;
        }
        
        .billto-name {
          font-size: 10px;
          font-weight: 800;
          color: #0f3d2f;
          margin-bottom: 3px;
        }
        
        /* Invoice Summary table */
        table.summary-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        table.summary-table th {
          background: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 7.5px;
          font-weight: 800;
          color: #4a5568;
          padding: 4px 6px;
          text-transform: uppercase;
        }
        
        table.summary-table td {
          border-bottom: 1px solid #edf2f7;
          padding: 5px 6px;
          font-size: 8.5px;
          color: #2d3748;
        }
        
        .summary-subtotal-row td {
          border-top: 1px solid #cbd5e0;
          font-weight: 600;
          background: #fdfdfd;
          padding: 4px 6px;
        }
        
        .summary-total-row td {
          border-top: 1.5px solid #0f3d2f;
          font-weight: 800;
          background: #fafafc;
          padding: 5px 6px;
        }
        
        .amount-words-box {
          font-size: 7.5px;
          color: #718096;
          margin-top: 6px;
          padding-top: 4px;
          border-top: 1px dashed #e2e8f0;
        }
        
        .amount-words-text {
          font-weight: 800;
          color: #2d3748;
          margin-top: 1px;
        }
        
        /* Payment Summary Card Details */
        .payment-summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 8.5px;
        }
        
        .payment-summary-row:last-child {
          margin-bottom: 0;
        }
        
        .payment-summary-lbl {
          color: #4a5568;
          font-weight: 500;
        }
        
        .payment-summary-val {
          font-weight: 800;
          color: #2d3748;
        }
        
        .payment-summary-val.green {
          color: #38a169;
        }
        
        .payment-summary-val.red {
          color: #e53e3e;
        }
        
        .status-stamp-card {
          margin-top: 10px;
          background: #0f3d2f;
          color: #ffffff;
          border-radius: 4px;
          padding: 8px;
          text-align: center;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.15);
        }
        
        .status-stamp-card.due {
          background: #742a2a;
        }
        
        .status-stamp-title {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        
        .status-stamp-title svg {
          color: #c5a059;
        }
        
        .status-stamp-desc {
          font-size: 7px;
          color: #a0aec0;
          margin-top: 2px;
        }
        
        /* 5. Lower Block: Transaction Details & Payment History */
        .lower-block {
          display: grid;
          grid-template-columns: 1.15fr 1.35fr;
          gap: 12px;
          margin-bottom: 15px;
        }
        
        .lower-card {
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          overflow: hidden;
          background: #ffffff;
        }
        
        .lower-card-header {
          background: #0f3d2f;
          color: #ffffff;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.12em;
          padding: 5px 8px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .lower-card-header svg {
          color: #c5a059;
        }
        
        table.lower-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        table.lower-table th {
          background: #f7fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 7.5px;
          font-weight: 800;
          color: #718096;
          padding: 4px 6px;
          text-transform: uppercase;
          text-align: left;
        }
        
        table.lower-table td {
          border-bottom: 1px solid #edf2f7;
          padding: 5px 6px;
          font-size: 8px;
          color: #2d3748;
        }
        
        table.lower-table tr:last-child td {
          border-bottom: none;
        }
        
        /* 6. Middle Polaroid Poster Section */
        .middle-poster-container {
          position: relative;
          width: 100%;
          height: 110px;
          background: #0f3d2f;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 15px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .middle-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.95;
        }
        
        .middle-poster-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, rgba(15, 61, 47, 0.92) 0%, rgba(15, 61, 47, 0.4) 60%, rgba(15, 61, 47, 0) 100%);
          padding: 15px 25px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: #ffffff;
        }
        
        .middle-poster-quote {
          font-family: 'Playfair Display', serif;
          font-size: 11px;
          font-style: italic;
          line-height: 1.45;
          font-weight: 500;
          max-width: 65%;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
        }
        
        .middle-poster-author {
          font-family: 'Pinyon Script', cursive;
          font-size: 20px;
          color: #c5a059;
          margin-top: 5px;
        }
        
        /* 7. Footer Cards Layout */
        .footer-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          border-top: 1px solid #edf2f7;
          padding-top: 12px;
          margin-bottom: 12px;
        }
        
        .footer-card {
          padding: 5px;
        }
        
        .footer-card-title {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #0f3d2f;
          text-transform: uppercase;
          border-bottom: 1.5px solid #0f3d2f;
          padding-bottom: 3px;
          margin-bottom: 6px;
        }
        
        .footer-card-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .footer-card-item {
          display: flex;
          align-items: flex-start;
          gap: 4px;
          margin-bottom: 4px;
          font-size: 8px;
          line-height: 1.3;
          color: #4a5568;
        }
        
        .footer-card-check-icon {
          color: #38a169;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .feedback-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        
        .feedback-text {
          font-size: 7.5px;
          line-height: 1.35;
          color: #4a5568;
        }
        
        .feedback-stars {
          color: #c5a059;
          font-size: 9px;
          margin-bottom: 2px;
        }
        
        .feedback-btn {
          margin-top: 5px;
          background: #ffffff;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
          padding: 3px 6px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 7.5px;
          font-weight: 700;
          color: #4a5568;
          cursor: pointer;
        }
        
        .feedback-qr-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
          padding: 1px;
          background: #ffffff;
        }
        
        /* 8. Bottom Footer Bar with gradient */
        .bottom-footer-bar {
          background: #0f3d2f;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8px;
          margin-bottom: 4px;
        }
        
        .bottom-logo-group {
          display: flex;
          flex-direction: column;
        }
        
        .bottom-logo-title {
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        
        .bottom-logo-slogan {
          font-size: 6px;
          color: #a0aec0;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 1px;
        }
        
        .bottom-contact-group {
          display: flex;
          gap: 15px;
        }
        
        .bottom-contact-item {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        
        .bottom-contact-item svg {
          color: #c5a059;
        }
        
        .bottom-social-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .bottom-gradient-block {
          background: linear-gradient(90deg, #0f3d2f 0%, #c5a059 50%, #0f3d2f 100%);
          color: #ffffff;
          padding: 5px;
          border-radius: 4px;
          text-align: center;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
      </style>
    </head>
    <body>
      <!-- 1. Top Header Banner -->
      <div class="top-banner-container">
        <img src="${invoiceHeaderBannerUrl}" class="top-banner-img" alt="Header Banner" />
        <div class="top-banner-content">
          ${companyLogoUrl ? `
            <img src="${companyLogoUrl}" class="top-logo-img" alt="${companyName}" />
          ` : `
            <div class="top-company-name">${companyName}</div>
            <div class="top-company-slogan">CURATED JOURNEYS. LASTING MEMORIES.</div>
          `}
          <h1 class="top-invoice-title">TAX INVOICE</h1>
          <div class="top-divider-line"></div>
        </div>
      </div>
      
      <!-- 2. Locations Bar -->
      <div class="locations-bar">
        <div class="location-item">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
          Kashmir
        </div>
        <div class="location-item">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          Sikkim
        </div>
        <div class="location-item">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          Gangtok
        </div>
        <div class="location-item">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Kerala
        </div>
        <div class="location-item">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
          Across India
        </div>
      </div>
      
      <!-- Wrapper for main body cards with margins -->
      <div class="main-content-wrapper">
        <!-- 3. Details Row Grid -->
        <div class="details-grid">
          <!-- Column 1: Invoice Details -->
          <div class="details-card">
            <div class="details-card-header">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Invoice Details
            </div>
            <div class="details-card-body">
              <div>
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
              </div>
              <div>
                <div class="details-row">
                  <span class="details-label">Invoice Date</span>
                  <span class="details-value">: ${invoiceDate}</span>
                </div>
                <div class="details-row">
                  <span class="details-label">Due Date</span>
                  <span class="details-value red-due">: ${dueDate}</span>
                </div>
                <div class="details-row">
                  <span class="details-label">Place of Supply</span>
                  <span class="details-value">: ${placeOfSupply}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Column 2: Company Details -->
          <div class="details-card">
            <div class="details-card-header">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="15" y1="22" x2="15" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path><path d="M12 14h.01"></path></svg>
              Company Details
            </div>
            <div class="details-card-body">
              <div>
                <div class="company-info-large">${companyName}</div>
                <div class="company-info-desc">${companyAddress.slice(0, companyAddress.indexOf(',', 45)) || companyAddress}</div>
                ${companyGst ? `
                  <div class="details-row" style="margin-top: 4px;">
                    <span class="details-label">GSTIN</span>
                    <span class="details-value">: ${companyGst}</span>
                  </div>
                ` : ''}
              </div>
              <div style="padding-top: 2px;">
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
                ${companyPan ? `
                  <div class="details-row">
                    <span class="details-label">PAN</span>
                    <span class="details-value">: ${companyPan}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 4. Middle Layout Block -->
        <div class="middle-block">
          <!-- Column 1: Bill To -->
          <div class="middle-card">
            <div class="middle-card-header">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Bill To
            </div>
            <div class="middle-card-body">
              <div class="billto-name">${query.name}</div>
              <div class="billto-row">
                <span class="billto-lbl">Phone</span>
                <span class="billto-val">: ${query.phone}</span>
              </div>
              <div class="billto-row">
                <span class="billto-lbl">Email</span>
                <span class="billto-val">: ${query.email || '—'}</span>
              </div>
              <div class="billto-row" style="margin-top: 6px; border-top: 1px dashed #edf2f7; padding-top: 5px;">
                <span class="billto-lbl">Destination</span>
                <span class="billto-val">: ${query.destination || '—'}</span>
              </div>
              <div class="billto-row">
                <span class="billto-lbl">Travel Dates</span>
                <span class="billto-val">: ${travelDatesFormatted}</span>
              </div>
              <div class="billto-row">
                <span class="billto-lbl">Guests</span>
                <span class="billto-val">: ${guestsText}</span>
              </div>
              <div class="billto-row">
                <span class="billto-lbl">Duration</span>
                <span class="billto-val">: ${durationText}</span>
              </div>
            </div>
          </div>
          
          <!-- Column 2: Invoice Summary (Middle Table) -->
          <div class="middle-card">
            <div class="middle-card-header">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Invoice Summary
            </div>
            <div class="middle-card-body" style="padding: 0;">
              <table class="summary-table">
                <thead>
                  <tr>
                    <th style="width: 6%; text-align: center;">#</th>
                    <th style="width: 44%; text-align: left;">Description</th>
                    <th style="width: 16%; text-align: center;">HSN/SAC</th>
                    <th style="width: 8%; text-align: center;">Qty</th>
                    <th style="width: 13%; text-align: right;">Rate (₹)</th>
                    <th style="width: 13%; text-align: right;">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-center">1</td>
                    <td style="font-weight: 600;">${descriptionText}</td>
                    <td class="text-center">998552</td>
                    <td class="text-center">1</td>
                    <td class="text-right">${formatCurrencyDec(subtotal)}</td>
                    <td class="text-right amount-highlight">${formatCurrencyDec(subtotal)}</td>
                  </tr>
                  
                  <!-- Subtotal row -->
                  <tr class="summary-subtotal-row">
                    <td colspan="4"></td>
                    <td class="text-right">SUBTOTAL</td>
                    <td class="text-right">${formatCurrencyDec(subtotal)}</td>
                  </tr>
                  
                  <!-- GST rows -->
                  ${cgst > 0 ? `
                    <tr class="summary-subtotal-row" style="background: none; font-weight: 500;">
                      <td colspan="4"></td>
                      <td class="text-right" style="color: #718096;">CGST (${halfGstPct}%)</td>
                      <td class="text-right" style="color: #4a5568;">${formatCurrencyDec(cgst)}</td>
                    </tr>
                    <tr class="summary-subtotal-row" style="background: none; font-weight: 500;">
                      <td colspan="4"></td>
                      <td class="text-right" style="color: #718096;">SGST (${halfGstPct}%)</td>
                      <td class="text-right" style="color: #4a5568;">${formatCurrencyDec(sgst)}</td>
                    </tr>
                  ` : ''}
                  ${igst > 0 ? `
                    <tr class="summary-subtotal-row" style="background: none; font-weight: 500;">
                      <td colspan="4"></td>
                      <td class="text-right" style="color: #718096;">IGST (${gstPct}%)</td>
                      <td class="text-right" style="color: #4a5568;">${formatCurrencyDec(igst)}</td>
                    </tr>
                  ` : ''}
                  
                  <!-- Total amount row -->
                  <tr class="summary-total-row">
                    <td colspan="4" style="background: none;"></td>
                    <td class="text-right">TOTAL AMOUNT</td>
                    <td class="text-right amount-highlight">${formatCurrencyDec(totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
              <div style="padding: 6px 10px;">
                <div class="amount-words-box">
                  <span>Amount In Words</span>
                  <div class="amount-words-text">${amountInWordsText}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Column 3: Payment Summary -->
          <div class="middle-card">
            <div class="middle-card-header">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="10" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              Payment Summary
            </div>
            <div class="middle-card-body" style="display: flex; flex-direction: column; height: calc(100% - 22px); justify-content: space-between;">
              <div>
                <div class="payment-summary-row">
                  <span class="payment-summary-lbl">Package Amount</span>
                  <span class="payment-summary-val">${formatCurrency(totalAmount)}</span>
                </div>
                <div class="payment-summary-row">
                  <span class="payment-summary-lbl">Amount Received</span>
                  <span class="payment-summary-val green">${formatCurrency(totalReceived)}</span>
                </div>
                <div class="payment-summary-row">
                  <span class="payment-summary-lbl">Balance Due</span>
                  <span class="payment-summary-val red">${formatCurrency(balanceDue)}</span>
                </div>
              </div>
              
              <div class="status-stamp-card ${isPaidInFull ? '' : 'due'}">
                <div class="status-stamp-title">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ${isPaidInFull ? 'PAID IN FULL' : 'BALANCE DUE'}
                </div>
                <div class="status-stamp-desc">
                  ${isPaidInFull ? 'Thank you! Your payment has been received.' : 'Please clear the pending balance on time.'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 5. Lower Block (Transaction Details & Payment History) -->
        <div class="lower-block">
          <!-- Column 1: Transaction Details -->
          <div class="lower-card">
            <div class="lower-card-header">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Transaction Details
            </div>
            <div class="middle-card-body" style="padding: 0;">
              <table class="lower-table">
                <tbody>
                  ${payments.length > 0 ? `
                    <tr>
                      <td style="width: 35%; color: #718096; font-weight: 500;">Payment Date</td>
                      <td style="font-weight: 700;">${formatDate(payments[payments.length - 1].paymentDate)}</td>
                    </tr>
                    <tr>
                      <td style="color: #718096; font-weight: 500;">Payment Method</td>
                      <td style="text-transform: uppercase; font-weight: 700;">${payments[payments.length - 1].mode}</td>
                    </tr>
                    <tr>
                      <td style="color: #718096; font-weight: 500;">Transaction ID</td>
                      <td style="font-weight: 700;">${payments[payments.length - 1].referenceUtr || payments[payments.length - 1].id.slice(0, 18).toUpperCase()}</td>
                    </tr>
                    <tr>
                      <td style="color: #718096; font-weight: 500;">Bank Reference</td>
                      <td style="font-weight: 700;">${payments[payments.length - 1].notes && payments[payments.length - 1].notes.toLowerCase().includes('bank') ? payments[payments.length - 1].notes : bankName + ' - ' + bankAccountNumber.slice(-4)}</td>
                    </tr>
                    <tr>
                      <td style="color: #718096; font-weight: 500;">Received By</td>
                      <td style="font-weight: 700;">${payments[payments.length - 1].user?.name || companyName}</td>
                    </tr>
                    <tr>
                      <td style="color: #718096; font-weight: 500;">Remarks</td>
                      <td style="color: #38a169; font-weight: 700;">Payment Received Successfully</td>
                    </tr>
                  ` : `
                    <tr>
                      <td colspan="2" style="text-align: center; color: #a0aec0; padding: 15px;">No transactions recorded.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Column 2: Payment History -->
          <div class="lower-card">
            <div class="lower-card-header">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Payment History
            </div>
            <div class="middle-card-body" style="padding: 0;">
              <table class="lower-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Mode</th>
                    <th>Transaction ID</th>
                    <th class="text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${payments.map(p => `
                    <tr>
                      <td>${formatDate(p.paymentDate)}</td>
                      <td style="text-transform: uppercase; font-weight: 600;">${p.mode}</td>
                      <td>${p.referenceUtr || p.id.slice(0, 18).toUpperCase()}</td>
                      <td class="text-right amount-highlight">${formatCurrency(p.amount)}</td>
                    </tr>
                  `).join('')}
                  
                  <tr style="background: #fafafc; font-weight: 800; border-top: 1.5px solid #0f3d2f;">
                    <td colspan="3" style="color: #0f3d2f; padding: 6px 10px;">TOTAL RECEIVED</td>
                    <td class="text-right amount-green" style="padding: 6px 10px;">${formatCurrency(totalReceived)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- 6. Middle Polaroid Poster Section -->
        <div class="middle-poster-container">
          <img src="${invoiceMiddleBannerUrl}" class="middle-poster-img" alt="Middle Poster" />
          <div class="middle-poster-overlay">
            <p class="middle-poster-quote">
              "Thank you for travelling with us. We hope your journey creates memories that last a lifetime."
            </p>
            <div class="middle-poster-author">Team ${companyName.split(' ')[0]}</div>
          </div>
        </div>
      </div>
      
      <!-- 7. Footer Cards Layout -->
      <div style="padding: 0 25px;">
        <div class="footer-cards-grid">
          <!-- Card 1: Important Notes -->
          <div class="footer-card">
            <div class="footer-card-title">Important Notes</div>
            <ul class="footer-card-list">
              <li class="footer-card-item">
                <span class="footer-card-check-icon">✔</span>
                <span>This is a system generated tax invoice.</span>
              </li>
              <li class="footer-card-item">
                <span class="footer-card-check-icon">✔</span>
                <span>All services are provided as per the itinerary & inclusions mentioned.</span>
              </li>
              <li class="footer-card-item">
                <span class="footer-card-check-icon">✔</span>
                <span>No refund for unused services.</span>
              </li>
              <li class="footer-card-item">
                <span class="footer-card-check-icon">✔</span>
                <span>Please carry a copy of this invoice during your travel.</span>
              </li>
            </ul>
          </div>
          
          <!-- Card 2: Google Review Feedback QR -->
          <div class="footer-card">
            <div class="footer-card-title">We Value Your Feedback</div>
            <div class="feedback-content">
              <div class="feedback-text">
                <div class="feedback-stars">★★★★★</div>
                If you enjoyed our service, please take a moment to review us on Google.
                <br />
                Your feedback motivates us to create more amazing journeys.
                <br />
                <div class="feedback-btn">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style="color: #4285F4;"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg>
                  Review us on Google
                </div>
              </div>
              <img src="${invoiceQrCodeUrl}" class="feedback-qr-img" alt="QR Code" />
            </div>
          </div>
          
          <!-- Card 3: Journey Highlights -->
          <div class="footer-card">
            <div class="footer-card-title">Journey Highlights</div>
            <ul class="footer-card-list">
              <li class="footer-card-item">
                <span class="footer-card-check-icon">✔</span>
                <span>Handpicked Destinations</span>
              </li>
              <li class="footer-card-item">
                <span class="footer-card-check-icon">✔</span>
                <span>Comfort & Luxury</span>
              </li>
              <li class="footer-card-item">
                <span class="footer-card-check-icon">✔</span>
                <span>Best Price Guarantee</span>
              </li>
              <li class="footer-card-item">
                <span class="footer-card-check-icon">✔</span>
                <span>24x7 Customer Support</span>
              </li>
              <li class="footer-card-item">
                <span class="footer-card-check-icon">✔</span>
                <span>Safe & Memorable Experiences</span>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- 8. Bottom Footer Bar with gradient -->
        <div class="bottom-footer-bar">
          <div class="bottom-logo-group">
            <div class="bottom-logo-title">${companyName}</div>
            <div class="bottom-logo-slogan">Curated Journeys. Lasting Memories.</div>
          </div>
          <div class="bottom-contact-group">
            <div class="bottom-contact-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              ${companyPhone}
            </div>
            <div class="bottom-contact-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              ${companyEmail}
            </div>
            <div class="bottom-contact-item">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              ${companyWebsite}
            </div>
          </div>
          <div class="bottom-social-group">
            <!-- Facebook Icon -->
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8H7v3h2v9h3v-9h3.6l.4-3H12V6c0-.9.2-1.2 1-1.2h2.5V1h-4C8.7 1 7 2.5 7 5.5V8h2z"></path></svg>
            <!-- Instagram Icon -->
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            <!-- Youtube Icon -->
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
          </div>
        </div>
        
        <div class="bottom-gradient-block">
          Thank you for choosing ${companyName}. We look forward to hosting you again on your next adventure! ✈️
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getArtisanalTemplate };
