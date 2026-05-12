// nexus-backend/src/routes/services.routes.js
const express = require('express')
const router  = express.Router()
const { protect }    = require('../middleware/auth')
const { isAdmin }    = require('../middleware/role')
const ctrl = require('../controllers/services.controller')

router.get('/',      ctrl.getAllServices)
router.get('/:id',   ctrl.getService)
router.post('/',     protect, isAdmin, ctrl.createService)
router.put('/:id',   protect, isAdmin, ctrl.updateService)
router.delete('/:id',protect, isAdmin, ctrl.deleteService)

module.exports = router
