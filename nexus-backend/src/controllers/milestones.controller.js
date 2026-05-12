// nexus-backend/src/controllers/milestones.controller.js
const { PrismaClient } = require('@prisma/client')
const prisma    = new PrismaClient()
const emailSvc  = require('../services/email.service')

const getMilestones = async (req, res, next) => {
  try {
    const milestones = await prisma.milestone.findMany({
      where: { projectId: req.params.projectId }, orderBy: { sortOrder: 'asc' }
    })
    res.json({ milestones })
  } catch (err) { next(err) }
}

const createMilestone = async (req, res, next) => {
  try {
    const { title, description, dueDate, sortOrder } = req.body
    const milestone = await prisma.milestone.create({
      data: {
        projectId:  req.params.projectId,
        title, description, sortOrder: sortOrder || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    })
    res.status(201).json({ milestone })
  } catch (err) { next(err) }
}

const updateMilestone = async (req, res, next) => {
  try {
    const { title, description, dueDate, status, sortOrder } = req.body
    const milestone = await prisma.milestone.update({
      where: { id: req.params.id },
      data:  {
        ...(title       && { title }),
        ...(description !== undefined && { description }),
        ...(status      && { status }),
        ...(sortOrder   !== undefined && { sortOrder }),
        ...(dueDate     && { dueDate: new Date(dueDate) }),
      }
    })
    res.json({ milestone })
  } catch (err) { next(err) }
}

const completeMilestone = async (req, res, next) => {
  try {
    const milestone = await prisma.milestone.update({
      where: { id: req.params.id },
      data:  { status: 'COMPLETED', completedAt: new Date() },
      include: { project: { include: { client: true } } }
    })

    // Notify client by email
    if (milestone.project?.client?.email) {
      emailSvc.sendMilestoneComplete(
        milestone.project.client.email,
        milestone.project.client.name,
        milestone.title,
        milestone.project.title
      )
    }
    res.json({ milestone })
  } catch (err) { next(err) }
}

const deleteMilestone = async (req, res, next) => {
  try {
    await prisma.milestone.delete({ where: { id: req.params.id } })
    res.json({ message: 'Milestone deleted.' })
  } catch (err) { next(err) }
}

module.exports = { getMilestones, createMilestone, updateMilestone, completeMilestone, deleteMilestone }
