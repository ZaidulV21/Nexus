// nexus-backend/src/routes/projects.routes.js
const express = require('express')
const router  = express.Router()
const { protect }    = require('../middleware/auth')
const { isAdmin } = require('../middleware/role')
const ctrl = require('../controllers/projects.controller')

router.get('/',     protect, ctrl.getAllProjects)
router.get('/:id',  protect, ctrl.getProject)
router.post('/',    protect, isAdmin, ctrl.createProject)
router.put('/:id',  protect, isAdmin, ctrl.updateProject)
router.post('/:id/services',         protect, isAdmin, ctrl.addService)
router.put('/:id/services/:psId',    protect, isAdmin, ctrl.updateService)

module.exports = router
