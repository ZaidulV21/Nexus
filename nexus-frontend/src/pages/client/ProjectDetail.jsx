// src/pages/client/ProjectDetail.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import ClientLayout from '../../components/layout/ClientLayout'
import { StatusBadge, ProgressBar, PageLoader, Avatar } from '../../components/ui'
import { formatDate, formatDateTime, progressPercent, formatINR } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const TABS = ['Overview', 'Services', 'Timeline', 'Documents', 'Messages', 'Invoices']

export default function ClientProjectDetail() {
  const { id }  = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('Overview')
  const [msg,     setMsg]     = useState('')
  const [sending, setSending] = useState(false)
  const msgEnd = useRef(null)

  const load = () => {
    api.get(`/projects/${id}`).then(r => setProject(r.data.project)).catch(() => toast.error('Failed to load project.')).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])
  useEffect(() => { if (tab === 'Messages') msgEnd.current?.scrollIntoView({ behavior:'smooth' }) }, [project?.messages, tab])

  const sendMessage = async () => {
    if (!msg.trim()) return
    setSending(true)
    try {
      await api.post(`/messages/project/${id}`, { content: msg })
      setMsg('')
      load()
    } catch { toast.error('Failed to send message.') }
    finally { setSending(false) }
  }

  const acceptQuote = async (quoteId) => {
    try {
      await api.put(`/quotes/${quoteId}/accept`)
      toast.success('Quote accepted! Project confirmed.')
      load()
    } catch { toast.error('Failed to accept quote.') }
  }

  if (loading) return <ClientLayout><PageLoader /></ClientLayout>
  if (!project) return <ClientLayout><p className="text-gray-500">Project not found.</p></ClientLayout>

  const pct = progressPercent(project.milestones || [])

  return (
    <ClientLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={project.status} />
              {project.expectedEndDate && <span className="text-xs text-gray-400">Due {formatDate(project.expectedEndDate)}</span>}
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{project.location || 'Location not set'}</p>
          </div>
          {project.totalValue && <p className="text-lg font-medium text-gray-900">{formatINR(project.totalValue)}</p>}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Overall Progress</span><span>{pct}%</span>
          </div>
          <ProgressBar percent={pct} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 mb-6 -mx-4 px-4 md:mx-0 md:px-0 gap-0">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors
              ${tab === t ? 'border-gold-500 text-gold-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
            {t === 'Messages' && project.messages?.filter(m => !m.isRead && m.sender.id !== user?.id).length > 0 && (
              <span className="ml-1.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full inline-flex items-center justify-center">
                {project.messages.filter(m => !m.isRead && m.sender.id !== user?.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Project Details</h3>
            <dl className="space-y-3">
              {[['Status', <StatusBadge status={project.status}/>],['Start Date',formatDate(project.startDate)],['Expected End',formatDate(project.expectedEndDate)],['Location',project.location||'—'],['Total Value',project.totalValue?formatINR(project.totalValue):'—']].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="text-gray-900 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {tab === 'Services' && (
        <div className="space-y-3">
          {project.services?.length === 0 && <p className="text-sm text-gray-400">No services added yet.</p>}
          {project.services?.map(ps => (
            <div key={ps.id} className="card flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900 text-sm">{ps.service?.name}</p>
                {ps.vendorName && <p className="text-xs text-gray-500 mt-0.5">Vendor: {ps.vendorName}</p>}
                {ps.notes && <p className="text-xs text-gray-400 mt-1">{ps.notes}</p>}
              </div>
              <div className="text-right">
                <StatusBadge status={ps.status} />
                {ps.serviceValue && <p className="text-xs text-gray-500 mt-1">{formatINR(ps.serviceValue)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Timeline' && (
        <div className="space-y-3">
          {project.milestones?.length === 0 && <p className="text-sm text-gray-400">No milestones added yet.</p>}
          {project.milestones?.map((m, i) => (
            <div key={m.id} className={`card border-l-4 ${m.status==='COMPLETED'?'border-l-green-400':m.status==='DELAYED'?'border-l-red-400':'border-l-gray-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0
                    ${m.status==='COMPLETED'?'bg-green-100 text-green-700':m.status==='IN_PROGRESS'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-500'}`}>
                    {m.status==='COMPLETED'?'✓':i+1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.title}</p>
                    {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                    {m.completedAt && <p className="text-xs text-green-600 mt-1">Completed {formatDate(m.completedAt)}</p>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={m.status} />
                  {m.dueDate && <p className="text-xs text-gray-400 mt-1">Due {formatDate(m.dueDate)}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Documents' && (
        <div className="space-y-3">
          {project.documents?.length === 0 && <p className="text-sm text-gray-400">No documents uploaded yet.</p>}
          {project.documents?.map(d => (
            <div key={d.id} className="card flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{d.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.type?.replace('_',' ')} · Uploaded by {d.uploader?.name} · {formatDate(d.createdAt)}</p>
              </div>
              <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:underline flex-shrink-0">Download →</a>
            </div>
          ))}
        </div>
      )}

      {tab === 'Messages' && (
        <div className="flex flex-col h-96">
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {project.messages?.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No messages yet. Say hello!</p>}
            {project.messages?.map(m => {
              const isMe = m.sender.id === user?.id
              return (
                <div key={m.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar name={m.sender.name} size="sm" />
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${isMe?'bg-gold-500 text-black':'bg-white border border-gray-200 text-gray-900'}`}>
                    {!isMe && <p className="text-xs font-medium text-gray-500 mb-1">{m.sender.name}</p>}
                    <p>{m.content}</p>
                    <p className={`text-xs mt-1 ${isMe?'text-black/60':'text-gray-400'}`}>{formatDateTime(m.createdAt)}</p>
                  </div>
                </div>
              )
            })}
            <div ref={msgEnd} />
          </div>
          <div className="flex gap-2">
            <input className="input flex-1" value={msg} onChange={e=>setMsg(e.target.value)}
              placeholder="Type a message..." onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendMessage()} />
            <button onClick={sendMessage} disabled={sending||!msg.trim()} className="btn-primary px-4">Send</button>
          </div>
        </div>
      )}

      {tab === 'Invoices' && (
        <div className="space-y-3">
          {project.invoices?.length === 0 && <p className="text-sm text-gray-400">No invoices yet.</p>}
          {project.invoices?.map(inv => (
            <div key={inv.id} className="card flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
                <p className="text-xl font-light text-gray-900 mt-1">{formatINR(inv.amount)}</p>
                {inv.dueDate && <p className="text-xs text-gray-500 mt-1">Due {formatDate(inv.dueDate)}</p>}
                {inv.paidAt  && <p className="text-xs text-green-600 mt-0.5">Paid {formatDate(inv.paidAt)}</p>}
              </div>
              <div className="text-right">
                <StatusBadge status={inv.status} />
                {inv.pdfUrl && <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:underline block mt-2">Download PDF →</a>}
              </div>
            </div>
          ))}
          {project.quotes?.filter(q=>q.status==='SENT').map(q => (
            <div key={q.id} className="card bg-yellow-50 border-yellow-200">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-medium text-yellow-700 uppercase tracking-wider mb-1">Quote Pending Your Approval</p>
                  <p className="text-sm font-medium text-gray-900">{q.quoteNumber}</p>
                  <p className="text-xl font-light text-gray-900 mt-1">{formatINR(q.totalAmount)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Valid until {formatDate(q.validUntil)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {q.pdfUrl && <a href={q.pdfUrl} target="_blank" rel="noreferrer" className="btn-outline text-xs py-1.5 px-3">View Quote</a>}
                  <button onClick={() => acceptQuote(q.id)} className="btn-primary text-xs py-1.5 px-3">Accept Quote</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  )
}
