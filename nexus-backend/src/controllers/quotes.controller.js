// nexus-backend/src/controllers/quotes.controller.js
const { PrismaClient } = require('@prisma/client')
const prisma    = new PrismaClient()
const emailSvc  = require('../services/email.service')
const pdfSvc    = require('../services/pdf.service')
const { generateQuoteNumber, calculateGST } = require('../utils/helpers')

const getAllQuotes = async (req, res, next) => {
  try {
    const { role, id } = req.user
    const where = ['SUPER_ADMIN','ADMIN','PROJECT_MANAGER'].includes(role) ? {} : { project: { clientId: id } }
    const quotes = await prisma.quote.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { project: { select: { id:true, title:true, client: { select: { id:true, name:true, email:true } } } } }
    })
    res.json({ quotes })
  } catch (err) { next(err) }
}

const getQuote = async (req, res, next) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { project: { include: { client: true, manager: { select:{id:true,name:true,email:true} } } } }
    })
    if (!quote) return res.status(404).json({ error: 'Quote not found.' })
    if (req.user.role === 'CLIENT' && quote.project.clientId !== req.user.id)
      return res.status(403).json({ error: 'Access denied.' })
    res.json({ quote })
  } catch (err) { next(err) }
}

const createQuote = async (req, res, next) => {
  try {
    const { projectId, items, taxPercent = 18, validUntil, notes } = req.body
    if (!projectId || !items?.length) return res.status(400).json({ error: 'projectId and items are required.' })

    const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || Number(item.unitPrice) * (Number(item.quantity) || 1)), 0)
    const { taxAmount, totalAmount } = calculateGST(subtotal, taxPercent)

    const count       = await prisma.quote.count()
    const quoteNumber = generateQuoteNumber(count)

    const quote = await prisma.quote.create({
      data: {
        projectId, quoteNumber, items, subtotal, taxPercent, taxAmount, totalAmount, notes,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7*24*60*60*1000),
      }
    })
    res.status(201).json({ quote })
  } catch (err) { next(err) }
}

const updateQuote = async (req, res, next) => {
  try {
    const { items, taxPercent } = req.body
    let data = { ...req.body }
    if (items) {
      const subtotal = items.reduce((s,i) => s + (Number(i.total) || Number(i.unitPrice)*(Number(i.quantity)||1)), 0)
      const { taxAmount, totalAmount } = calculateGST(subtotal, taxPercent || 18)
      data = { ...data, subtotal, taxAmount, totalAmount }
    }
    const quote = await prisma.quote.update({ where: { id: req.params.id }, data })
    res.json({ quote })
  } catch (err) { next(err) }
}

const sendQuote = async (req, res, next) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { project: { include: { client: true } } }
    })
    if (!quote) return res.status(404).json({ error: 'Quote not found.' })

    // Try to generate PDF — won't crash if it fails
    let pdfUrl = null
    try {
      const html = pdfSvc.generateQuoteHTML(quote, quote.project, quote.project.client)
      pdfUrl     = await pdfSvc.generateAndUploadPDF(html, `quote-${quote.quoteNumber}`)
    } catch (pdfErr) {
      console.warn('PDF generation failed, continuing without PDF:', pdfErr.message)
    }

    const updated = await prisma.quote.update({
      where: { id: quote.id },
      data:  { status: 'SENT', ...(pdfUrl && { pdfUrl }) }
    })

    // Send email (won't crash if SendGrid not configured)
    try {
      emailSvc.sendQuoteEmail(
        quote.project.client.email,
        quote.project.client.name,
        quote.quoteNumber,
        pdfUrl || `${process.env.FRONTEND_URL}/dashboard/quotes`,
        quote.totalAmount
      )
    } catch (emailErr) {
      console.warn('Email send failed:', emailErr.message)
    }

    res.json({ quote: updated, message: 'Quote sent successfully.' })
  } catch (err) { next(err) }
}

const acceptQuote = async (req, res, next) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { project: { include: { client:true } } }
    })
    if (!quote) return res.status(404).json({ error: 'Quote not found.' })
    if (req.user.role === 'CLIENT' && quote.project.clientId !== req.user.id)
      return res.status(403).json({ error: 'Access denied.' })

    const [updatedQuote] = await Promise.all([
      prisma.quote.update({ where: { id: quote.id }, data: { status: 'ACCEPTED' } }),
      prisma.project.update({ where: { id: quote.projectId }, data: { status: 'CONFIRMED' } })
    ])
    res.json({ quote: updatedQuote, message: 'Quote accepted. Project confirmed.' })
  } catch (err) { next(err) }
}

const rejectQuote = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body
    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data:  { status: 'REJECTED', rejectionReason }
    })
    res.json({ quote })
  } catch (err) { next(err) }
}

module.exports = { getAllQuotes, getQuote, createQuote, updateQuote, sendQuote, acceptQuote, rejectQuote }
