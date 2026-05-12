// src/pages/client/Quotes.jsx
import { useState, useEffect } from 'react'
import ClientLayout from '../../components/layout/ClientLayout'
import { StatusBadge, PageLoader, EmptyState, Modal } from '../../components/ui'
import { formatDate, formatINR } from '../../utils/helpers'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ClientQuotes() {
  const [quotes,   setQuotes]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [rejectId, setRejectId] = useState(null)
  const [reason,   setReason]   = useState('')

  const load = () => api.get('/quotes').then(r => setQuotes(r.data.quotes)).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const accept = async (id) => {
    try {
      await api.put(`/quotes/${id}/accept`)
      toast.success('Quote accepted! Your project is now confirmed.')
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to accept quote.') }
  }

  const reject = async () => {
    try {
      await api.put(`/quotes/${rejectId}/reject`, { rejectionReason: reason })
      toast.success('Quote rejected. Our team will revise and resend.')
      setRejectId(null)
      setReason('')
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to reject quote.') }
  }

  if (loading) return <ClientLayout><PageLoader /></ClientLayout>

  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="section-title">Quotes</h1>
        <p className="section-sub">Review and approve quotes from the Nexus team.</p>
      </div>

      {quotes.length === 0 ? (
        <EmptyState icon="📄" title="No quotes yet" description="Quotes will appear here once our team sends them for your project." />
      ) : (
        <div className="space-y-4">
          {quotes.map(q => (
            <div key={q.id} className={`card ${q.status === 'SENT' ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={q.status} />
                    <span className="text-xs text-gray-400">{q.quoteNumber}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{q.project?.title}</p>
                  <p className="text-2xl font-light text-gray-900">{formatINR(q.totalAmount)}</p>
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <p>Subtotal: {formatINR(q.subtotal)} + GST ({q.taxPercent}%): {formatINR(q.taxAmount)}</p>
                    {q.validUntil && <p>Valid until: {formatDate(q.validUntil)}</p>}
                    {q.notes && <p className="mt-1 text-gray-600 italic">"{q.notes}"</p>}
                  </div>
                  {q.rejectionReason && (
                    <p className="mt-2 text-xs text-red-600">Rejection reason: {q.rejectionReason}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {q.pdfUrl && (
                    <a href={q.pdfUrl} target="_blank" rel="noreferrer" className="btn-outline text-xs py-2 text-center">
                      View PDF →
                    </a>
                  )}
                  {q.status === 'SENT' && (
                    <>
                      <button onClick={() => accept(q.id)} className="btn-primary text-xs py-2">
                        ✓ Accept Quote
                      </button>
                      <button onClick={() => setRejectId(q.id)} className="btn-danger text-xs py-2">
                        ✕ Request Changes
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Line items preview */}
              {q.status === 'SENT' && Array.isArray(q.items) && q.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Line Items</p>
                  <div className="space-y-1">
                    {q.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span>{item.description}</span>
                        <span className="font-medium">{formatINR(item.total || item.unitPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      <Modal open={!!rejectId} onClose={() => setRejectId(null)} title="Request Changes" size="sm">
        <p className="text-sm text-gray-600 mb-4">Tell us what you'd like changed and our team will revise the quote.</p>
        <textarea
          className="input mb-4" rows={4}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Please reduce the interior budget, or remove the signage service..."
        />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setRejectId(null)} className="btn-outline">Cancel</button>
          <button onClick={reject} className="btn-danger">Submit</button>
        </div>
      </Modal>
    </ClientLayout>
  )
}
