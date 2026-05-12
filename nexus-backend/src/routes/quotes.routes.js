// nexus-backend/src/routes/quotes.routes.js
const express = require('express')
const router  = express.Router()
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/role')
const ctrl = require('../controllers/quotes.controller')

router.get('/',              protect, ctrl.getAllQuotes)
router.get('/:id',           protect, ctrl.getQuote)
router.post('/',             protect, isAdmin, ctrl.createQuote)
router.put('/:id',           protect, isAdmin, ctrl.updateQuote)
router.put('/:id/send',      protect, isAdmin, ctrl.sendQuote)
router.put('/:id/accept',    protect, ctrl.acceptQuote)
router.put('/:id/reject',    protect, ctrl.rejectQuote)

module.exports = router
