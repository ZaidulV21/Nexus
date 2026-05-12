// nexus-backend/src/controllers/documents.controller.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { cloudinary } = require('../middleware/upload')

const getDocuments = async (req, res, next) => {
  try {
    const documents = await prisma.document.findMany({
      where:   { projectId: req.params.projectId },
      include: { uploader: { select: { id:true, name:true, role:true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ documents })
  } catch (err) { next(err) }
}

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const { name, type } = req.body
    const document = await prisma.document.create({
      data: {
        projectId:  req.params.projectId,
        uploadedBy: req.user.id,
        name:       name || req.file.originalname,
        type:       type || 'OTHER',
        fileUrl:    req.file.path,
        fileSize:   req.file.size,
      },
      include: { uploader: { select: { id:true, name:true, role:true } } }
    })
    res.status(201).json({ document })
  } catch (err) { next(err) }
}

const deleteDocument = async (req, res, next) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } })
    if (!doc) return res.status(404).json({ error: 'Document not found.' })

    // Delete from Cloudinary
    try {
      const publicId = doc.fileUrl.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '')
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
    } catch (e) { console.warn('Cloudinary delete failed:', e.message) }

    await prisma.document.delete({ where: { id: req.params.id } })
    res.json({ message: 'Document deleted.' })
  } catch (err) { next(err) }
}

module.exports = { getDocuments, uploadDocument, deleteDocument }
