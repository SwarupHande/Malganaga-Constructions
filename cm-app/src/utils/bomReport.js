import { COMPANY } from '../data/company';
import { COST_CATEGORIES, costItems, estimateItemTotal, formatDMY } from './costs';

// Bill of Materials report on the company letterhead.
// Opens a print-ready page in a new tab and starts the browser's print dialog, where the user picks
// "Save as PDF". Using the browser's PDF export keeps the ₹ sign, fonts and logo exact without a PDF library.

// All user-entered text goes through esc() before it is put into the HTML.
const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const money = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qty = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 3 });

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 1234567 -> "Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven" (Indian numbering).
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
  'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
function twoDigits(n) {
  return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`;
}
function threeDigits(n) {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return [h ? `${ONES[h]} Hundred` : '', rest ? twoDigits(rest) : ''].filter(Boolean).join(' ');
}
export function amountInWords(amount) {
  let n = Math.round(Number(amount || 0));
  if (n === 0) return 'Zero Rupees Only';
  const parts = [];
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (crore) parts.push(`${crore >= 100 ? threeDigits(crore) : twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (n) parts.push(threeDigits(n));
  return `${parts.join(' ')} Rupees Only`;
}

function buildHtml({ project, estimate, stageName, preparedBy }) {
  const items = costItems(estimate);
  const groups = COST_CATEGORIES.map((cat) => ({
    cat,
    items: items.filter((it) => it.category === cat),
  })).filter((g) => g.items.length > 0);
  const subtotal = (g) => g.items.reduce((s, it) => s + estimateItemTotal(it), 0);
  const grand = groups.reduce((s, g) => s + subtotal(g), 0);

  const today = todayISO();
  const bomNo = `BOM/${today.slice(0, 4)}/${esc(project.id).slice(-6).toUpperCase()}/V${estimate.version}`;
  const loc = project.location || {};
  const site = [loc.village, loc.taluka, loc.district, loc.state].filter((x) => x && x !== 'Not specified').join(', ');
  const logoUrl = `${window.location.origin}${COMPANY.logo}`;
  const letters = 'ABCDEFGHIJ';

  const contact = [
    COMPANY.address,
    COMPANY.phone && `Phone: ${COMPANY.phone}`,
    COMPANY.email && `Email: ${COMPANY.email}`,
    COMPANY.website,
    COMPANY.gstin && `GSTIN: ${COMPANY.gstin}`,
  ].filter(Boolean);

  let sr = 0;
  const bodyRows = groups
    .map((g, gi) => {
      const rows = g.items
        .map((it) => {
          sr += 1;
          return `<tr>
            <td class="c">${sr}</td>
            <td>${esc(it.description)}</td>
            <td class="c">${esc(it.unit) || '—'}</td>
            <td class="r">${qty(it.quantity)}</td>
            <td class="r">${money(it.unitRate)}</td>
            <td class="r">${money(estimateItemTotal(it))}</td>
          </tr>`;
        })
        .join('');
      return `<tr class="group"><td class="c">${letters[gi]}</td><td colspan="5">${esc(g.cat)}</td></tr>
        ${rows}
        <tr class="subtotal"><td></td><td colspan="4">${esc(g.cat)} subtotal</td><td class="r">${money(subtotal(g))}</td></tr>`;
    })
    .join('');

  const summaryRows = groups
    .map((g, gi) => `<tr><td>${letters[gi]}. ${esc(g.cat)}</td><td class="r">${g.items.length}</td><td class="r">${money(subtotal(g))}</td></tr>`)
    .join('');

  const title = `BOM_${project.name}_v${estimate.version}`.replace(/[^\w.-]+/g, '_');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm 18mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #1c1d21; font-size: 11.5px; background: #e9e6df; }
  .sheet { background: #fff; max-width: 210mm; margin: 16px auto; padding: 14mm 12mm 18mm; box-shadow: 0 6px 24px rgba(0,0,0,.15); }
  .toolbar { position: sticky; top: 0; z-index: 5; display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap;
             padding: 10px 16px; background: #1b3a5e; color: #fff; font-size: 13px; }
  .toolbar button { font: inherit; font-weight: 600; padding: 8px 16px; border: 0; border-radius: 4px; background: #c8502a; color: #fff; cursor: pointer; }
  .letterhead { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-bottom: 10px; }
  .letterhead img { height: 72px; width: auto; }
  .lh-name { font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 700; color: #1b3a5e; letter-spacing: .02em; }
  .lh-tag { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #9a7a3a; margin-top: 2px; }
  .lh-contact { text-align: right; font-size: 10.5px; line-height: 1.55; color: #45464b; }
  .rule { height: 4px; background: linear-gradient(90deg, #b8893b, #e3c27a 50%, #b8893b); margin-bottom: 2px; }
  .rule2 { height: 1px; background: #1b3a5e; margin-bottom: 16px; }
  h1 { text-align: center; font-size: 16px; letter-spacing: .16em; margin: 4px 0 14px; color: #1b3a5e; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #c9c4b8; margin-bottom: 14px; }
  .meta div { padding: 6px 10px; border-bottom: 1px solid #e3dfd5; }
  .meta div:nth-child(odd) { border-right: 1px solid #e3dfd5; }
  .meta b { display: inline-block; min-width: 92px; color: #5b5c61; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #c9c4b8; padding: 5px 7px; vertical-align: top; }
  thead th { background: #1b3a5e; color: #fff; font-weight: 600; font-size: 10.5px; text-transform: uppercase; letter-spacing: .05em; }
  tr { page-break-inside: avoid; }
  .c { text-align: center; } .r { text-align: right; white-space: nowrap; }
  .group td { background: #f1ede4; font-weight: 700; color: #1b3a5e; }
  .subtotal td { font-weight: 600; background: #faf8f3; }
  .grand td { font-weight: 700; font-size: 12.5px; background: #1b3a5e; color: #fff; }
  .summary { width: 60%; margin: 16px 0 0 auto; }
  .words { margin-top: 10px; padding: 8px 10px; border: 1px dashed #b8893b; background: #fbf7ee; }
  .notes { margin-top: 16px; font-size: 10.5px; color: #45464b; }
  .notes ol { margin: 4px 0 0; padding-left: 18px; }
  .signs { display: flex; justify-content: space-between; gap: 24px; margin-top: 48px; page-break-inside: avoid; }
  .signs div { flex: 1; text-align: center; border-top: 1px solid #1c1d21; padding-top: 6px; font-size: 10.5px; }
  .signs .for { font-weight: 700; color: #1b3a5e; }
  .footer { margin-top: 24px; padding-top: 6px; border-top: 1px solid #c9c4b8; text-align: center; font-size: 9.5px; color: #77787d; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .sheet { margin: 0; padding: 0; box-shadow: none; max-width: none; }
    thead th, .group td, .grand td, .rule, .words { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  @media (max-width: 640px) {
    .sheet { padding: 16px; margin: 0; }
    .letterhead { flex-direction: column; align-items: flex-start; }
    .lh-contact { text-align: left; }
    .meta { grid-template-columns: 1fr; }
    .meta div:nth-child(odd) { border-right: 0; }
    .summary { width: 100%; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <span>Choose <b>“Save as PDF”</b> as the printer to download.</span>
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="sheet">
    <header class="letterhead">
      <div style="display:flex;align-items:center;gap:14px">
        <img src="${esc(logoUrl)}" alt="" onerror="this.style.display='none'" />
        <div>
          <div class="lh-name">${esc(COMPANY.name)}</div>
          ${COMPANY.tagline ? `<div class="lh-tag">${esc(COMPANY.tagline)}</div>` : ''}
        </div>
      </div>
      <div class="lh-contact">${contact.map(esc).join('<br />')}</div>
    </header>
    <div class="rule"></div><div class="rule2"></div>

    <h1>BILL OF MATERIALS</h1>

    <section class="meta">
      <div><b>BOM No.</b> ${bomNo}</div>
      <div><b>Date</b> ${formatDMY(today)}</div>
      <div><b>Project</b> ${esc(project.name)}</div>
      <div><b>Stage</b> ${esc(stageName || '—')}</div>
      <div><b>Site</b> ${esc(site || '—')}</div>
      <div><b>Estimate</b> Version ${estimate.version} (${esc(formatDMY(estimate.createdDate))})</div>
    </section>

    <table>
      <thead>
        <tr>
          <th style="width:42px">Sr.</th>
          <th>Description</th>
          <th style="width:64px">Unit</th>
          <th style="width:70px">Qty</th>
          <th style="width:92px">Rate (₹)</th>
          <th style="width:108px">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${bodyRows || '<tr><td colspan="6" class="c">No items in this estimate.</td></tr>'}
        <tr class="grand"><td></td><td colspan="4">GRAND TOTAL</td><td class="r">₹ ${money(grand)}</td></tr>
      </tbody>
    </table>

    <table class="summary">
      <thead><tr><th>Summary</th><th style="width:60px">Items</th><th style="width:120px">Amount (₹)</th></tr></thead>
      <tbody>
        ${summaryRows}
        <tr class="grand"><td>Total</td><td class="r">${items.length}</td><td class="r">₹ ${money(grand)}</td></tr>
      </tbody>
    </table>

    <div class="words"><b>Amount in words:</b> ${amountInWords(grand)}</div>

    <div class="notes">
      <b>Notes</b>
      <ol>
        <li>Quantities and rates are as per estimate version ${estimate.version} dated ${esc(formatDMY(estimate.createdDate))}.</li>
        <li>Quantities are estimated and may vary as per actual site conditions.</li>
        <li>Rates are subject to change based on market prices at the time of purchase.</li>
      </ol>
    </div>

    <div class="signs">
      <div>Prepared by${preparedBy ? `<br />${esc(preparedBy)}` : ''}</div>
      <div>Checked by</div>
      <div><span class="for">For ${esc(COMPANY.name)}</span><br />Authorised Signatory</div>
    </div>

    <div class="footer">${esc(COMPANY.name)}${COMPANY.address ? ` · ${esc(COMPANY.address)}` : ''} · This is a system-generated report.</div>
  </div>
  <script>
    // Open the print dialog once the logo has loaded.
    window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 300); });
  </script>
</body>
</html>`;
}

// Returns false if the browser blocked the new tab.
export function openBomReport({ project, estimate, stageName, preparedBy }) {
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open();
  win.document.write(buildHtml({ project, estimate, stageName, preparedBy }));
  win.document.close();
  return true;
}
