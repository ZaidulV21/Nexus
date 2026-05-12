// nexus-backend/src/routes/documents.routes.js
const express = require('express')
const router  = express.Router()
const { protect }    = require('../middleware/auth')
const { isAdminOrPM } = require('../middleware/role')
const { upload }     = require('../middleware/upload')
const ctrl = require('../controllers/documents.controller')

router.get('/project/:projectId',  protect, ctrl.getDocuments)
router.post('/project/:projectId', protect, isAdminOrPM, upload.single('file'), ctrl.uploadDocument)
router.delete('/:id',              protect, isAdminOrPM, ctrl.deleteDocument)

module.exports = router
