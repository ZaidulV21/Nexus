// nexus-backend/src/middleware/auth.js
const jwt    = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please log in.' })
    }
    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where:  { id: decoded.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, companyName: true, isVerified: true, avatarUrl: true }
    })
    if (!user) return res.status(401).json({ error: 'User no longer exists.' })

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { protect }
