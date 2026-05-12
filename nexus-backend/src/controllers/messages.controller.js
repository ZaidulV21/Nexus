// nexus-backend/src/controllers/messages.controller.js
const { PrismaClient } = require('@prisma/client')
const prisma   = new PrismaClient()
const emailSvc = require('../services/email.service')

const getMessages = async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where:   { projectId: req.params.projectId },
      include: { sender: { select: { id:true, name:true, role:true, avatarUrl:true } } },
      orderBy: { createdAt: 'asc' }
    })
    res.json({ messages })
  } catch (err) { next(err) }
}

const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Message content is required.' })

    const message = await prisma.message.create({
      data: { projectId: req.params.projectId, senderId: req.user.id, content: content.trim() },
      include: { sender: { select: { id:true, name:true, role:true, avatarUrl:true } } }
    })

    // Notify the other party
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: { client: true, manager: true }
    })
    if (project) {
      const isClient  = req.user.role === 'CLIENT'
      const recipient = isClient ? project.manager : project.client
      if (recipient?.email) {
        emailSvc.sendNewMessageNotification(recipient.email, recipient.name, req.user.name, project.title)
      }
    }
    res.status(201).json({ message })
  } catch (err) { next(err) }
}

const markRead = async (req, res, next) => {
  try {
    await prisma.message.updateMany({
      where: { projectId: req.params.projectId, senderId: { not: req.user.id }, isRead: false },
      data:  { isRead: true }
    })
    res.json({ message: 'Messages marked as read.' })
  } catch (err) { next(err) }
}

module.exports = { getMessages, sendMessage, markRead }
