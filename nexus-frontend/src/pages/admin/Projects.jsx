// src/pages/admin/Projects.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { StatusBadge, PageLoader, EmptyState, Modal } from '../../components/ui'
import { formatDate, formatINR } from '../../utils/helpers'
import { Plus } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const STATUSES = ['','ENQUIRY','QUOTE_SENT','CONFIRMED','IN_PROGRESS','COMPLETED','ON_HOLD','CANCELLED']

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('')
  const [showNew,  setShowNew]  = useState(false)
  const [clients,  setClients]  = useState([])
  const [managers, setManagers] = useState([])
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ clientId:'', managerId:'', title:'', location:'', startDate:'', expectedEndDate:'', totalValue:'', serviceIds:[] })

  const load = () => {
    const params = filter ? `?status=${filter}` : ''
    api.get(`/projects${params}`)
      .then(r => setProjects(r.data.projects))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  useEffect(() => {
    Promise.all([
      api.get('/admin/users?role=CLIENT'),
      api.get('/admin/users?role=PROJECT_MANAGER'),
      api.get('/services'),
    ]).then(([c, m, s]) => {
      setClients(c.data.users)
      setManagers(m.data.users)
      setServices(s.data.services)
    }).catch(() => {})
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleService = (id) => {
    setForm(f => ({
      ...f,
      serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter(s => s !== id) : [...f.serviceIds, id]
    }))
  }

  const createProject = async () => {
    if (!form.clientId || !form.title) return toast.error('Client and project title are required.')
    try {
      await api.post('/projects', form)
      toast.success('Project created!')
      setShowNew(false)
      setForm({ clientId:'', managerId:'', title:'', location:'', startDate:'', expectedEndDate:'', totalValue:'', serviceIds:[] })
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create project.') }
  }

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="section-title">Projects</h1>
          <p className="section-sub">{projects.length} total projects.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs rounded border whitespace-nowrap transition-colors
              ${filter === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {projects.length === 0 ? (
        <EmptyState icon="🏗️" title="No projects" description="Create your first project or convert an enquiry." action={<button onClick={() => setShowNew(true)} className="btn-primary">New Project</button>} />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Project','Client','Manager','Status','Value','Start','Actions'].map(h => (
                    <th key={h} className="table-header text-left px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.location || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{p.client?.name}</p>
                      <p className="text-xs text-gray-400">{p.client?.companyName || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.manager?.name || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.totalValue ? formatINR(p.totalValue) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(p.startDate) || formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/projects/${p.id}`} className="text-xs text-gold-600 hover:underline whitespace-nowrap">Manage →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Project modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Create New Project" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Project Title *</label>
            <input className="input" value={form.title} onChange={set('title')} placeholder="e.g. Office Renovation — Kapoor Logistics" />
          </div>
          <div>
            <label className="label">Client *</label>
            <select className="input" value={form.clientId} onChange={set('clientId')}>
              <option value="">Select client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Project Manager</label>
            <select className="input" value={form.managerId} onChange={set('managerId')}>
              <option value="">Assign later</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={set('location')} placeholder="e.g. Gomti Nagar, Lucknow" />
          </div>
          <div>
            <label className="label">Start Date</label>
            <input className="input" type="date" value={form.startDate} onChange={set('startDate')} />
          </div>
          <div>
            <label className="label">Expected End Date</label>
            <input className="input" type="date" value={form.expectedEndDate} onChange={set('expectedEndDate')} />
          </div>
          <div className="col-span-2">
            <label className="label">Total Project Value (₹)</label>
            <input className="input" type="number" value={form.totalValue} onChange={set('totalValue')} placeholder="e.g. 500000" />
          </div>
          <div className="col-span-2">
            <label className="label">Services</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {services.map(s => (
                <button type="button" key={s.id} onClick={() => toggleService(s.id)}
                  className={`px-3 py-1.5 text-xs border rounded transition-colors
                    ${form.serviceIds.includes(s.id) ? 'bg-gold-500 text-black border-gold-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setShowNew(false)} className="btn-outline">Cancel</button>
          <button onClick={createProject} className="btn-primary">Create Project</button>
        </div>
      </Modal>
    </AdminLayout>
  )
}
