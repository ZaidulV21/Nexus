// nexus-backend/src/services/pdf.service.js
// PDF generation — uses Puppeteer if available, falls back gracefully on Windows

const { formatDate } = require('../utils/helpers')

const generateAndUploadPDF = async (html, filename) => {
  // Try Puppeteer first
  try {
    const puppeteer  = require('puppeteer')
    const { cloudinary } = require('../middleware/upload')

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: 'new',
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
    })
    await browser.close()

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'nexus-pdfs', public_id: filename, format: 'pdf' },
        (err, result) => err ? reject(err) : resolve(result)
      ).end(pdfBuffer)
    })
    return result.secure_url

  } catch (err) {
    // Puppeteer or Cloudinary not available — return null gracefully
    // Invoice/Quote will still be created and saved, just without PDF URL
    console.warn('PDF generation skipped (Puppeteer/Cloudinary not configured):', err.message)
    return null
  }
}

const generateQuoteHTML = (quote, project, client) => `
<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #333; }
  .header { background: #1A1A1A; color: white; padding: 32px; display:flex; justify-content:space-between; align-items:center; }
  .logo { font-size: 28px; font-weight: bold; letter-spacing: 0.2em; color: #C9A84C; }
  .header-right { text-align:right; font-size:11px; color:#999; }
  .header-right h2 { color:white; font-size:16px; margin-bottom:4px; }
  .meta { padding: 24px 32px; display:flex; justify-content:space-between; border-bottom:1px solid #eee; }
  .meta-block h4 { font-size:10px; text-transform:uppercase; color:#999; letter-spacing:0.1em; margin-bottom:6px; }
  .meta-block p { font-size:13px; color:#333; line-height:1.6; }
  table { width:100%; border-collapse:collapse; margin:0; }
  .items-table th { background:#f5f5f5; padding:10px 16px; text-align:left; font-size:11px; text-transform:uppercase; color:#666; }
  .items-table td { padding:12px 16px; border-bottom:1px solid #f0f0f0; }
  .totals { margin-left:auto; width:280px; padding:0 32px 32px; }
  .total-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; font-size:13px; }
  .total-row.grand { font-weight:bold; font-size:16px; border-bottom:2px solid #C9A84C; padding-top:12px; }
  .footer { background:#f9f9f9; padding:16px 32px; text-align:center; font-size:11px; color:#999; border-top:1px solid #eee; }
  .badge { display:inline-block; padding:4px 12px; background:#C9A84C; color:#000; font-size:11px; font-weight:bold; }
</style></head><body>
<div class="header">
  <div><div class="logo">NEXUS</div><div style="color:#999;font-size:11px;margin-top:4px;">MANAGED SERVICES</div></div>
  <div class="header-right">
    <h2>QUOTATION</h2>
    <p>${quote.quoteNumber}</p>
    <p>Date: ${formatDate(quote.createdAt)}</p>
    ${quote.validUntil ? `<p>Valid Until: ${formatDate(quote.validUntil)}</p>` : ''}
    <div class="badge" style="margin-top:8px;">${quote.status}</div>
  </div>
</div>
<div class="meta">
  <div class="meta-block">
    <h4>Billed To</h4>
    <p><strong>${client.name}</strong></p>
    <p>${client.companyName || ''}</p>
    <p>${client.email}</p>
    <p>${client.phone || ''}</p>
  </div>
  <div class="meta-block">
    <h4>Project</h4>
    <p><strong>${project.title}</strong></p>
    <p>${project.location || ''}</p>
  </div>
  <div class="meta-block" style="text-align:right;">
    <h4>From</h4>
    <p><strong>Nexus Managed Services</strong></p>
    <p>Lucknow, Uttar Pradesh</p>
    <p>hello@nexusmanaged.in</p>
    <p>+91 98765 43210</p>
  </div>
</div>
<table class="items-table">
  <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th style="text-align:right;">Total</th></tr></thead>
  <tbody>
    ${(Array.isArray(quote.items) ? quote.items : []).map((item, i) => `
    <tr>
      <td style="color:#999;">${i+1}</td>
      <td>${item.description}</td>
      <td>${item.quantity || 1}</td>
      <td>${item.unit || 'Lumpsum'}</td>
      <td>Rs ${Number(item.unitPrice||0).toLocaleString('en-IN')}</td>
      <td style="text-align:right;font-weight:500;">Rs ${Number(item.total||0).toLocaleString('en-IN')}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="totals">
  <div class="total-row"><span>Subtotal</span><span>Rs ${Number(quote.subtotal).toLocaleString('en-IN')}</span></div>
  <div class="total-row"><span>GST (${quote.taxPercent}%)</span><span>Rs ${Number(quote.taxAmount).toLocaleString('en-IN')}</span></div>
  <div class="total-row grand"><span>Total Amount</span><span>Rs ${Number(quote.totalAmount).toLocaleString('en-IN')}</span></div>
