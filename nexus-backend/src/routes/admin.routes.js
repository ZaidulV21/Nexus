// nexus-backend/src/routes/admin.routes.js
const express = require('express')
const router  = express.Router()
const { protect }    = require('../middleware/auth')
const { isAdmin, isSuperAdmin } = require('../middleware/role')
const ctrl = require('../controllers/admin.controller')

router.get('/stats',           protect, isAdmin, ctrl.getDashboardStats)
router.get('/users',           protect, isAdmin, ctrl.getAllUsers)
router.post('/users',          protect, isAdmin, ctrl.createUser)
router.put('/users/:id/role',  protect, isSuperAdmin, ctrl.changeRole)
router.delete('/users/:id',    protect, isSuperAdmin, ctrl.deleteUser)
router.get('/reports/revenue', protect, isAdmin, ctrl.getRevenueReport)

module.exports = router
