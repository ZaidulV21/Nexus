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

const buildServiceNotes = (serviceName, detail) => {
  if (!detail || typeof detail !== 'object') return null
  const lines = [`Service: ${serviceName}`]
  Object.entries(detail).forEach(([key, value]) => {
    const rendered = Array.isArray(value) ? value.join(', ') : String(value)
    lines.push(`  ${key.replace(/([A-Z])/g, ' $1').trim()}: ${rendered}`)
  })
  return lines.join('\n')
}

const buildProjectNotes = (enquiry) => {
  const sections = ['Client Enquiry Summary']

  if (Array.isArray(enquiry.servicesRequested) && enquiry.servicesRequested.length > 0) {
    enquiry.servicesRequested.forEach(service => {
      sections.push(`Service: ${service}`)
      const detail = enquiry.serviceDetails?.[service] || enquiry.serviceDetails?.[service.toLowerCase()]
      if (detail && typeof detail === 'object') {
        Object.entries(detail).forEach(([key, value]) => {
          const rendered = Array.isArray(value) ? value.join(', ') : String(value)
          sections.push(`  ${key.replace(/([A-Z])/g, ' $1').trim()}: ${rendered}`)
        })
      }
    })
  }

  if (enquiry.budget) {
    sections.push(`Budget: ${enquiry.budget}`)
  }

  if (enquiry.callbackTime) {
    sections.push(`Preferred Callback: ${enquiry.callbackTime}`)
  }

  if (enquiry.hearAboutUs) {
    sections.push(`How They Heard About Us: ${enquiry.hearAboutUs}`)
  }

  if (enquiry.message) {
    sections.push('Original Message:')
    sections.push(enquiry.message)
  }

  if (sections.length <= 1) return null
  return sections.join('\n\n')
}

const parseBudgetValue = (budget) => {
  if (!budget) return null
  const normalized = String(budget).trim()
  const parsed = parseFloat(normalized.replace(/[^0-9.]/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

const convertToProject = async (req, res, next) => {
  try {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } })
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' })

    const { title, location, startDate, expectedEndDate } = req.body
    const projectLocation = location || enquiry.city || null
    const projectNotes    = buildProjectNotes(enquiry)
    const projectValue    = parseBudgetValue(enquiry.budget)

    const serviceNames = Array.isArray(enquiry.servicesRequested)
      ? enquiry.servicesRequested.map(s => String(s).trim()).filter(Boolean)
      : []

    const matchingServices = serviceNames.length > 0
      ? await prisma.service.findMany({
          where: {
            OR: serviceNames.map(name => ({ name: { equals: name, mode: 'insensitive' } }))
          }
        })
      : []

    const serviceMap = matchingServices.reduce((acc, service) => {
      acc[service.name.toLowerCase()] = service
      return acc
    }, {})

    const serviceCreates = serviceNames.map((serviceName) => {
      const found = serviceMap[serviceName.toLowerCase()]
      const detail = enquiry.serviceDetails?.[serviceName] || enquiry.serviceDetails?.[serviceName.toLowerCase()]
      const notes = detail ? buildServiceNotes(serviceName, detail) : null
      return found ? { serviceId: found.id, notes: notes || undefined } : null
    }).filter(Boolean)

    let client = await prisma.user.findUnique({ where: { email: enquiry.email } })
    let tempPassword = null

    if (!client) {
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
    }

    const project = await prisma.project.create({
      data: {
        clientId:        client.id,
        title:           title || `${enquiry.name} — Project`,
        location:        projectLocation,
        startDate:       startDate       ? new Date(startDate)       : null,
        expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
        totalValue:      projectValue,
        notes:           projectNotes,
        status:          'NEW_ENQUIRY'
      }
    })

    // After creating project, add services from enquiry
    if (Array.isArray(enquiry.servicesRequested) && enquiry.servicesRequested.length > 0) {
      const serviceRecords = await prisma.service.findMany({
        where: { name: { in: enquiry.servicesRequested } }
      })
      if (serviceRecords.length > 0) {
        await prisma.projectService.createMany({
          data: serviceRecords.map(svc => ({
            projectId: project.id,
            serviceId: svc.id,
            status: 'PENDING'
          }))
        })
      }
    }

    await prisma.enquiry.update({
      where: { id: enquiry.id },
      data:  { status: 'CONVERTED', convertedProject: project.id }
    })

    if (tempPassword) {
      // Send email and await it to catch any SendGrid errors
      try {
        await emailSvc.sendClientCredentials(enquiry.email, enquiry.name, tempPassword)
      } catch (emailErr) {
        console.error('⚠️ Email sending failed after project creation:', emailErr.message)
        // Don't fail the conversion, just log the error
      }
    }

    res.json({ message: 'Enquiry converted to project.', project, client: { id: client.id, email: client.email } })
  } catch (err) { next(err) }
}

module.exports = { submitEnquiry, getAllEnquiries, getEnquiry, updateEnquiry, convertToProject }
