// nexus-backend/src/server.js
require('dotenv').config()
const app  = require('./app')

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log('')
  console.log('  ╔══════════════════════════════════════════╗')
  console.log('  ║       NEXUS API SERVER STARTED           ║')
  console.log('  ╠══════════════════════════════════════════╣')
  console.log(`  ║  Port    : ${PORT}                            ║`)
  console.log(`  ║  Mode    : ${process.env.NODE_ENV}              ║`)
  console.log(`  ║  Health  : http://localhost:${PORT}/api/health  ║`)
  console.log('  ╚══════════════════════════════════════════╝')
  console.log('')
})

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message)
  console.error(err.stack)
  // Don't exit - let the server continue running
})

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message)
  console.error(err.stack)
  server.close(() => process.exit(1))
})
