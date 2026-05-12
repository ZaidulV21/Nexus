// nexus-backend/src/routes/invoices.routes.js
const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/role')
const ctrl = require('../controllers/invoices.controller')

router.get('/',             protect, ctrl.getAllInvoices)
router.get('/:id',          protect, ctrl.getInvoice)
router.post('/',            protect, isAdmin, ctrl.createInvoice)
router.put('/:id/send',     protect, isAdmin, ctrl.sendInvoice)
router.put('/:id/mark-paid',protect, isAdmin, ctrl.markPaid)

module.exports = router
