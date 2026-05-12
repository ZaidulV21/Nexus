// nexus-backend/src/controllers/admin.controller.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

const getDashboardStats = async (req, res, next) => {
  try {
    const now        = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalProjects, activeProjects, totalClients, newEnquiries,
      pendingQuotes, overdueInvoices, completedThisMonth, recentProjects, recentEnquiries
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: { in: ['CONFIRMED','IN_PROGRESS'] } } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.enquiry.count({ where: { status: 'NEW' } }),
      prisma.quote.count({ where: { status: 'SENT' } }),
      prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      prisma.project.count({ where: { status: 'COMPLETED', updatedAt: { gte: monthStart } } }),
      prisma.project.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        include: { client: { select: { name:true } }, manager: { select: { name:true } } }
      }),
      prisma.enquiry.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
    ])

    // Revenue from paid invoices this month
    const paidInvoices = await prisma.invoice.findMany({
      where: { status: 'PAID', paidAt: { gte: monthStart } }
    })
    const revenueThisMonth = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)

    // Total revenue all time
    const allPaidInvoices = await prisma.invoice.findMany({ where: { status: 'PAID' } })
    const totalRevenue = allPaidInvoices.reduce((sum, inv) => sum + inv.amount, 0)

    res.json({
      stats: { totalProjects, activeProjects, totalClients, newEnquiries, pendingQuotes, overdueInvoices, completedThisMonth, revenueThisMonth, totalRevenue },
      recentProjects,
      recentEnquiries
    })
  } catch (err) { next(err) }
}

const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query
    const where = role ? { role } : {}
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page-1)*Number(limit), take: Number(limit),
        select: { id:true, name:true, email:true, phone:true, role:true, companyName:true, isVerified:true, createdAt:true,
          _count: { select: { clientProjects:true } } }
      }),
      prisma.user.count({ where })
    ])
    res.json({ users, total })
  } catch (err) { next(err) }
}

const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, companyName } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required.' })
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, role: role || 'CLIENT', companyName, isVerified: true },
      select: { id:true, name:true, email:true, role:true }
    })
    res.status(201).json({ user })
  } catch (err) { next(err) }
}

const changeRole = async (req, res, next) => {
  try {
    const { role } = req.body
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data:  { role },
      select: { id:true, name:true, email:true, role:true }
    })
    res.json({ user })
  } catch (err) { next(err) }
}

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account.' })
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ message: 'User deleted.' })
  } catch (err) { next(err) }
}

const getRevenueReport = async (req, res, next) => {
  try {
    // Last 12 months revenue
    const months = []
    for (let i = 11; i >= 0; i--) {
      const date  = new Date()
      date.setMonth(date.getMonth() - i)
      const start = new Date(date.getFullYear(), date.getMonth(), 1)
      const end   = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      const invoices = await prisma.invoice.findMany({
        where: { status: 'PAID', paidAt: { gte: start, lte: end } }
      })
      months.push({
        month:   start.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        revenue: invoices.reduce((s, inv) => s + inv.amount, 0),
        count:   invoices.length
      })
    }

    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'], _count: { status: true }
    })

    res.json({ monthlyRevenue: months, projectsByStatus })
  } catch (err) { next(err) }
}

module.exports = { getDashboardStats, getAllUsers, createUser, changeRole, deleteUser, getRevenueReport }
