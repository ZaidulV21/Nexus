// nexus-backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const safeUser = { id:true, name:true, email:true, phone:true, role:true, companyName:true, isVerified:true, avatarUrl:true, createdAt:true }

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, companyName } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' })
    if (password.length < 8)          return res.status(400).json({ error: 'Password must be at least 8 characters.' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data:   { name, email, phone, passwordHash, companyName },
      select: safeUser
    })
    res.status(201).json({ token: signToken(user.id), user })
  } catch (err) { next(err) }
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' })

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' })

    res.json({
      token: signToken(user.id),
      user: { id:user.id, name:user.name, email:user.email, phone:user.phone, role:user.role, companyName:user.companyName, avatarUrl:user.avatarUrl }
    })
  } catch (err) { next(err) }
}

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: safeUser })
    res.json({ user })
  } catch (err) { next(err) }
}

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  res.json({ message: 'If that email exists, a reset link has been sent.' })
}

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  res.json({ message: 'Password reset successful.' })
}

// PUT /api/auth/update-profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, companyName } = req.body
    const user = await prisma.user.update({
      where:  { id: req.user.id },
      data:   { name, phone, companyName },
      select: safeUser
    })
    res.json({ user })
  } catch (err) { next(err) }
}

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect.' })
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } })
    res.json({ message: 'Password updated successfully.' })
  } catch (err) { next(err) }
}

module.exports = { register, login, getMe, forgotPassword, resetPassword, updateProfile, changePassword }
