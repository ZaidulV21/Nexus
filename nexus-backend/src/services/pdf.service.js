// nexus-backend/src/services/pdf.service.js
const puppeteer = require('puppeteer')
const { cloudinary } = require('../middleware/upload')
const { formatDate } = require('../utils/helpers')

const generateAndUploadPDF = async (html, filename) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' } })

    // Upload to Cloudinary as raw file
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'nexus-pdfs', public_id: filename, format: 'pdf' },
        (err, result) => err ? reject(err) : resolve(result)
      ).end(pdfBuffer)
    })
    return result.secure_url
  } finally {
    await browser.close()
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
  .notes { padding:16px 32px; font-size:12px; color:#666; background:#fffbf0; border-top:1px solid #f0e0a0; }
</style></head><body>
<div class="header">
  <div>
    <div class="logo">NEXUS</div>
    <div style="color:#999;font-size:11px;margin-top:4px;">MANAGED SERVICES</div>
  </div>
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
      <td>₹${Number(item.unitPrice||0).toLocaleString('en-IN')}</td>
      <td style="text-align:right;font-weight:500;">₹${Number(item.total||0).toLocaleString('en-IN')}</td>
    </tr>`).join('')}
  </tbody>
</table>
<div class="totals">
  <div class="total-row"><span>Subtotal</span><span>₹${Number(quote.subtotal).toLocaleString('en-IN')}</span></div>
  <div class="total-row"><span>GST (${quote.taxPercent}%)</span><span>₹${Number(quote.taxAmount).toLocaleString('en-IN')}</span></div>
  <div class="total-row grand"><span>Total Amount</span><span>₹${Number(quote.totalAmount).toLocaleString('en-IN')}</span></div>
</div>
${quote.notes ? `<div class="notes"><strong>Terms & Notes:</strong> ${quote.notes}</div>` : ''}
<div class="footer">
  Nexus Managed Services · Lucknow, UP · hello@nexusmanaged.in · +91 98765 43210<br>
  This quotation is valid for 7 days from date of issue.
</div>
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
  .payment { padding:16px 32px; background:#f0fff4; border-top:1px solid #68d391; }
  .footer { background:#f9f9f9; padding:16px 32px; text-align:center; font-size:11px; color:#999; }
  .status-paid { background:#68d391; color:#fff; padding:4px 12px; font-weight:bold; font-size:11px; }
  .status-sent { background:#C9A84C; color:#000; padding:4px 12px; font-weight:bold; font-size:11px; }
</style></head><body>
<div class="header">
  <div><div class="logo">NEXUS</div><div style="color:#999;font-size:11px;margin-top:4px;">MANAGED SERVICES</div></div>
  <div style="text-align:right;color:#999;font-size:11px;">
    <h2 style="color:white;font-size:16px;margin-bottom:4px;">INVOICE</h2>
    <p>${invoice.invoiceNumber}</p>
    <p>Date: ${formatDate(invoice.createdAt)}</p>
    ${invoice.dueDate ? `<p style="color:#ff6b6b;">Due: ${formatDate(invoice.dueDate)}</p>` : ''}
    <div class="${invoice.status === 'PAID' ? 'status-paid' : 'status-sent'}" style="margin-top:8px;">${invoice.status}</div>
  </div>
</div>
<div class="meta">
  <div class="meta-block"><h4>Billed To</h4><p><strong>${client.name}</strong></p><p>${client.companyName||''}</p><p>${client.email}</p></div>
  <div class="meta-block"><h4>Project</h4><p><strong>${project.title}</strong></p><p>${project.location||''}</p></div>
  <div class="meta-block" style="text-align:right;"><h4>From</h4><p><strong>Nexus Managed Services</strong></p><p>Lucknow, Uttar Pradesh</p><p>GSTIN: 09XXXXX0000X1ZX</p></div>
</div>
<table>
  <thead><tr><th>#</th><th>Description</th><th style="text-align:right;">Amount</th></tr></thead>
  <tbody>
    ${(Array.isArray(invoice.items) ? invoice.items : [{description: project.title, amount: invoice.amount}]).map((item,i) => `
    <tr><td style="color:#999;">${i+1}</td><td>${item.description}</td><td style="text-align:right;">₹${Number(item.amount||0).toLocaleString('en-IN')}</td></tr>`).join('')}
  </tbody>
</table>
<div class="totals">
  <div class="total-row"><span>Subtotal</span><span>₹${Number(invoice.amount - invoice.taxAmount).toLocaleString('en-IN')}</span></div>
  <div class="total-row"><span>GST (${invoice.taxPercent}%)</span><span>₹${Number(invoice.taxAmount).toLocaleString('en-IN')}</span></div>
  <div class="total-row grand"><span>Total</span><span>₹${Number(invoice.amount).toLocaleString('en-IN')}</span></div>
</div>
<div class="payment">
  <strong>Payment Details:</strong>
  <p style="margin-top:8px;font-size:12px;color:#555;">
    Account Name: Nexus Managed Services · Bank: HDFC Bank · Account: XXXX XXXX XXXX<br>
    IFSC: HDFC0001234 · UPI: nexus@hdfcbank
  </p>
</div>
<div class="footer">Nexus Managed Services · Lucknow, UP · hello@nexusmanaged.in · +91 98765 43210</div>
</body></html>`

module.exports = { generateAndUploadPDF, generateQuoteHTML, generateInvoiceHTML }
