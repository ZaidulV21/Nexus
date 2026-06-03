// nexus-backend/src/services/email.service.js
const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  host:   'smtp.sendgrid.net',
  port:   587,
  secure: false,
  auth:   { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
})

const getFromAddress = () => {
  const address = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'hello@nexusmanaged.in'
  const name = process.env.EMAIL_FROM_NAME || 'Nexus Managed Services'
  return `"${name}" <${address}>`
}

const sendEmail = async ({ to, subject, html }) => {
  const fromAddress = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'hello@nexusmanaged.in'
  if (!process.env.SENDGRID_API_KEY) {
    const msg = 'Email failed: SENDGRID_API_KEY is not set.'
    console.error('❌', msg)
    throw new Error(msg)
  }

  if (!process.env.EMAIL_FROM) {
    console.warn('⚠️ EMAIL_FROM is not configured in .env. Using default hello@nexusmanaged.in. Verify this sender in SendGrid.')
  }

  if (fromAddress === 'no-reply@nexusmanaged.in') {
    console.warn('⚠️ Using default SendGrid from address no-reply@nexusmanaged.in. This address must be verified in your SendGrid sender identities or authenticated domain.')
  }

  try {
    console.log(`📧 Sending email → ${to}: ${subject}`)
    console.log(`   From: ${getFromAddress()}`)
    
    await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject,
      html,
    })
    console.log(`✅ Email sent → ${to}: ${subject}`)
  } catch (err) {
    const errorMsg = err.response?.body || err.message || JSON.stringify(err)
    console.error('❌ Email failed:', errorMsg)
    console.error('   Status:', err.response?.status)
    console.error('   To:', to)
    console.error('   From:', getFromAddress())
    throw err
  }
}

const sendEnquiryConfirmation = (to, name) => sendEmail({
  to,
  subject: 'We received your enquiry — Nexus Managed Services',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1A1A1A;padding:24px;text-align:center;">
        <h1 style="color:#C9A84C;margin:0;letter-spacing:0.2em;">NEXUS</h1>
        <p style="color:#999;margin:4px 0 0;font-size:12px;">MANAGED SERVICES</p>
      </div>
      <div style="padding:32px;border:1px solid #eee;">
        <h2 style="color:#1A1A1A;">Hello ${name},</h2>
        <p style="color:#555;line-height:1.7;">Thank you for reaching out to Nexus Managed Services. We have received your request and our team will contact you within <strong>4 business hours</strong>.</p>
        <p style="color:#555;line-height:1.7;">In the meantime, feel free to call us directly:</p>
        <p style="font-size:18px;color:#C9A84C;font-weight:bold;">+91 98765 43210</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#999;font-size:12px;">The Nexus Team · Lucknow, Uttar Pradesh · hello@nexusmanaged.in</p>
      </div>
    </div>`
})

const sendAdminEnquiryAlert = (enquiry) => sendEmail({
  to:      process.env.ADMIN_EMAIL,
  subject: `🔔 New Enquiry: ${enquiry.name} — ${enquiry.company || 'Individual'}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;">
      <h2>New Enquiry Received</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #eee;">${enquiry.name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Phone</td><td style="padding:8px;border:1px solid #eee;">${enquiry.phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #eee;">${enquiry.email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Company</td><td style="padding:8px;border:1px solid #eee;">${enquiry.company || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Services</td><td style="padding:8px;border:1px solid #eee;">${enquiry.servicesRequested?.join(', ')}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Budget</td><td style="padding:8px;border:1px solid #eee;">${enquiry.budget || '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #eee;font-weight:bold;">Message</td><td style="padding:8px;border:1px solid #eee;">${enquiry.message || '—'}</td></tr>
      </table>
      <p><a href="${process.env.FRONTEND_URL}/admin/enquiries">View in Admin Panel →</a></p>
    </div>`
})

const sendClientCredentials = (to, name, password) => sendEmail({
  to,
  subject: 'Your Nexus Client Portal Access — Login Details',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1A1A1A;padding:24px;text-align:center;">
        <h1 style="color:#C9A84C;margin:0;letter-spacing:0.2em;">NEXUS</h1>
      </div>
      <div style="padding:32px;border:1px solid #eee;">
        <h2>Welcome to Nexus, ${name}!</h2>
        <p style="color:#555;">Your project has been confirmed. You can now log in to your client portal to track progress, view documents, and communicate with your project manager.</p>
        <div style="background:#f9f9f9;padding:20px;border-left:4px solid #C9A84C;margin:20px 0;">
          <p style="margin:0;"><strong>Portal URL:</strong> <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
          <p style="margin:8px 0 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin:8px 0 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p style="color:#999;font-size:12px;">Please change your password after first login.</p>
      </div>
    </div>`
})

