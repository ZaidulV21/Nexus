// nexus-backend/src/controllers/projects.controller.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const projectIncludes = {
  client:  { select: { id:true, name:true, email:true, phone:true, companyName:true, avatarUrl:true } },
  manager: { select: { id:true, name:true, email:true, phone:true } },
  services:  { include: { service: true }, orderBy: { createdAt: 'asc' } },
  milestones:{ orderBy: { sortOrder: 'asc' } },
  quotes:    { orderBy: { createdAt: 'desc' } },
  invoices:  { orderBy: { createdAt: 'desc' } },
  documents: { include: { uploader: { select: { id:true, name:true, role:true } } }, orderBy: { createdAt: 'desc' } },
  messages:  { include: { sender: { select: { id:true, name:true, role:true, avatarUrl:true } } }, orderBy: { createdAt: 'asc' } }
}

const getAllProjects = async (req, res, next) => {
  try {
    const { role, id } = req.user
    const { status, page = 1, limit = 20 } = req.query
    let where = {}
    if (role === 'CLIENT')          where.clientId  = id
    if (role === 'PROJECT_MANAGER') where.managerId = id
    if (status) where.status = status

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client:  { select: { id:true, name:true, companyName:true } },
          manager: { select: { id:true, name:true } },
          _count:  { select: { milestones:true, messages:true, documents:true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page-1) * Number(limit), take: Number(limit)
      }),
      prisma.project.count({ where })
    ])
    res.json({ projects, total, page: Number(page), pages: Math.ceil(total/Number(limit)) })
  } catch (err) { next(err) }
}

const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: projectIncludes })
    if (!project) return res.status(404).json({ error: 'Project not found.' })
    if (req.user.role === 'CLIENT' && project.clientId !== req.user.id)
      return res.status(403).json({ error: 'Access denied.' })
    res.json({ project })
  } catch (err) { next(err) }
}

const createProject = async (req, res, next) => {
  try {
    const { clientId, managerId, title, location, startDate, expectedEndDate, totalValue, notes, serviceIds } = req.body
    if (!clientId || !title) return res.status(400).json({ error: 'clientId and title are required.' })

    const project = await prisma.project.create({
      data: {
        clientId, managerId, title, location, notes,
        totalValue:      totalValue      ? parseFloat(totalValue)      : null,
        startDate:       startDate       ? new Date(startDate)       : null,
        expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : null,
        services: serviceIds?.length ? { create: serviceIds.map(sid => ({ serviceId: sid })) } : undefined
      },
      include: projectIncludes
    })
    res.status(201).json({ project })
  } catch (err) { next(err) }
}

const updateProject = async (req, res, next) => {
  try {
    const { status, managerId, location, startDate, expectedEndDate, actualEndDate, totalValue, notes } = req.body
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(status          !== undefined && { status }),
        ...(managerId       !== undefined && { managerId }),
        ...(location        !== undefined && { location }),
        ...(notes           !== undefined && { notes }),
        ...(totalValue      !== undefined && { totalValue: parseFloat(totalValue) }),
        ...(startDate       !== undefined && { startDate:       new Date(startDate) }),
        ...(expectedEndDate !== undefined && { expectedEndDate: new Date(expectedEndDate) }),
        ...(actualEndDate   !== undefined && { actualEndDate:   new Date(actualEndDate) }),
      },
      include: { client: { select:{id:true,name:true,email:true} }, manager: { select:{id:true,name:true} } }
    })
    res.json({ project })
  } catch (err) { next(err) }
}

const addService = async (req, res, next) => {
  try {
    const { serviceId, vendorName, vendorPhone, serviceValue, notes } = req.body
    const ps = await prisma.projectService.create({
      data: { projectId: req.params.id, serviceId, vendorName, vendorPhone, serviceValue: serviceValue ? parseFloat(serviceValue) : null, notes },
      include: { service: true }
    })
    res.status(201).json({ projectService: ps })
  } catch (err) { next(err) }
}

const updateService = async (req, res, next) => {
  try {
    const ps = await prisma.projectService.update({
      where:   { id: req.params.psId },
      data:    req.body,
      include: { service: true }
    })
    res.json({ projectService: ps })
  } catch (err) { next(err) }
}

module.exports = { getAllProjects, getProject, createProject, updateProject, addService, updateService }
