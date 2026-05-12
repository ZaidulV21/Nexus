// nexus-backend/src/routes/projects.routes.js
const express = require('express')
const router  = express.Router()
const { protect }    = require('../middleware/auth')
const { isAdmin, isAdminOrPM } = require('../middleware/role')
const ctrl = require('../controllers/projects.controller')

router.get('/',     protect, ctrl.getAllProjects)
router.get('/:id',  protect, ctrl.getProject)
router.post('/',    protect, isAdmin, ctrl.createProject)
router.put('/:id',  protect, isAdminOrPM, ctrl.updateProject)
router.post('/:id/services',         protect, isAdminOrPM, ctrl.addService)
router.put('/:id/services/:psId',    protect, isAdminOrPM, ctrl.updateService)

module.exports = router
