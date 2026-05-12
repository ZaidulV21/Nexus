// nexus-backend/src/routes/messages.routes.js
const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/messages.controller')

router.get('/project/:projectId',  protect, ctrl.getMessages)
router.post('/project/:projectId', protect, ctrl.sendMessage)
router.put('/project/:projectId/read', protect, ctrl.markRead)

module.exports = router
