// src/pages/admin/Clients.jsx
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { PageLoader, EmptyState, Modal, Avatar } from '../../components/ui'
import { formatDate } from '../../utils/helpers'
import { Plus } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form,    setForm]    = useState({ name:'', email:'', phone:'', companyName:'', password:'' })

  const load = () => {
    api.get('/admin/users?role=CLIENT')
      .then(r => setClients(r.data.users))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const createClient = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Name, email and password required.')
    try {
      await api.post('/admin/users', { ...form, role: 'CLIENT' })
      toast.success('Client account created.')
      setShowNew(false)
      setForm({ name:'', email:'', phone:'', companyName:'', password:'' })
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create client.') }
  }

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Clients</h1>
          <p className="section-sub">{clients.length} registered clients.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Client
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState icon="👥" title="No clients yet" description="Clients are created when enquiries are converted to projects, or manually here." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Client','Company','Phone','Projects','Joined'].map(h => (
                  <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size="sm" url={c.avatarUrl} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.companyName || '—'}</td>
                  <td className="px-4 py-3">
                    {c.phone ? <a href={`tel:${c.phone}`} className="text-sm text-gold-600 hover:underline">{c.phone}</a> : <span className="text-gray-300 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{c._count?.clientProjects || 0} projects</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Create Client Account" size="sm">
        <div className="space-y-3">
          <div><label className="label">Full Name *</label><input className="input" value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={set('email')} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
          <div><label className="label">Company</label><input className="input" value={form.companyName} onChange={set('companyName')} /></div>
          <div><label className="label">Password *</label><input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" /></div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setShowNew(false)} className="btn-outline">Cancel</button>
          <button onClick={createClient} className="btn-primary">Create Client</button>
        </div>
      </Modal>
    </AdminLayout>
  )
}
