// nexus-backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.message}`)
  if (process.env.NODE_ENV === 'development') console.error(err.stack)

  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field'
    return res.status(400).json({ error: `${field} already exists.` })
  }
  if (err.code === 'P2025') return res.status(404).json({ error: 'Record not found.' })
  if (err.code === 'P2003') return res.status(400).json({ error: 'Referenced record does not exist.' })
  if (err.name === 'JsonWebTokenError')  return res.status(401).json({ error: 'Invalid token. Please log in again.' })
  if (err.name === 'TokenExpiredError')  return res.status(401).json({ error: 'Session expired. Please log in again.' })
  if (err.code  === 'LIMIT_FILE_SIZE')   return res.status(400).json({ error: 'File too large. Maximum 10MB.' })

  const status  = err.status || err.statusCode || 500
  const message = err.message || 'Something went wrong.'
  res.status(status).json({ error: message })
}

module.exports = errorHandler
