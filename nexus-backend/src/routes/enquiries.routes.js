// nexus-backend/src/routes/enquiries.routes.js
const express = require('express')
const router  = express.Router()
const { protect }   = require('../middleware/auth')
const { isAdmin }   = require('../middleware/role')
const ctrl = require('../controllers/enquiries.controller')

router.post('/',              ctrl.submitEnquiry)
router.get('/',  protect, isAdmin, ctrl.getAllEnquiries)
router.get('/:id', protect, isAdmin, ctrl.getEnquiry)
router.put('/:id', protect, isAdmin, ctrl.updateEnquiry)
router.post('/:id/convert', protect, isAdmin, ctrl.convertToProject)

module.exports = router
