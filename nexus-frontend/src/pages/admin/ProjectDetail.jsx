// src/pages/admin/ProjectDetail.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { StatusBadge, PageLoader, Modal, Avatar } from '../../components/ui'
import { formatDate, formatDateTime, formatINR } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const TABS    = ['Overview','Services','Timeline','Documents','Messages','Quotes','Invoices']
const PROJECT_STATUSES = ['ENQUIRY','QUOTE_SENT','CONFIRMED','IN_PROGRESS','COMPLETED','ON_HOLD','CANCELLED']

export default function AdminProjectDetail() {
  const { id }   = useParams()
  const { user } = useAuth()
  const [project,  setProject]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('Overview')
  const [managers, setManagers] = useState([])
  const [services, setServices] = useState([])
  const msgEnd = useRef(null)

  // Message state
  const [msg,     setMsg]     = useState('')
  const [sending, setSending] = useState(false)

  // Milestone modal
  const [showMS,   setShowMS]   = useState(false)
  const [msForm,   setMsForm]   = useState({ title:'', description:'', dueDate:'' })

  // Quote builder
  const [showQuote, setShowQuote] = useState(false)
  const [qItems,    setQItems]    = useState([{ description:'', quantity:1, unit:'Lumpsum', unitPrice:0, total:0 }])
  const [qForm,     setQForm]     = useState({ taxPercent:18, validUntil:'', notes:'' })

  // Invoice modal
  const [showInv,  setShowInv]  = useState(false)
  const [invForm,  setInvForm]  = useState({ amount:'', taxPercent:18, dueDate:'', notes:'', items:[] })

  const load = () => {
    api.get(`/projects/${id}`)
      .then(r => setProject(r.data.project))
      .catch(() => toast.error('Failed to load project.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])
  useEffect(() => {
    api.get('/admin/users?role=PROJECT_MANAGER').then(r => setManagers(r.data.users)).catch(() => {})
    api.get('/services').then(r => setServices(r.data.services)).catch(() => {})
  }, [])
  useEffect(() => { if (tab === 'Messages') msgEnd.current?.scrollIntoView({ behavior:'smooth' }) }, [project?.messages, tab])

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>
  if (!project) return <AdminLayout><p>Project not found.</p></AdminLayout>

  // ── Handlers ──────────────────────────────────────────────

  const updateStatus = async (status) => {
    try { await api.put(`/projects/${id}`, { status }); toast.success('Status updated.'); load() }
    catch { toast.error('Failed to update status.') }
  }

  const assignManager = async (managerId) => {
    try { await api.put(`/projects/${id}`, { managerId }); toast.success('Manager assigned.'); load() }
    catch { toast.error('Failed to assign manager.') }
  }

  const sendMessage = async () => {
    if (!msg.trim()) return
    setSending(true)
    try { await api.post(`/messages/project/${id}`, { content: msg }); setMsg(''); load() }
    catch { toast.error('Failed to send.') }
    finally { setSending(false) }
  }

  const createMilestone = async () => {
    if (!msForm.title) return toast.error('Title required.')
    try {
      await api.post(`/milestones/project/${id}`, msForm)
      toast.success('Milestone added.')
      setShowMS(false); setMsForm({ title:'', description:'', dueDate:'' }); load()
    } catch { toast.error('Failed to add milestone.') }
  }

  const completeMilestone = async (msId) => {
    try { await api.put(`/milestones/${msId}/complete`); toast.success('Milestone marked complete!'); load() }
    catch { toast.error('Failed.') }
  }

  const updateQItem = (i, field, val) => {
    setQItems(prev => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: val }
      if (field === 'unitPrice' || field === 'quantity') {
        next[i].total = (Number(next[i].unitPrice) || 0) * (Number(next[i].quantity) || 1)
      }
      return next
    })
  }

  const sendQuote = async () => {
    const subtotal = qItems.reduce((s, i) => s + (Number(i.total) || 0), 0)
    if (subtotal <= 0) return toast.error('Add at least one item.')
    try {
      const { data } = await api.post('/quotes', { projectId: id, items: qItems, ...qForm })
      await api.put(`/quotes/${data.quote.id}/send`)
      toast.success('Quote sent to client!')
      setShowQuote(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to send quote.') }
  }

  const createInvoice = async () => {
    if (!invForm.amount) return toast.error('Amount required.')
    try {
      const { data } = await api.post('/invoices', { projectId: id, ...invForm })
      await api.put(`/invoices/${data.invoice.id}/send`)
      toast.success('Invoice sent to client!')
      setShowInv(false); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create invoice.') }
  }

  const markPaid = async (invId) => {
    const method = prompt('Payment method? (NEFT/UPI/Cheque/Cash)')
    if (!method) return
    const ref = prompt('Transaction reference? (optional)') || ''
    try { await api.put(`/invoices/${invId}/mark-paid`, { paymentMethod: method, transactionRef: ref }); toast.success('Invoice marked as paid.'); load() }
    catch { toast.error('Failed.') }
  }

  const subtotal = qItems.reduce((s,i) => s + (Number(i.total)||0), 0)
  const tax      = subtotal * (Number(qForm.taxPercent) / 100)

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <select value={project.status} onChange={e => updateStatus(e.target.value)}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-gold-400">
                {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {project.client?.name} · {project.client?.companyName || ''} · {project.location || 'No location'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowQuote(true)} className="btn-primary text-xs py-2 px-4">+ Send Quote</button>
            <button onClick={() => setShowInv(true)}   className="btn-outline text-xs py-2 px-4">+ Invoice</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 mb-6 -mx-4 px-4 md:mx-0 md:px-0 gap-0">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors
              ${tab===t?'border-gold-500 text-gold-600 font-medium':'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'Overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Project Details</h3>
            <dl className="space-y-3 text-sm">
              {[['Client', project.client?.name],['Email', project.client?.email],['Phone', project.client?.phone||'—'],['Company', project.client?.companyName||'—'],['Location', project.location||'—'],['Start', formatDate(project.startDate)],['Expected End', formatDate(project.expectedEndDate)],['Total Value', project.totalValue ? formatINR(project.totalValue):'—']].map(([k,v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-medium text-gray-900 text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Assign Project Manager</h3>
            <select value={project.managerId || ''} onChange={e => assignManager(e.target.value)} className="input">
              <option value="">Not assigned</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {project.manager && (
              <div className="flex items-center gap-3 mt-2">
                <Avatar name={project.manager.name} size="md" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{project.manager.name}</p>
                  <p className="text-xs text-gray-400">{project.manager.email}</p>
                </div>
              </div>
            )}
            {project.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-gray-600">{project.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SERVICES ── */}
      {tab === 'Services' && (
        <div className="space-y-3">
          {project.services?.map(ps => (
            <div key={ps.id} className="card flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-medium text-gray-900 text-sm">{ps.service?.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">Vendor: {ps.vendorName || 'Not assigned'} {ps.vendorPhone ? `· ${ps.vendorPhone}` : ''}</p>
                {ps.notes && <p className="text-xs text-gray-400 mt-1">{ps.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                {ps.serviceValue && <span className="text-sm text-gray-700">{formatINR(ps.serviceValue)}</span>}
                <select value={ps.status} onChange={async e => {
                  try { await api.put(`/projects/${id}/services/${ps.id}`, { status: e.target.value }); load() }
                  catch { toast.error('Failed.') }
                }} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none">
                  {['PENDING','ASSIGNED','IN_PROGRESS','DONE'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
          {project.services?.length === 0 && <p className="text-sm text-gray-400">No services added.</p>}
        </div>
      )}

      {/* ── TIMELINE ── */}
      {tab === 'Timeline' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowMS(true)} className="btn-primary text-xs py-2 px-4">+ Add Milestone</button>
          </div>
          <div className="space-y-3">
            {project.milestones?.map((m,i) => (
              <div key={m.id} className={`card border-l-4 flex items-start justify-between gap-4 flex-wrap
                ${m.status==='COMPLETED'?'border-l-green-400':m.status==='DELAYED'?'border-l-red-400':'border-l-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5
                    ${m.status==='COMPLETED'?'bg-green-100 text-green-700':m.status==='IN_PROGRESS'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-500'}`}>
                    {m.status==='COMPLETED'?'✓':i+1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.title}</p>
                    {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                    {m.dueDate && <p className="text-xs text-gray-400 mt-0.5">Due: {formatDate(m.dueDate)}</p>}
                    {m.completedAt && <p className="text-xs text-green-600 mt-0.5">✓ Completed {formatDate(m.completedAt)}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={m.status} />
                  {m.status !== 'COMPLETED' && (
                    <button onClick={() => completeMilestone(m.id)} className="text-xs text-green-600 border border-green-200 px-2 py-1 hover:bg-green-50 rounded transition-colors">
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))}
            {project.milestones?.length === 0 && <p className="text-sm text-gray-400">No milestones yet.</p>}
          </div>
        </div>
      )}

      {/* ── DOCUMENTS ── */}
      {tab === 'Documents' && (
        <div>
          <div className="flex justify-end mb-4">
            <label className="btn-primary text-xs py-2 px-4 cursor-pointer">
              Upload Document
              <input type="file" className="hidden" onChange={async e => {
                const file = e.target.files?.[0]
                if (!file) return
                const fd = new FormData()
                fd.append('file', file)
                fd.append('name', file.name)
                fd.append('type', 'OTHER')
                try {
                  await api.post(`/documents/project/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                  toast.success('Document uploaded.')
                  load()
                } catch { toast.error('Upload failed.') }
              }} />
            </label>
          </div>
          <div className="space-y-3">
            {project.documents?.map(d => (
              <div key={d.id} className="card flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.type} · {d.uploader?.name} · {formatDate(d.createdAt)}</p>
                </div>
                <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:underline flex-shrink-0">Download →</a>
              </div>
            ))}
            {project.documents?.length === 0 && <p className="text-sm text-gray-400">No documents yet.</p>}
          </div>
        </div>
      )}

      {/* ── MESSAGES ── */}
      {tab === 'Messages' && (
        <div className="flex flex-col h-96">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {project.messages?.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No messages yet.</p>}
            {project.messages?.map(m => {
              const isMe = m.sender.id === user?.id
              return (
                <div key={m.id} className={`flex gap-2 ${isMe?'flex-row-reverse':'flex-row'}`}>
                  <Avatar name={m.sender.name} size="sm" />
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${isMe?'bg-gold-500 text-black':'bg-white border border-gray-200'}`}>
                    {!isMe && <p className="text-xs font-medium text-gray-500 mb-1">{m.sender.name} ({m.sender.role})</p>}
                    <p>{m.content}</p>
                    <p className={`text-xs mt-1 ${isMe?'text-black/60':'text-gray-400'}`}>{formatDateTime(m.createdAt)}</p>
                  </div>
                </div>
              )
            })}
            <div ref={msgEnd} />
          </div>
          <div className="flex gap-2">
            <input className="input flex-1" value={msg} onChange={e => setMsg(e.target.value)}
              placeholder="Message to client..." onKeyDown={e => e.key==='Enter'&&!e.shiftKey&&sendMessage()} />
            <button onClick={sendMessage} disabled={sending||!msg.trim()} className="btn-primary px-4">Send</button>
          </div>
        </div>
      )}

      {/* ── QUOTES ── */}
      {tab === 'Quotes' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowQuote(true)} className="btn-primary text-xs py-2 px-4">+ New Quote</button>
          </div>
          {project.quotes?.map(q => (
            <div key={q.id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1"><StatusBadge status={q.status} /><span className="text-xs text-gray-400">{q.quoteNumber}</span></div>
                  <p className="text-xl font-light text-gray-900">{formatINR(q.totalAmount)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Sent: {formatDate(q.createdAt)} · Valid: {formatDate(q.validUntil)}</p>
                  {q.rejectionReason && <p className="text-xs text-red-500 mt-1">Client: "{q.rejectionReason}"</p>}
                </div>
                {q.pdfUrl && <a href={q.pdfUrl} target="_blank" rel="noreferrer" className="btn-outline text-xs py-1.5 px-3">PDF →</a>}
              </div>
            </div>
          ))}
          {project.quotes?.length === 0 && <p className="text-sm text-gray-400">No quotes yet.</p>}
        </div>
      )}

      {/* ── INVOICES ── */}
      {tab === 'Invoices' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowInv(true)} className="btn-primary text-xs py-2 px-4">+ New Invoice</button>
          </div>
          {project.invoices?.map(inv => (
            <div key={inv.id} className="card flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1"><StatusBadge status={inv.status}/><span className="text-xs text-gray-400">{inv.invoiceNumber}</span></div>
                <p className="text-xl font-light text-gray-900">{formatINR(inv.amount)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Due: {formatDate(inv.dueDate) || '—'} {inv.paidAt ? `· Paid ${formatDate(inv.paidAt)}` : ''}</p>
              </div>
              <div className="flex gap-2">
                {inv.pdfUrl && <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="btn-outline text-xs py-1.5 px-3">PDF →</a>}
                {inv.status !== 'PAID' && (
                  <button onClick={() => markPaid(inv.id)} className="text-xs bg-green-600 text-white px-3 py-1.5 hover:bg-green-700 rounded transition-colors">Mark Paid</button>
                )}
              </div>
            </div>
          ))}
          {project.invoices?.length === 0 && <p className="text-sm text-gray-400">No invoices yet.</p>}
        </div>
      )}

      {/* ── MILESTONE MODAL ── */}
      <Modal open={showMS} onClose={() => setShowMS(false)} title="Add Milestone" size="sm">
        <div className="space-y-3">
          <div><label className="label">Title *</label><input className="input" value={msForm.title} onChange={e => setMsForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Site Survey Complete" /></div>
          <div><label className="label">Description</label><textarea className="input" rows={2} value={msForm.description} onChange={e => setMsForm(f=>({...f,description:e.target.value}))} /></div>
          <div><label className="label">Due Date</label><input type="date" className="input" value={msForm.dueDate} onChange={e => setMsForm(f=>({...f,dueDate:e.target.value}))} /></div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setShowMS(false)} className="btn-outline">Cancel</button>
          <button onClick={createMilestone} className="btn-primary">Add Milestone</button>
        </div>
      </Modal>

      {/* ── QUOTE BUILDER MODAL ── */}
      <Modal open={showQuote} onClose={() => setShowQuote(false)} title="Quote Builder" size="xl">
        <div className="space-y-4">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-500 uppercase">
              <th className="text-left pb-2">Description</th>
              <th className="text-left pb-2 w-16">Qty</th>
              <th className="text-left pb-2 w-24">Unit</th>
              <th className="text-left pb-2 w-28">Unit Price</th>
              <th className="text-right pb-2 w-28">Total</th>
              <th className="w-8"></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {qItems.map((item,i) => (
                <tr key={i}>
                  <td className="py-2 pr-2"><input className="input text-xs" value={item.description} onChange={e=>updateQItem(i,'description',e.target.value)} placeholder="Service description" /></td>
                  <td className="py-2 pr-2"><input className="input text-xs w-16" type="number" value={item.quantity} onChange={e=>updateQItem(i,'quantity',e.target.value)} /></td>
                  <td className="py-2 pr-2"><input className="input text-xs w-24" value={item.unit} onChange={e=>updateQItem(i,'unit',e.target.value)} /></td>
                  <td className="py-2 pr-2"><input className="input text-xs w-28" type="number" value={item.unitPrice} onChange={e=>updateQItem(i,'unitPrice',e.target.value)} /></td>
                  <td className="py-2 text-right font-medium">{formatINR(item.total)}</td>
                  <td className="py-2 pl-2"><button onClick={()=>setQItems(prev=>prev.filter((_,j)=>j!==i))} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={()=>setQItems(prev=>[...prev,{description:'',quantity:1,unit:'Lumpsum',unitPrice:0,total:0}])} className="text-xs text-gold-600 hover:underline">+ Add Line Item</button>
          <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">GST (%)</span>
              <input className="input w-20 text-right text-xs" type="number" value={qForm.taxPercent} onChange={e=>setQForm(f=>({...f,taxPercent:e.target.value}))} />
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatINR(tax)}</span></div>
            <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{formatINR(subtotal+tax)}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Valid Until</label><input type="date" className="input" value={qForm.validUntil} onChange={e=>setQForm(f=>({...f,validUntil:e.target.value}))} /></div>
            <div><label className="label">Notes / Terms</label><input className="input" value={qForm.notes} onChange={e=>setQForm(f=>({...f,notes:e.target.value}))} placeholder="Payment terms..." /></div>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setShowQuote(false)} className="btn-outline">Cancel</button>
          <button onClick={sendQuote} className="btn-primary">Generate PDF & Send to Client</button>
        </div>
      </Modal>

      {/* ── INVOICE MODAL ── */}
      <Modal open={showInv} onClose={() => setShowInv(false)} title="Create Invoice" size="sm">
        <div className="space-y-3">
          <div><label className="label">Amount (₹) *</label><input className="input" type="number" value={invForm.amount} onChange={e=>setInvForm(f=>({...f,amount:e.target.value}))} placeholder="e.g. 150000" /></div>
          <div><label className="label">GST %</label><input className="input" type="number" value={invForm.taxPercent} onChange={e=>setInvForm(f=>({...f,taxPercent:e.target.value}))} /></div>
          <div><label className="label">Due Date</label><input type="date" className="input" value={invForm.dueDate} onChange={e=>setInvForm(f=>({...f,dueDate:e.target.value}))} /></div>
          <div><label className="label">Notes</label><input className="input" value={invForm.notes} onChange={e=>setInvForm(f=>({...f,notes:e.target.value}))} placeholder="e.g. 30% advance payment" /></div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={() => setShowInv(false)} className="btn-outline">Cancel</button>
          <button onClick={createInvoice} className="btn-primary">Create & Send Invoice</button>
        </div>
      </Modal>
    </AdminLayout>
  )
}
