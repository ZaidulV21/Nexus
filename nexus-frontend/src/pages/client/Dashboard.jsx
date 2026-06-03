// src/pages/client/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ClientLayout from '../../components/layout/ClientLayout'
import { StatCard, StatusBadge, ProgressBar, PageLoader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { formatDate, progressPercent } from '../../utils/helpers'
import { FolderOpen, FileText, Receipt, MessageSquare } from 'lucide-react'
import api from '../../api/axios'

export default function ClientDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.projects)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <ClientLayout><PageLoader /></ClientLayout>

  const active    = projects.filter(p => ['CONFIRMED','IN_PROGRESS'].includes(p.status))
  const completed = projects.filter(p => p.status === 'COMPLETED')

  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">{user?.companyName || 'Your projects are managed by the Nexus team.'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects"  value={projects.length} icon={<FolderOpen size={18}/>} color="gold" />
        <StatCard label="Active"          value={active.length}   icon={<MessageSquare size={18}/>} color="blue" />
        <StatCard label="Completed"       value={completed.length} icon={<FileText size={18}/>} color="green" />
        <StatCard label="Pending Action"  value={projects.filter(p=>p.status==='QUOTE_SENT').length} icon={<Receipt size={18}/>} color="red" />
      </div>

      {/* Active Projects */}
      {active.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-medium text-gray-900 mb-4">Active Projects</h2>
          <div className="space-y-3">
            {active.map(p => (
              <Link key={p.id} to={`/dashboard/projects/${p.id}`}
                className="card flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gold-300 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={p.status} />
                    <p className="text-sm text-gray-400 truncate">{formatDate(p.startDate)}</p>
                  </div>
                  <p className="font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.location || 'Location not set'}</p>
                </div>
                <div className="sm:w-48">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{progressPercent(p.milestones || [])}%</span>
                  </div>
                  <ProgressBar percent={progressPercent(p.milestones || [])} />
                </div>
                <div className="text-xs text-gold-600 font-medium flex-shrink-0">View →</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quote Action Required */}
      {projects.filter(p => p.status === 'QUOTE_SENT').length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-yellow-800">⚠️ You have quotes waiting for your review</p>
          <Link to="/dashboard/quotes" className="text-xs text-yellow-700 underline mt-1 inline-block">View Quotes →</Link>
        </div>
      )}

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🏗️</div>
          <p className="text-base font-medium text-gray-900 mb-1">No projects yet</p>
          <p className="text-sm text-gray-500 mb-4">Your projects will appear here once our team sets them up.</p>
          <Link to="/contact" className="btn-primary text-sm">Request a Project</Link>
        </div>
      )}

      {/* All Projects */}
      {projects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-gray-900">All Projects</h2>
            <Link to="/dashboard/projects" className="text-xs text-gold-600 hover:underline">View all →</Link>
          </div>
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header text-left px-4 py-3">Project</th>
                  <th className="table-header text-left px-4 py-3">Status</th>
                  <th className="table-header text-left px-4 py-3 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/dashboard/projects/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-gold-600">{p.title}</Link>
                      <p className="text-xs text-gray-400">{p.location || '—'}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ClientLayout>
  )
}
