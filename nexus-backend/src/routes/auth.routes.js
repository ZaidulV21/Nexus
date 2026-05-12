// nexus-backend/src/routes/auth.routes.js
const express    = require('express')
const router     = express.Router()
const { protect } = require('../middleware/auth')
const ctrl        = require('../controllers/auth.controller')

router.post('/register',        ctrl.register)
router.post('/login',           ctrl.login)
router.post('/forgot-password', ctrl.forgotPassword)
router.post('/reset-password',  ctrl.resetPassword)
router.get('/me', protect,      ctrl.getMe)

module.exports = router
