// nexus-backend/src/middleware/role.js
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' })
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: `Access denied. Required roles: ${roles.join(', ')}` })
  }
  next()
}

const isAdmin      = allowRoles('SUPER_ADMIN', 'ADMIN')
const isSuperAdmin = allowRoles('SUPER_ADMIN')
const isClient     = allowRoles('CLIENT')

module.exports = { allowRoles, isAdmin, isSuperAdmin, isClient }
