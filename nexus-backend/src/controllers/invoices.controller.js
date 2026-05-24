// nexus-backend/src/controllers/invoices.controller.js
const { PrismaClient } = require('@prisma/client')
const prisma   = new PrismaClient()
const emailSvc = require('../services/email.service')
const pdfSvc   = require('../services/pdf.service')
const { generateInvoiceNumber, calculateGST } = require('../utils/helpers')

const getAllInvoices = async (req, res, next) => {
  try {
    const { role, id } = req.user
    const where = ['SUPER_ADMIN','ADMIN','PROJECT_MANAGER'].includes(role) ? {} : { project: { clientId: id } }
    const { status } = req.query
    if (status) where.status = status
    const invoices = await prisma.invoice.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { project: { select: { id:true, title:true, client:{ select:{id:true,name:true,email:true} } } } }
    })
    res.json({ invoices })
  } catch (err) { next(err) }
}

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { project: { include: { client: true } } }
    })
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' })
    if (req.user.role === 'CLIENT' && invoice.project.clientId !== req.user.id)
      return res.status(403).json({ error: 'Access denied.' })
    res.json({ invoice })
  } catch (err) { next(err) }
}

const createInvoice = async (req, res, next) => {
  try {
    const { projectId, items, amount, taxPercent = 18, dueDate, notes } = req.body
    if (!projectId || !amount) return res.status(400).json({ error: 'projectId and amount are required.' })

    const { taxAmount }   = calculateGST(Number(amount) / (1 + taxPercent/100), taxPercent)
    const count           = await prisma.invoice.count()
    const invoiceNumber   = generateInvoiceNumber(count)

    const invoice = await prisma.invoice.create({
      data: {
        projectId, invoiceNumber, items, amount: parseFloat(amount),
        taxPercent, taxAmount, notes,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    })
    res.status(201).json({ invoice })
  } catch (err) { next(err) }
}

const sendInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { project: { include: { client: true } } }
    })
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' })

    // Try PDF generation — won't crash if Puppeteer/Cloudinary not set up
    let pdfUrl = null
    try {
      const html = pdfSvc.generateInvoiceHTML(invoice, invoice.project, invoice.project.client)
      pdfUrl     = await pdfSvc.generateAndUploadPDF(html, `invoice-${invoice.invoiceNumber}`)
    } catch (pdfErr) {
      console.warn('Invoice PDF generation failed, continuing:', pdfErr.message)
    }

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data:  { status: 'SENT', ...(pdfUrl && { pdfUrl }) }
    })

    // Send email
    try {
      emailSvc.sendInvoiceEmail(
        invoice.project.client.email,
        invoice.project.client.name,
        invoice.invoiceNumber,
        invoice.amount,
        pdfUrl || `${process.env.FRONTEND_URL}/dashboard/invoices`,
        invoice.dueDate
      )
    } catch (emailErr) {
      console.warn('Invoice email failed:', emailErr.message)
    }

    res.json({ invoice: updated, message: 'Invoice sent successfully.' })
  } catch (err) { next(err) }
}

const markPaid = async (req, res, next) => {
  try {
    const { paymentMethod, transactionRef } = req.body
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data:  { status: 'PAID', paidAt: new Date(), paymentMethod, transactionRef }
    })
    res.json({ invoice })
  } catch (err) { next(err) }
}

module.exports = { getAllInvoices, getInvoice, createInvoice, sendInvoice, markPaid }
