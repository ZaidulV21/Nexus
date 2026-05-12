// src/pages/client/Invoices.jsx
import { useState, useEffect } from 'react'
import ClientLayout from '../../components/layout/ClientLayout'
import { StatusBadge, PageLoader, EmptyState } from '../../components/ui'
import { formatDate, formatINR } from '../../utils/helpers'
import api from '../../api/axios'

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/invoices').then(r => setInvoices(r.data.invoices)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <ClientLayout><PageLoader /></ClientLayout>

  const totalDue  = invoices.filter(i => i.status === 'SENT'  || i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0)
  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0)

  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="section-title">Invoices</h1>
        <p className="section-sub">Track your payments and download invoice PDFs.</p>
      </div>

      {/* Summary */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Paid</p>
            <p className="text-2xl font-light text-green-600">{formatINR(totalPaid)}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount Due</p>
            <p className={`text-2xl font-light ${totalDue > 0 ? 'text-red-500' : 'text-gray-400'}`}>{formatINR(totalDue)}</p>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <EmptyState icon="🧾" title="No invoices yet" description="Invoices will appear here once our team raises them for your project." />
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className={`card ${inv.status === 'OVERDUE' ? 'border-red-300 bg-red-50' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={inv.status} />
                    <span className="text-xs text-gray-400">{inv.invoiceNumber}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{inv.project?.title}</p>
                  <p className="text-2xl font-light text-gray-900">{formatINR(inv.amount)}</p>
                  <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                    <p>Issued: {formatDate(inv.createdAt)}</p>
                    {inv.dueDate && (
                      <p className={inv.status === 'OVERDUE' ? 'text-red-600 font-medium' : ''}>
                        Due: {formatDate(inv.dueDate)}
                      </p>
                    )}
                    {inv.paidAt && <p className="text-green-600">Paid: {formatDate(inv.paidAt)}</p>}
                    {inv.paymentMethod && <p>Method: {inv.paymentMethod}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {inv.pdfUrl && (
                    <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="btn-outline text-xs py-2 text-center">
                      Download PDF →
                    </a>
                  )}
                  {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                    <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 border border-gray-200 rounded">
                      <p className="font-medium text-gray-700 mb-1">Payment Details</p>
                      <p>NEFT / IMPS / UPI</p>
                      <p className="text-gold-600 font-medium">nexus@hdfcbank</p>
                      <p className="mt-1">After payment, call us:</p>
                      <p className="font-medium">+91 98765 43210</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  )
}
