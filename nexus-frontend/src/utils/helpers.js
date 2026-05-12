// src/utils/helpers.js

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const timeAgo = (date) => {
  if (!date) return ''
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60)   return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`
  if (seconds < 86400)return `${Math.floor(seconds/3600)}h ago`
  return `${Math.floor(seconds/86400)}d ago`
}

export const statusBadgeClass = (status) => {
  const map = {
    COMPLETED: 'badge-green', CONFIRMED: 'badge-green', PAID: 'badge-green',
    ACCEPTED: 'badge-green',  DONE: 'badge-green',
    IN_PROGRESS: 'badge-blue', ASSIGNED: 'badge-blue', SENT: 'badge-blue',
    ENQUIRY: 'badge-yellow',  QUOTE_SENT: 'badge-yellow', PENDING: 'badge-yellow',
    NEW: 'badge-yellow',      CONTACTED: 'badge-yellow',  DRAFT: 'badge-gray',
    ON_HOLD: 'badge-gray',    DELAYED: 'badge-red',       CANCELLED: 'badge-red',
    REJECTED: 'badge-red',    OVERDUE: 'badge-red',       EXPIRED: 'badge-red',
  }
  return map[status] || 'badge-gray'
}

export const progressPercent = (milestones = []) => {
  if (!milestones.length) return 0
  const done = milestones.filter(m => m.status === 'COMPLETED').length
  return Math.round((done / milestones.length) * 100)
}

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
