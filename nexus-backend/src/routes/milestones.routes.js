// nexus-backend/src/routes/milestones.routes.js
const express = require('express')
const router  = express.Router()
const { protect }   = require('../middleware/auth')
const { isAdminOrPM } = require('../middleware/role')
const ctrl = require('../controllers/milestones.controller')

router.get('/project/:projectId',  protect, ctrl.getMilestones)
router.post('/project/:projectId', protect, isAdminOrPM, ctrl.createMilestone)
router.put('/:id',                 protect, isAdminOrPM, ctrl.updateMilestone)
router.put('/:id/complete',        protect, isAdminOrPM, ctrl.completeMilestone)
router.delete('/:id',              protect, isAdminOrPM, ctrl.deleteMilestone)

module.exports = router
