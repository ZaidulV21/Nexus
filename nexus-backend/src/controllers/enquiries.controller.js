// nexus-backend/src/controllers/enquiries.controller.js
const { PrismaClient } = require('@prisma/client')
const bcrypt  = require('bcryptjs')
const prisma  = new PrismaClient()
const emailSvc = require('../services/email.service')

const submitEnquiry = async (req, res, next) => {
  try {
    const { name, phone, email, company, servicesRequested, message, budget, city, hearAboutUs, callbackTime, serviceDetails } = req.body
    if (!name || !phone || !email) return res.status(400).json({ error: 'Name, phone, and email are required.' })

    const enquiry = await prisma.enquiry.create({
      data: { 
        name, 
        phone, 
        email, 
        company, 
        city,
        hearAboutUs,
        callbackTime,
        servicesRequested: servicesRequested || [], 
        message, 
        budget,
        serviceDetails: serviceDetails || null
      }
    })

    // Send auto-reply to client and alert to admin (fire and forget)
    emailSvc.sendEnquiryConfirmation(email, name)
    emailSvc.sendAdminEnquiryAlert({ name, phone, email, company, servicesRequested, message, budget, city, hearAboutUs, callbackTime })

    res.status(201).json({ message: 'Enquiry submitted successfully. We will contact you within 4 hours.', enquiry })
  } catch (err) { next(err) }
}

const getAllEnquiries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const where = status ? { status } : {}
    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: Number(limit),
        include: { assignee: { select: { id:true, name:true } } }
      }),
      prisma.enquiry.count({ where })
    ])
    res.json({ enquiries, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

const getEnquiry = async (req, res, next) => {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: req.params.id },
      include: { assignee: { select: { id:true, name:true } } }
    })
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' })
    res.json({ enquiry })
  } catch (err) { next(err) }
}

const updateEnquiry = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.body
    const enquiry = await prisma.enquiry.update({
      where: { id: req.params.id },
      data:  { ...(status && { status }), ...(assignedTo && { assignedTo }) }
    })
    res.json({ enquiry })
  } catch (err) { next(err) }
}

const convertToProject = async (req, res, next) => {
  try {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } })
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' })

    const { title, location, startDate, expectedEndDate } = req.body

    // Check if client account already exists
    let client = await prisma.user.findUnique({ where: { email: enquiry.email } })
    let tempPassword = null

    if (!client) {
      // Create client account
      tempPassword  = `Nexus@${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const passwordHash = await bcrypt.hash(tempPassword, 12)
      client = await prisma.user.create({
        data: {
          name:        enquiry.name,
          email:       enquiry.email,
          phone:       enquiry.phone,
          companyName: enquiry.company,
          passwordHash,
          role:        'CLIENT',
          isVerified:  true,
        }
      })
      // Email login credentials to new client
      emailSvc.sendClientCredentials(enquiry.email, enquiry.name, tempPassword)
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        clientId:  client.id,
        title:     title || `${enquiry.name} — Project`,
        location,
        startDate:       startDate       ? new Date(startDate)       : null,
        expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
        status:    'NEW_ENQUIRY',
      }
    })

    // Mark enquiry as converted
    await prisma.enquiry.update({
      where: { id: enquiry.id },
      data:  { status: 'CONTACTED', convertedProject: project.id }
    })

    res.json({ message: 'Enquiry converted to project.', project, client: { id: client.id, email: client.email } })
  } catch (err) { next(err) }
}

module.exports = { submitEnquiry, getAllEnquiries, getEnquiry, updateEnquiry, convertToProject }