const sendQuoteEmail = (to, name, quoteNumber, pdfUrl, totalAmount) => sendEmail({
  to,
  subject: `Quote ${quoteNumber} Ready for Review — Nexus`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1A1A1A;padding:24px;text-align:center;">
        <h1 style="color:#C9A84C;margin:0;letter-spacing:0.2em;">NEXUS</h1>
      </div>
      <div style="padding:32px;border:1px solid #eee;">
        <h2>Hello ${name},</h2>
        <p style="color:#555;">Your project quote <strong>${quoteNumber}</strong> is ready for your review.</p>
        <div style="background:#f9f9f9;padding:20px;text-align:center;margin:20px 0;border:1px solid #eee;">
          <p style="margin:0;color:#999;font-size:12px;">TOTAL AMOUNT</p>
          <p style="margin:4px 0;font-size:32px;font-weight:bold;color:#1A1A1A;">₹${Number(totalAmount).toLocaleString('en-IN')}</p>
          <p style="margin:0;color:#999;font-size:11px;">inclusive of GST</p>
        </div>
        <p style="text-align:center;">
          <a href="${pdfUrl}" style="background:#C9A84C;color:#000;padding:12px 32px;text-decoration:none;font-weight:bold;display:inline-block;">Download Quote PDF</a>
        </p>
        <p style="color:#555;">Log in to your portal to <strong>accept or request changes</strong> to this quote.</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard/quotes">View in Portal →</a></p>
      </div>
    </div>`
})

const sendMilestoneComplete = (to, name, milestoneTitle, projectTitle) => sendEmail({
  to,
  subject: `✅ Milestone Complete: ${milestoneTitle}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1A1A1A;padding:24px;text-align:center;">
        <h1 style="color:#C9A84C;margin:0;letter-spacing:0.2em;">NEXUS</h1>
      </div>
      <div style="padding:32px;border:1px solid #eee;">
        <h2>Great progress, ${name}!</h2>
        <p style="color:#555;">A milestone on your project has been completed.</p>
        <div style="background:#f0fff4;border:1px solid #68d391;padding:16px;border-radius:4px;margin:16px 0;">
          <p style="margin:0;font-weight:bold;color:#276749;">✅ ${milestoneTitle}</p>
          <p style="margin:4px 0 0;color:#555;font-size:13px;">Project: ${projectTitle}</p>
        </div>
        <p><a href="${process.env.FRONTEND_URL}/dashboard/projects">View Full Progress →</a></p>
      </div>
    </div>`
})

const sendInvoiceEmail = (to, name, invoiceNumber, amount, pdfUrl, dueDate) => sendEmail({
  to,
  subject: `Invoice ${invoiceNumber} — Nexus Managed Services`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1A1A1A;padding:24px;text-align:center;">
        <h1 style="color:#C9A84C;margin:0;letter-spacing:0.2em;">NEXUS</h1>
      </div>
      <div style="padding:32px;border:1px solid #eee;">
        <h2>Hello ${name},</h2>
        <p>Invoice <strong>${invoiceNumber}</strong> has been raised for your project.</p>
        <div style="background:#f9f9f9;padding:20px;text-align:center;margin:20px 0;">
          <p style="margin:0;color:#999;font-size:12px;">AMOUNT DUE</p>
          <p style="margin:4px 0;font-size:32px;font-weight:bold;">₹${Number(amount).toLocaleString('en-IN')}</p>
          ${dueDate ? `<p style="margin:0;color:#C0392B;font-size:13px;">Due by: ${new Date(dueDate).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}</p>` : ''}
        </div>
        <p style="text-align:center;">
          <a href="${pdfUrl}" style="background:#C9A84C;color:#000;padding:12px 32px;text-decoration:none;font-weight:bold;display:inline-block;">Download Invoice PDF</a>
        </p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard/invoices">View in Portal →</a></p>
      </div>
    </div>`
})

const sendNewMessageNotification = (to, name, senderName, projectTitle) => sendEmail({
  to,
  subject: `New message from ${senderName} — ${projectTitle}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;">
      <h2>New message on your project</h2>
      <p><strong>${senderName}</strong> sent a message on project <strong>${projectTitle}</strong>.</p>
      <p><a href="${process.env.FRONTEND_URL}/dashboard/projects">View Message →</a></p>
    </div>`
})

module.exports = {
  sendEmail,
  sendEnquiryConfirmation,
  sendAdminEnquiryAlert,
  sendClientCredentials,
  sendQuoteEmail,
  sendMilestoneComplete,
  sendInvoiceEmail,
  sendNewMessageNotification,
}
