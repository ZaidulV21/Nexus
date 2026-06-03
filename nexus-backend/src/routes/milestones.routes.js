// nexus-backend/src/routes/milestones.routes.js
const express = require('express')
const router  = express.Router()
const { protect }   = require('../middleware/auth')
const { isAdmin } = require('../middleware/role')
const ctrl = require('../controllers/milestones.controller')

router.get('/project/:projectId',  protect, ctrl.getMilestones)
router.post('/project/:projectId', protect, isAdmin, ctrl.createMilestone)
router.put('/:id',                 protect, isAdmin, ctrl.updateMilestone)
router.put('/:id/complete',        protect, isAdmin, ctrl.completeMilestone)
router.delete('/:id',              protect, isAdmin, ctrl.deleteMilestone)

module.exports = router
