// src/pages/admin/Enquiries.jsx
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { StatusBadge, PageLoader, EmptyState, Modal } from '../../components/ui'
import { formatDate, formatDateTime } from '../../utils/helpers'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const STATUSES = ['', 'NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('')
  const [convert,   setConvert]   = useState(null)   // enquiry to convert
  const [form,      setForm]      = useState({ title:'', location:'', managerId:'' })
  const [managers,  setManagers]  = useState([])

  const load = () => {
    const params = filter ? `?status=${filter}` : ''
    api.get(`/enquiries${params}`)
      .then(r => setEnquiries(r.data.enquiries))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  useEffect(() => {
    api.get('/admin/users?role=PROJECT_MANAGER')
      .then(r => setManagers(r.data.users))
      .catch(() => {})
  }, [])

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
        managerId: form.managerId || undefined,
      })
      toast.success('Enquiry converted to project. Client credentials sent by email.')
      setConvert(null)
      setForm({ title:'', location:'', managerId:'' })
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
                        {e.status !== 'CONVERTED' && (
                          <button
                            onClick={() => { setConvert(e); setForm({ title:`${e.name} — Project`, location:'', managerId:'' }) }}
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
          <div>
            <label className="label">Assign Project Manager</label>
            <select className="input" value={form.managerId}
              onChange={e => setForm(f => ({...f, managerId: e.target.value}))}>
              <option value="">Assign later</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setConvert(null)} className="btn-outline">Cancel</button>
          <button onClick={handleConvert} className="btn-primary">Convert to Project</button>
        </div>
      </Modal>
    </AdminLayout>
  )
}
