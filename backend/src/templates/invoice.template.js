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

const getArtisanalTemplate = (data) => {
  const { query, customer, payments, date, orgSettings, tourCode, proposal, invoiceHeaderBannerUrl: customHeaderUrl, invoiceMiddleBannerUrl: customMiddleUrl, invoiceQrCodeUrl: customQrUrl, invoiceLogoUrl: customLogoUrl } = data;
  
  const settings = orgSettings || {};
  const companyName = settings.companyName || process.env.APP_NAME || 'TravelCRM';
  const companyEmail = settings.companyEmail || process.env.APP_EMAIL || 'noreply@travelcrm.app';
  const companyPhone = settings.companyPhone || '+91 99999 99999';
  const companyWebsite = settings.companyWebsite || process.env.APP_DOMAIN || 'travelcrm.app';
  const companyAddress = settings.companyAddress || '2nd Floor, Adventure House, Hill Cart Road, Siliguri, West Bengal - 734001, India';
  const companyGst = settings.companyGst || '';
  const companyPan = settings.companyPan || '';
  const bankAccountName = settings.bankAccountName || 'Imagica Holidays';
  const bankName = settings.bankName || 'Indian Bank';
  const bankAccountNumber = settings.bankAccountNumber || '8349072629';
  const bankIfscCode = settings.bankIfscCode || 'IDIB000K688';
  
  // Custom Settings Banner and QR assets
  const invoiceHeaderBannerUrl = customHeaderUrl || query?.invoiceHeaderBannerUrl || settings.invoiceHeaderBannerUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop';
  const invoiceMiddleBannerUrl = customMiddleUrl || query?.invoiceMiddleBannerUrl || settings.invoiceMiddleBannerUrl || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1400&auto=format&fit=crop';
  const appDomainForQr = process.env.APP_DOMAIN || 'travelcrm.app';
  const invoiceQrCodeUrl = customQrUrl || settings.invoiceQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2F${appDomainForQr}%2Frate-us`;
  
  const companyAbbr = getAbbr(companyName);
  const year = new Date().getFullYear();
  const queryNum = query.queryCode ? query.queryCode.split('-').pop() : query.id.slice(0, 6).toUpperCase();
  const invoiceNumber = data.invoiceNumber || `${companyAbbr}/INV/${year}/${queryNum.padStart(6, '0')}`;
  
  const referenceId = `#${(query.queryCode || query.id.slice(0, 8)).replace(/-/g, '').toUpperCase()}`;
  const tripId = tourCode || `${companyAbbr}-${queryNum}`;
  const placeOfSupply = getPlaceOfSupply(query.destination);
  const invoiceDate = data.invoiceDate || date;
  const dueDate = data.dueDate || date; // standard due date same as invoice date
  
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
  
  const capitalizedDest = getCapitalizedDestination(query.destination);
  const descriptionText = `${capitalizedDest} Tour Package`;
  const amountInWordsText = numberToWords(totalAmount);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Tax Invoice - ${invoiceNumber}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;800&family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Pinyon+Script&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        @page { size: A4; margin: 0; }
        body {
          margin: 0;
          padding: 0;
          width: 210mm;
          height: 297mm;
          font-family: 'Inter', sans-serif;
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
          background: #f7fafc;
          overflow: hidden;
          margin-bottom: 10px;
          display: block;
        }
        
        .top-banner-img {
          width: 100%;
          height: auto;
          display: block;
        }
        
        /* 3. Details Row Grid (Invoice & Company Details) */
        .details-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
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
          font-family: 'Cinzel', serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
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
          padding: 6px 8px;
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 8px;
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
          gap: 10px;
          margin-bottom: 10px;
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
          font-family: 'Cinzel', serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
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
          aspect-ratio: 1000 / 185;
          background: #f7fafc;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .middle-poster-img {
          width: 100%;
          height: 100%;
          object-fit: fill;
          display: block;
        }

        /* Elegant Company Details Info Row */
        .info-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }
        .info-icon-wrapper {
          background: #f7fafc;
          border: 1px solid #edf2f7;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c5a059;
          flex-shrink: 0;
        }
        .info-icon-wrapper svg {
          width: 9px;
          height: 9px;
        }
        .info-text {
          font-size: 8px;
          color: #2d3748;
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
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #ffffff;
          padding: 10px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          min-height: 128px;
          display: flex;
          flex-direction: column;
        }
        
        .footer-card-title {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          font-weight: 700;
          color: #0f3d2f;
          border-bottom: 1.5px solid #edf2f7;
          padding-bottom: 4px;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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
          gap: 12px;
          flex-grow: 1;
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
          border: 1px solid #c5a059;
          border-radius: 4px;
          padding: 3px 6px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 7.5px;
          font-weight: 700;
          color: #0f3d2f;
          cursor: pointer;
        }
        
        .feedback-qr-img {
          width: 72px;
          height: 72px;
          object-fit: contain;
          border: 2px solid #c5a059;
          border-radius: 6px;
          padding: 2px;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .feedback-arrow {
          margin-left: 2px;
          vertical-align: middle;
          align-self: flex-end;
          margin-bottom: 2px;
        }
        
        /* 8. Bottom Footer Bar with premium design */
        .bottom-footer-bar {
          background: #0f3d2f;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          margin-top: 5px;
          margin-bottom: 5px;
        }
        
        .footer-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .bottom-logo-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bottom-logo-img {
          height: 25px;
          object-fit: contain;
        }

        .bottom-logo-text-group {
          display: flex;
          flex-direction: column;
        }

        .bottom-logo-title {
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .bottom-logo-slogan {
          font-size: 6px;
          color: #a0aec0;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .footer-contact-social-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .bottom-contact-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bottom-contact-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #ffffff;
          font-size: 7.5px;
        }

        .bottom-contact-item svg {
          color: #c5a059;
        }

        .footer-separator-pipe {
          color: #c5a059;
          font-weight: 300;
          opacity: 0.7;
          font-size: 8px;
        }

        .bottom-social-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bottom-social-group svg {
          color: #ffffff;
          cursor: pointer;
        }

        .footer-divider-line {
          border: 0;
          border-top: 1px solid #c5a059;
          margin: 6px 0;
          opacity: 0.6;
          width: 100%;
        }

        .footer-bottom-row {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          position: relative;
          padding-top: 2px;
        }

        .footer-thanks-text {
          text-align: center;
          color: #c5a059;
          font-size: 8px;
          font-weight: 600;
          line-height: 1.4;
        }

        .footer-thanks-text .slogan-line2 {
          color: #e2e8f0;
          font-weight: 400;
          font-size: 7.5px;
        }

        .airplane-path-animation {
          position: absolute;
          right: 0;
          bottom: -2px;
          display: flex;
          align-items: center;
        }

        .airplane-path-svg {
          color: #c5a059;
          opacity: 0.7;
        }
        .amount-highlight {
          font-weight: 700;
          color: #0f3d2f;
        }
        .amount-green {
          font-weight: 700;
          color: #38a169;
        }
      </style>
    </head>
    <body>
      <!-- 1. Top Header Banner -->
      <div class="top-banner-container">
        <img src="${invoiceHeaderBannerUrl}" class="top-banner-img" alt="Header Banner" />
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
                <div class="info-row">
                  <span class="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  </span>
                  <span class="info-text" style="font-weight: 500;">Invoice No.: <span style="font-weight: 700; color: #0f3d2f;">${invoiceNumber}</span></span>
                </div>
                <div class="info-row">
                  <span class="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  </span>
                  <span class="info-text" style="font-weight: 500;">Ref ID: <span style="font-weight: 700;">${referenceId}</span></span>
                </div>
                <div class="info-row">
                  <span class="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                  </span>
                  <span class="info-text" style="font-weight: 500;">Trip ID: <span style="font-weight: 700;">${tripId}</span></span>
                </div>
              </div>
              <div>
                <div class="info-row">
                  <span class="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </span>
                  <span class="info-text" style="font-weight: 500;">Inv Date: <span style="font-weight: 700;">${invoiceDate}</span></span>
                </div>
                <div class="info-row">
                  <span class="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line></svg>
                  </span>
                  <span class="info-text" style="font-weight: 500;">Due Date: <span style="font-weight: 700; color: #e53e3e;">${dueDate}</span></span>
                </div>
                <div class="info-row">
                  <span class="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </span>
                  <span class="info-text" style="font-weight: 500;">Supply: <span style="font-weight: 700;">${placeOfSupply}</span></span>
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
              </div>
              <div style="padding-top: 2px;">
                <div class="info-row">
                  <span class="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </span>
                  <span class="info-text">${companyPhone}</span>
                </div>
                <div class="info-row">
                  <span class="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </span>
                  <span class="info-text">${companyEmail}</span>
                </div>
                <div class="info-row">
                  <span class="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </span>
                  <span class="info-text">${companyWebsite}</span>
                </div>
                ${companyPan ? `
                  <div class="info-row">
                    <span class="info-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="4"></line><line x1="8" y1="2" x2="8" y2="4"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </span>
                    <span class="info-text">PAN: ${companyPan}</span>
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
              <div class="info-row" style="margin-bottom: 6px;">
                <span class="info-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                <span class="info-text" style="font-weight: 700; font-size: 9.5px; color: #0f3d2f;">${query.name}</span>
              </div>
              <div class="info-row">
                <span class="info-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </span>
                <span class="info-text">${query.phone}</span>
              </div>
              <div class="info-row">
                <span class="info-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <span class="info-text">${query.email || '—'}</span>
              </div>
              <div class="info-row" style="margin-top: 6px; border-top: 1px dashed #edf2f7; padding-top: 5px;">
                <span class="info-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </span>
                <span class="info-text" style="font-weight: 600;">Dest: ${query.destination || '—'}</span>
              </div>
              <div class="info-row">
                <span class="info-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </span>
                <span class="info-text">Dates: ${travelDatesFormatted}</span>
              </div>
              <div class="info-row">
                <span class="info-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </span>
                <span class="info-text">Guests: ${guestsText}</span>
              </div>
              <div class="info-row">
                <span class="info-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </span>
                <span class="info-text">Duration: ${durationText}</span>
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
                    <td class="text-right">${formatNumberDec(subtotal)}</td>
                    <td class="text-right amount-highlight">${formatNumberDec(subtotal)}</td>
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
                  <span class="payment-summary-val">${formatCurrencyDec(totalAmount)}</span>
                </div>
                <div class="payment-summary-row">
                  <span class="payment-summary-lbl">Amount Received</span>
                  <span class="payment-summary-val green">${formatCurrencyDec(totalReceived)}</span>
                </div>
                <div class="payment-summary-row">
                  <span class="payment-summary-lbl">Balance Due</span>
                  <span class="payment-summary-val red">${formatCurrencyDec(balanceDue)}</span>
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
                      <td class="text-right amount-highlight">${formatCurrencyDec(p.amount)}</td>
                    </tr>
                  `).join('')}
                  
                  <tr style="background: #fafafc; font-weight: 800; border-top: 1.5px solid #0f3d2f;">
                    <td colspan="3" style="color: #0f3d2f; padding: 6px 10px;">TOTAL RECEIVED</td>
                    <td class="text-right amount-green" style="padding: 6px 10px;">${formatCurrencyDec(totalReceived)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- 6. Middle Polaroid Poster Section -->
        <div class="middle-poster-container">
          <img src="${invoiceMiddleBannerUrl}" class="middle-poster-img" alt="Middle Poster" />
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
            <div class="footer-card-title">RATE YOUR EXPERIENCE</div>
            <div class="feedback-content" style="display: flex; justify-content: space-between; align-items: center; height: calc(100% - 20px);">
              <div class="feedback-text" style="display: flex; flex-direction: column; justify-content: center; gap: 4px;">
                <div class="feedback-stars" style="color: #c5a059; font-size: 11px; font-weight: bold; letter-spacing: 1px;">★★★★★</div>
                <div style="font-size: 7.5px; color: #4a5568; font-weight: 500;">Scan to leave a Google Review</div>
                <div style="font-size: 7.5px; color: #0f3d2f; font-weight: 700; margin-top: 3px; font-family: 'Inter', sans-serif;">${process.env.APP_DOMAIN || 'travelcrm.app'}/rate-us</div>
              </div>
              <img src="${invoiceQrCodeUrl}" class="feedback-qr-img" style="width: 55px; height: 55px; border: 1.5px solid #c5a059; border-radius: 4px; padding: 1px; object-fit: contain;" alt="QR Code" />
            </div>
          </div>
          
          <!-- Card 3: Bank Details -->
          <div class="footer-card">
            <div class="footer-card-title">Bank Details</div>
            <div class="bank-details-wrapper" style="padding-top: 2px;">
              <div class="bank-row" style="margin-bottom: 4px; font-size: 8px;">
                <span style="font-weight: 700; color: #4a5568;">Bank Name:</span>
                <span style="color: #2d3748; margin-left: 2px;">${bankName}</span>
              </div>
              <div class="bank-row" style="margin-bottom: 4px; font-size: 8px;">
                <span style="font-weight: 700; color: #4a5568;">A/C Name:</span>
                <span style="color: #2d3748; margin-left: 2px;">${bankAccountName}</span>
              </div>
              <div class="bank-row" style="margin-bottom: 4px; font-size: 8px;">
                <span style="font-weight: 700; color: #4a5568;">A/C Number:</span>
                <span style="color: #2d3748; margin-left: 2px;">${bankAccountNumber}</span>
              </div>
              <div class="bank-row" style="margin-bottom: 4px; font-size: 8px;">
                <span style="font-weight: 700; color: #4a5568;">IFSC Code:</span>
                <span style="color: #2d3748; margin-left: 2px;">${bankIfscCode}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 8. Bottom Footer Bar with premium design -->
        <div class="bottom-footer-bar">
          <div class="footer-top-row">
            <div class="bottom-logo-group">
              ${companyLogoUrl ? `<img src="${companyLogoUrl}" class="bottom-logo-img" alt="${companyName}" />` : ''}
              <div class="bottom-logo-text-group">
                <div class="bottom-logo-title">${companyName}</div>
                <div class="bottom-logo-slogan">Curated Journeys. Lasting Memories.</div>
              </div>
            </div>
            
            <div class="footer-contact-social-row">
              <div class="bottom-contact-group">
                <div class="bottom-contact-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  ${companyPhone}
                </div>
                <span class="footer-separator-pipe">|</span>
                <div class="bottom-contact-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  ${companyEmail}
                </div>
                <span class="footer-separator-pipe">|</span>
                <div class="bottom-contact-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  ${companyWebsite}
                </div>
              </div>
              <span class="footer-separator-pipe">|</span>
              <div class="bottom-social-group">
                <!-- Facebook Icon -->
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8H7v3h2v9h3v-9h3.6l.4-3H12V6c0-.9.2-1.2 1-1.2h2.5V1h-4C8.7 1 7 2.5 7 5.5V8h2z"></path></svg>
                <!-- Instagram Icon -->
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <!-- Youtube Icon -->
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
              </div>
            </div>
          </div>
          
          <hr class="footer-divider-line" />
          
          <div class="footer-bottom-row">
            <div class="footer-thanks-text">
              Thank you for choosing ${companyName.replace(' Pvt. Ltd.', '')}.
              <br />
              <span class="slogan-line2">We look forward to hosting you again on your next adventure!</span>
            </div>
            
            <div class="airplane-path-animation">
              <svg width="100" height="20" viewBox="0 0 100 20" fill="none" class="airplane-path-svg">
                <path d="M5,15 C30,15 45,2 75,10" stroke="#c5a059" stroke-width="1" stroke-linecap="round" stroke-dasharray="3,3" />
                <g transform="translate(75, 10) rotate(15)">
                  <path d="M-6,0 L2,-2 L8,-7 L10,-7 L6,-2 L11,0 L14,-2 L15,-1 L13,1 L15,3 L14,4 L11,2 L6,4 L10,9 L8,9 L2,4 L-6,2 Z" fill="#c5a059" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};


module.exports = { getArtisanalTemplate };
