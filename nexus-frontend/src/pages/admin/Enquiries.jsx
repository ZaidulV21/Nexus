// src/pages/admin/Enquiries.jsx
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { StatusBadge, PageLoader, EmptyState, Modal } from '../../components/ui'
import { formatDate, formatDateTime } from '../../utils/helpers'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const STATUSES = ['', 'NEW', 'CONTACTED', 'SITE_VISITED', 'QUOTE_SENT', 'CONFIRMED', 'ADVANCE_PAID', 'IN_PROGRESS', 'QUALITY_CHECK', 'FINAL_INVOICE', 'COMPLETED', 'CLOSED']

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('')
  const [convert,   setConvert]   = useState(null)   // enquiry to convert
  const [details,   setDetails]   = useState(null)   // enquiry details view
  const [form,      setForm]      = useState({ title:'', location:'' })

  const load = () => {
    const params = filter ? `?status=${filter}` : ''
    api.get(`/enquiries${params}`)
      .then(r => setEnquiries(r.data.enquiries))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/enquiries/${id}`, { status })
      toast.success('Status updated.')
      load()
    } catch { toast.error('Failed to update.') }
  }

  const handleConvert = async () => {
    if (!convert) return
    try {
      await api.post(`/enquiries/${convert.id}/convert`, {
        title:     form.title || `${convert.name} — Project`,
        location:  form.location,
      })
      toast.success('Enquiry converted to project. Client credentials sent by email.')
      setConvert(null)
      setForm({ title:'', location:'' })
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Conversion failed.') }
  }

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="section-title">Enquiries</h1>
          <p className="section-sub">All contact form submissions and leads.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors
                ${filter === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {enquiries.length === 0 ? (
        <EmptyState icon="📬" title="No enquiries" description="Form submissions from your website will appear here." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name','Phone','Services','Budget','Status','Submitted','Actions'].map(h => (
                    <th key={h} className="table-header text-left px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enquiries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{e.name}</p>
                      <p className="text-xs text-gray-400">{e.email}</p>
                      {e.company && <p className="text-xs text-gray-400">{e.company}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`tel:${e.phone}`} className="text-sm text-gold-600 hover:underline">{e.phone}</a>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {e.servicesRequested?.join(', ') || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{e.budget || '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={e.status}
                        onChange={ev => updateStatus(e.id, ev.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-gold-400">
                        {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDetails(e)}
                          className="text-xs border border-gray-200 px-2.5 py-1 text-gray-600 hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                        {e.status !== 'CONTACTED' && (
                          <button
                            onClick={() => { setConvert(e); setForm({ title:`${e.name} — Project`, location:'' }) }}
                            className="text-xs bg-gold-500 text-black px-2.5 py-1 hover:bg-gold-600 transition-colors whitespace-nowrap">
                            Convert →
                          </button>
                        )}
                        {e.message && (
                          <button
                            title={e.message}
                            className="text-xs border border-gray-200 px-2.5 py-1 text-gray-600 hover:bg-gray-50">
                            Note
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Convert to Project modal */}
      <Modal open={!!convert} onClose={() => setConvert(null)} title={`Convert: ${convert?.name}`} size="md">
        <p className="text-sm text-gray-500 mb-4">
          This will create a project and send login credentials to <strong>{convert?.email}</strong>.
        </p>
        <div className="space-y-4">
          <div>
            <label className="label">Project Title</label>
            <input className="input" value={form.title}
              onChange={e => setForm(f => ({...f, title: e.target.value}))}
              placeholder="Project name" />
          </div>
          <div>
            <label className="label">Project Location</label>
            <input className="input" value={form.location}
              onChange={e => setForm(f => ({...f, location: e.target.value}))}
              placeholder="e.g. Gomti Nagar, Lucknow" />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setConvert(null)} className="btn-outline">Cancel</button>
          <button onClick={handleConvert} className="btn-primary">Convert to Project</button>
        </div>
      </Modal>
      
      {/* View Details modal */}
      <Modal open={!!details} onClose={() => setDetails(null)} title={`Enquiry: ${details?.name}`} size="lg">
        {details && (
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Name</p>
                  <p className="font-medium text-gray-900">{details.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{details.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Email</p>
                  <p className="font-medium text-gray-900">{details.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Company</p>
                  <p className="font-medium text-gray-900">{details.company || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">City</p>
                  <p className="font-medium text-gray-900">{details.city || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Callback Time</p>
                  <p className="font-medium text-gray-900">{details.callbackTime || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs mb-1">How they heard about us</p>
                  <p className="font-medium text-gray-900">{details.hearAboutUs || '—'}</p>
                </div>
              </div>
            </div>
            
            {/* Services Requested */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Services Requested</h3>
              <div className="flex flex-wrap gap-2">
                {details.servicesRequested?.map(service => (
                  <span key={service} className="inline-block bg-gold-100 text-gold-700 px-3 py-1 rounded text-sm">
                    {service}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Service Details */}
            {details.serviceDetails && Object.keys(details.serviceDetails).length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Service-Specific Details</h3>
                <div className="space-y-4">
                  {Object.entries(details.serviceDetails).map(([serviceName, serviceData]) => (
                    <div key={serviceName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-3">{serviceName}</h4>
                      {Object.keys(serviceData).length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {Object.entries(serviceData).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-gray-500 text-xs mb-1 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="font-medium text-gray-900">
                                {Array.isArray(value) ? value.join(', ') : String(value) || '—'}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No details provided for this service</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Message */}
            {details.message && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Auto-Generated Summary</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{details.message}</p>
              </div>
            )}
            
            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <p>Status</p>
                  <p className="font-medium text-gray-900 mt-1">{details.status}</p>
                </div>
                <div>
                  <p>Submitted</p>
                  <p className="font-medium text-gray-900 mt-1">{formatDateTime(details.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setDetails(null)} className="btn-outline">Close</button>
        </div>
      </Modal>
    </AdminLayout>
  )
}
