// nexus-backend/src/routes/documents.routes.js
const express = require('express')
const router  = express.Router()
const { protect }    = require('../middleware/auth')
const { isAdmin } = require('../middleware/role')
const { upload }     = require('../middleware/upload')
const ctrl = require('../controllers/documents.controller')

// Middleware to catch multer/upload errors
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof Error) {
    // Handle Cloudinary signature errors and other upload errors
    return res.status(400).json({ error: `Upload failed: ${err.message}` })
  }
  next(err)
}

router.get('/project/:projectId',  protect, ctrl.getDocuments)
router.post('/project/:projectId', protect, isAdmin, upload.single('file'), uploadErrorHandler, ctrl.uploadDocument)
router.delete('/:id',              protect, isAdmin, ctrl.deleteDocument)

module.exports = router
