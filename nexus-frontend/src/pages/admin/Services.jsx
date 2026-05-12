// src/pages/admin/Services.jsx
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { PageLoader, EmptyState, Modal } from '../../components/ui'
import { formatINR } from '../../utils/helpers'
import { Plus, Edit2, EyeOff, Eye } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ICONS = ['sofa','zap','sun','megaphone','monitor','camera','wind','droplets','paintbrush','wrench','shield','wifi']
const ICON_DISPLAY = { sofa:'🏠', zap:'⚡', sun:'☀️', megaphone:'📋', monitor:'💻', camera:'📷', wind:'❄️', droplets:'🚿', paintbrush:'🎨', wrench:'🔧', shield:'🛡️', wifi:'📶' }

const EMPTY_FORM = { name:'', description:'', icon:'sofa', category:'Civil', basePrice:'', sortOrder:0, isActive:true }

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY_FORM)

  const load = () => {
    api.get('/services?all=true')
      .then(r => setServices(r.data.services))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit   = (s)  => { setEditing(s); setForm({ name:s.name, description:s.description, icon:s.icon||'sofa', category:s.category, basePrice:s.basePrice||'', sortOrder:s.sortOrder, isActive:s.isActive }); setShowForm(true) }

  const save = async () => {
    if (!form.name || !form.description) return toast.error('Name and description required.')
    const payload = { ...form, basePrice: form.basePrice ? parseFloat(form.basePrice) : null }
    try {
      if (editing) {
        await api.put(`/services/${editing.id}`, payload)
        toast.success('Service updated.')
      } else {
        await api.post('/services', payload)
        toast.success('Service created.')
      }
      setShowForm(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed.') }
  }

  const toggle = async (s) => {
    try {
      await api.put(`/services/${s.id}`, { isActive: !s.isActive })
      toast.success(s.isActive ? 'Service hidden.' : 'Service shown.')
      load()
    } catch { toast.error('Failed.') }
  }

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Services</h1>
          <p className="section-sub">Manage the services shown on your website.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <EmptyState icon="⚙️" title="No services" description="Add your first service." action={<button onClick={openCreate} className="btn-primary">Add Service</button>} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.id} className={`card transition-opacity ${!s.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{ICON_DISPLAY[s.icon] || '🔧'}</div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="p-1 text-gray-400 hover:text-gray-700"><Edit2 size={14}/></button>
                  <button onClick={() => toggle(s)} className="p-1 text-gray-400 hover:text-gray-700" title={s.isActive?'Hide':'Show'}>
                    {s.isActive ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">{s.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">{s.description?.slice(0,80)}...</p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{s.category}</span>
                {s.basePrice && <span className="text-xs text-gold-600 font-medium">From {formatINR(s.basePrice)}</span>}
              </div>
              {!s.isActive && <p className="text-xs text-gray-400 mt-2 text-center">Hidden on website</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Service' : 'Add Service'} size="md">
        <div className="space-y-3">
          <div><label className="label">Service Name *</label><input className="input" value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Description *</label><textarea className="input" rows={3} value={form.description} onChange={set('description')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Icon</label>
              <select className="input" value={form.icon} onChange={set('icon')}>
                {ICONS.map(i => <option key={i} value={i}>{ICON_DISPLAY[i]} {i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={set('category')}>
                {['Civil','Energy','Branding','Technology','General'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Starting Price (₹)</label><input className="input" type="number" value={form.basePrice} onChange={set('basePrice')} placeholder="e.g. 50000" /></div>
            <div><label className="label">Sort Order</label><input className="input" type="number" value={form.sortOrder} onChange={set('sortOrder')} /></div>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          <button onClick={save} className="btn-primary">{editing ? 'Save Changes' : 'Add Service'}</button>
        </div>
      </Modal>
    </AdminLayout>
  )
}
