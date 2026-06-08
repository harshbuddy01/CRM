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
  const { query, customer, payments, date, orgSettings, tourCode, proposal, invoiceHeaderBannerUrl: customHeaderUrl, invoiceMiddleBannerUrl: customMiddleUrl, invoiceQrCodeUrl: customQrUrl, invoiceLogoUrl: customLogoUrl } = data;
  
  const settings = orgSettings || {};
  const companyName = settings.companyName || 'Imagica Holidays Pvt. Ltd.';
  const companyEmail = settings.companyEmail || 'info@imagicaholidays.com';
  const companyPhone = settings.companyPhone || '+91 98765 43210';
  const companyWebsite = settings.companyWebsite || 'www.imagicaholidays.com';
  const companyAddress = settings.companyAddress || '2nd Floor, Adventure House, Hill Cart Road, Siliguri, West Bengal - 734001, India';
  const companyLogoUrl = customLogoUrl || settings.companyLogoUrl || '';
  const companyGst = settings.companyGst || '';
  const companyPan = settings.companyPan || '';
  const bankAccountName = settings.bankAccountName || companyName;
  const bankName = settings.bankName || 'Yes Bank';
  const bankAccountNumber = settings.bankAccountNumber || '002300800123456';
  const bankIfscCode = settings.bankIfscCode || 'YESB0002308';
  
  // Custom Settings Banner and QR assets
  const invoiceHeaderBannerUrl = customHeaderUrl || query?.invoiceHeaderBannerUrl || settings.invoiceHeaderBannerUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop';
  const invoiceMiddleBannerUrl = customMiddleUrl || query?.invoiceMiddleBannerUrl || settings.invoiceMiddleBannerUrl || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1400&auto=format&fit=crop';
  const invoiceQrCodeUrl = customQrUrl || settings.invoiceQrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fimagicaholidays.com%2Frate-us';
  
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
                ${companyGst ? `
                  <div class="details-row" style="margin-top: 4px;">
                    <span class="details-label">GSTIN</span>
                    <span class="details-value">: ${companyGst}</span>
                  </div>
                ` : ''}
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
                <div style="font-size: 7.5px; color: #0f3d2f; font-weight: 700; margin-top: 3px; font-family: 'Inter', sans-serif;">imagicaholidays.com/rate-us</div>
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

const getBillingStatementTemplate = (data) => {
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
          opacity: 0.65;
        }
        
        .quote-overlay-content {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          padding: 12px 15px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(90deg, rgba(15, 61, 47, 0.95) 0%, rgba(15, 61, 47, 0.75) 50%, rgba(15, 61, 47, 0.1) 100%);
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
          
          <!-- Image with Postcard Callout Overlay -->
          <div class="image-quote-card">
            <img src="${invoiceBannerUrl}" class="quote-bg-img" alt="Scenic Background" />
            <div class="quote-overlay-content">
              <div class="postcard-header">
                <span>✉ POSTCARD ✦</span>
                <span>🏔️✈✨</span>
              </div>
              <p class="quote-text">
                "Thank you for travelling with us. We hope your Himalayan journey creates beautiful memories for life."
              </p>
              <div class="quote-author">Team ${companyName.split(' ')[0]} 🌸</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bank details and Terms (Always pinned to bottom) -->
      <div>
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
      </div>
    </body>
    </html>
  `;
};

module.exports = { getArtisanalTemplate, getBillingStatementTemplate };
