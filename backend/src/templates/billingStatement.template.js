// ============================================================
// TravelCRM — Artisanal Billing Statement Template
// ============================================================

const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};

const getArtisanalTemplate = (data) => {
  const { customer, payments, query, date } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Pinyon+Script&display=swap" rel="stylesheet">
      <style>
        :root {
          --paper: #fcfbf9;
          --ink: #1a1a1a;
          --accent: #a5813b;
          --border: #e2e2e2;
        }
        
        * { box-sizing: border-box; }
        
        body {
          margin: 0;
          padding: 0;
          background-color: var(--paper);
          color: var(--ink);
          font-family: 'EB Garamond', serif;
          line-height: 1.6;
        }

        .paper-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png');
          opacity: 0.5;
          pointer-events: none;
          z-index: 100;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 60px 40px;
          position: relative;
          z-index: 10;
        }

        .header {
          text-align: center;
          margin-bottom: 60px;
          border-bottom: 1px dashed var(--border);
          padding-bottom: 40px;
        }

        .logo-script {
          font-family: 'Pinyon Script', cursive;
          font-size: 52px;
          color: var(--accent);
          margin: 0;
          line-height: 1;
        }

        .subtitle {
          text-transform: uppercase;
          letter-spacing: 0.3em;
          font-size: 10px;
          font-weight: 800;
          margin-top: 10px;
          color: #888;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          margin-bottom: 60px;
          gap: 40px;
        }

        .info-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #999;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 18px;
          font-weight: 500;
        }

        .statement-title {
          font-family: 'Pinyon Script', cursive;
          font-size: 42px;
          text-align: center;
          margin: 40px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }

        th {
          text-align: left;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          padding: 15px 10px;
          border-bottom: 2px solid var(--ink);
        }

        td {
          padding: 20px 10px;
          border-bottom: 1px solid var(--border);
          font-size: 15px;
        }

        .amount-col { text-align: right; font-weight: 600; }

        .summary-box {
          margin-top: 40px;
          background: white;
          border: 1px solid var(--border);
          padding: 30px;
          border-radius: 4px;
          float: right;
          width: 300px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .summary-total {
          border-top: 1px solid var(--ink);
          padding-top: 15px;
          font-size: 24px;
          font-weight: 800;
          color: var(--ink);
        }

        .footer {
          margin-top: 100px;
          clear: both;
          text-align: center;
          border-top: 1px dashed var(--border);
          padding-top: 40px;
        }

        .signature {
          font-family: 'Pinyon Script', cursive;
          font-size: 32px;
          margin-bottom: 10px;
        }

        .ornament {
           color: var(--accent);
           opacity: 0.2;
           font-size: 24px;
           margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div className="paper-overlay"></div>
      <div className="container">
        <div className="header">
          <h1 className="logo-script">Imagica Holidays</h1>
          <div className="subtitle">Curated Himalayan Experiences</div>
        </div>

        <div className="info-grid">
          <div>
            <div className="info-label">Guest Details</div>
            <div className="info-value">${query.name}</div>
            <div className="info-value" style="font-size: 14px; color: #666;">${query.phone || ''}</div>
          </div>
          <div style="text-align: right;">
            <div className="info-label">Statement Date</div>
            <div className="info-value">${date}</div>
            <div className="info-label" style="margin-top: 10px;">Reference ID</div>
            <div className="info-value">#${query.id.slice(-8).toUpperCase()}</div>
          </div>
        </div>

        <div className="statement-title">Statement of Journey</div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Date</th>
              <th>Mode</th>
              <th className="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 600;">Total Itinerary Cost</td>
              <td>—</td>
              <td>—</td>
              <td className="amount-col">${formatCurrency(customer.totalAmount)}</td>
            </tr>
            ${payments.map(p => `
              <tr>
                <td>${p.notes || 'Trip Installment'}</td>
                <td>${new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td style="text-transform: uppercase; font-size: 11px;">${p.mode}</td>
                <td className="amount-col" style="color: #2e7d32;">- ${formatCurrency(p.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div className="summary-box">
          <div className="summary-row">
            <span>Sub-Total</span>
            <span>${formatCurrency(customer.totalAmount)}</span>
          </div>
          <div className="summary-row" style="color: #2e7d32;">
            <span>Received</span>
            <span>- ${formatCurrency(customer.totalReceived)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Balance Due</span>
            <span>${formatCurrency(customer.totalPending)}</span>
          </div>
        </div>

        <div className="footer">
          <div className="ornament">❦</div>
          <div className="signature">Caring for your journey,</div>
          <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.25em;">Team Imagica</div>
          <div style="font-size: 10px; color: #999; margin-top: 40px;">This is a handcrafted digital document. No physical stamp required.</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getArtisanalTemplate };
