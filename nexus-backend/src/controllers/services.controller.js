// nexus-backend/src/controllers/services.controller.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getAllServices = async (req, res, next) => {
  try {
    const includeInactive = req.query.all === 'true' && req.user?.role !== 'CLIENT'
    const services = await prisma.service.findMany({
      where:   includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })
    res.json({ services })
  } catch (err) { next(err) }
}

const getService = async (req, res, next) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } })
    if (!service) return res.status(404).json({ error: 'Service not found.' })
    res.json({ service })
  } catch (err) { next(err) }
}

const createService = async (req, res, next) => {
  try {
    const service = await prisma.service.create({ data: req.body })
    res.status(201).json({ service })
  } catch (err) { next(err) }
}

const updateService = async (req, res, next) => {
  try {
    const service = await prisma.service.update({ where: { id: req.params.id }, data: req.body })
    res.json({ service })
  } catch (err) { next(err) }
}

const deleteService = async (req, res, next) => {
  try {
    await prisma.service.update({ where: { id: req.params.id }, data: { isActive: false } })
    res.json({ message: 'Service deactivated.' })
  } catch (err) { next(err) }
}

module.exports = { getAllServices, getService, createService, updateService, deleteService }
