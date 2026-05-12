// nexus-backend/src/app.js
const express   = require('express')
const cors      = require('cors')
const helmet    = require('helmet')
const morgan    = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

app.use(helmet())

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message: { error: 'Too many login attempts, please try again later.' }
})
app.use('/api/auth/login',    authLimiter)
app.use('/api/auth/register', authLimiter)

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/api/health', (req, res) => {
  res.json({
    status:      'ok',
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
    uptime:      `${Math.floor(process.uptime())}s`,
  })
})

app.use('/api/auth',       require('./routes/auth.routes'))
app.use('/api/services',   require('./routes/services.routes'))
app.use('/api/enquiries',  require('./routes/enquiries.routes'))
app.use('/api/projects',   require('./routes/projects.routes'))
app.use('/api/milestones', require('./routes/milestones.routes'))
app.use('/api/quotes',     require('./routes/quotes.routes'))
app.use('/api/invoices',   require('./routes/invoices.routes'))
app.use('/api/documents',  require('./routes/documents.routes'))
app.use('/api/messages',   require('./routes/messages.routes'))
app.use('/api/admin',      require('./routes/admin.routes'))

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` })
})

app.use(require('./middleware/errorHandler'))

module.exports = app