</div>
${quote.notes ? `<div style="padding:16px 32px;background:#fffbf0;font-size:12px;color:#666;"><strong>Notes:</strong> ${quote.notes}</div>` : ''}
<div class="footer">Nexus Managed Services · Lucknow, UP · hello@nexusmanaged.in · +91 98765 43210</div>
</body></html>`

const generateInvoiceHTML = (invoice, project, client) => `
<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #333; }
  .header { background: #1A1A1A; color: white; padding: 32px; display:flex; justify-content:space-between; align-items:center; }
  .logo { font-size: 28px; font-weight: bold; letter-spacing: 0.2em; color: #C9A84C; }
  .meta { padding: 24px 32px; display:flex; justify-content:space-between; border-bottom:1px solid #eee; }
  .meta-block h4 { font-size:10px; text-transform:uppercase; color:#999; letter-spacing:0.1em; margin-bottom:6px; }
  table { width:100%; border-collapse:collapse; }
  th { background:#f5f5f5; padding:10px 16px; text-align:left; font-size:11px; text-transform:uppercase; color:#666; }
  td { padding:12px 16px; border-bottom:1px solid #f0f0f0; }
  .totals { margin-left:auto; width:280px; padding:0 32px 32px; }
  .total-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee; }
  .total-row.grand { font-weight:bold; font-size:16px; color:#C9A84C; }
  .footer { background:#f9f9f9; padding:16px 32px; text-align:center; font-size:11px; color:#999; }
</style></head><body>
<div class="header">
  <div><div class="logo">NEXUS</div><div style="color:#999;font-size:11px;margin-top:4px;">MANAGED SERVICES</div></div>
  <div style="text-align:right;color:#999;font-size:11px;">
    <h2 style="color:white;font-size:16px;margin-bottom:4px;">INVOICE</h2>
    <p>${invoice.invoiceNumber}</p>
    <p>Date: ${formatDate(invoice.createdAt)}</p>
    ${invoice.dueDate ? `<p style="color:#ff6b6b;">Due: ${formatDate(invoice.dueDate)}</p>` : ''}
  </div>
</div>
<div class="meta">
  <div class="meta-block"><h4>Billed To</h4><p><strong>${client.name}</strong></p><p>${client.companyName||''}</p><p>${client.email}</p></div>
  <div class="meta-block"><h4>Project</h4><p><strong>${project.title}</strong></p><p>${project.location||''}</p></div>
  <div class="meta-block" style="text-align:right;"><h4>From</h4><p><strong>Nexus Managed Services</strong></p><p>Lucknow, UP</p></div>
</div>
<table>
  <thead><tr><th>#</th><th>Description</th><th style="text-align:right;">Amount</th></tr></thead>
  <tbody>
    ${(Array.isArray(invoice.items) && invoice.items.length ? invoice.items : [{description: project.title, amount: invoice.amount}]).map((item,i) => `
    <tr><td style="color:#999;">${i+1}</td><td>${item.description}</td><td style="text-align:right;">Rs ${Number(item.amount||0).toLocaleString('en-IN')}</td></tr>`).join('')}
  </tbody>
</table>
<div class="totals">
  <div class="total-row"><span>Subtotal</span><span>Rs ${Number(invoice.amount - invoice.taxAmount).toLocaleString('en-IN')}</span></div>
  <div class="total-row"><span>GST (${invoice.taxPercent}%)</span><span>Rs ${Number(invoice.taxAmount).toLocaleString('en-IN')}</span></div>
  <div class="total-row grand"><span>Total</span><span>Rs ${Number(invoice.amount).toLocaleString('en-IN')}</span></div>
</div>
<div style="padding:16px 32px;background:#f0fff4;border-top:1px solid #68d391;">
  <strong>Payment:</strong> UPI: nexus@hdfcbank · NEFT: HDFC Bank · Account: XXXX XXXX XXXX
</div>
<div class="footer">Nexus Managed Services · Lucknow, UP · hello@nexusmanaged.in</div>
</body></html>`

module.exports = { generateAndUploadPDF, generateQuoteHTML, generateInvoiceHTML }
