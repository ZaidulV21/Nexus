// src/components/ui/index.jsx
import { getInitials } from '../../utils/helpers'

export function Spinner({ size = 'md' }) {
  const s = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size]
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-gold-500 ${s}`} />
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-base font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  )
}

export function Avatar({ name, size = 'md', url }) {
  const s = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }[size]
  if (url) return <img src={url} alt={name} className={`${s} rounded-full object-cover`} />
  return (
    <div className={`${s} rounded-full bg-gold-100 text-gold-700 font-medium flex items-center justify-center flex-shrink-0`}>
      {getInitials(name)}
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    COMPLETED:'bg-green-100 text-green-700', CONFIRMED:'bg-green-100 text-green-700',
    PAID:'bg-green-100 text-green-700',      ACCEPTED:'bg-green-100 text-green-700',
    DONE:'bg-green-100 text-green-700',
    IN_PROGRESS:'bg-blue-100 text-blue-700', ASSIGNED:'bg-blue-100 text-blue-700',
    SENT:'bg-blue-100 text-blue-700',
    ENQUIRY:'bg-yellow-100 text-yellow-700', QUOTE_SENT:'bg-yellow-100 text-yellow-700',
    PENDING:'bg-yellow-100 text-yellow-700', NEW:'bg-yellow-100 text-yellow-700',
    CONTACTED:'bg-yellow-100 text-yellow-700',
    DRAFT:'bg-gray-100 text-gray-600',       ON_HOLD:'bg-gray-100 text-gray-600',
    CANCELLED:'bg-red-100 text-red-700',     REJECTED:'bg-red-100 text-red-700',
    OVERDUE:'bg-red-100 text-red-700',       DELAYED:'bg-red-100 text-red-700',
    EXPIRED:'bg-red-100 text-red-700',
  }
  const cls = map[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status?.replace(/_/g,' ')}
    </span>
  )
}

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const w = { sm:'max-w-sm', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' }[size]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-xl w-full ${w} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-outline">Cancel</button>
        <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'}>{confirmText}</button>
      </div>
    </Modal>
  )
}

export function StatCard({ label, value, icon, color = 'gold', sub }) {
  const colors = {
    gold:  'bg-yellow-50 text-gold-600',
    green: 'bg-green-50 text-green-600',
    blue:  'bg-blue-50 text-blue-600',
    red:   'bg-red-50 text-red-600',
    gray:  'bg-gray-50 text-gray-600',
  }
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        {icon && <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</div>}
      </div>
    </div>
  )
}

export function ProgressBar({ percent, color = 'gold' }) {
  const colors = { gold: 'bg-gold-500', green: 'bg-green-500', blue: 'bg-blue-500' }
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full transition-all ${colors[color]}`} style={{ width: `${Math.min(100,percent)}%` }} />
    </div>
  )
}
