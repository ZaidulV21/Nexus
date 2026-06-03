// src/pages/client/Projects.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ClientLayout from '../../components/layout/ClientLayout'
import { StatusBadge, ProgressBar, EmptyState, PageLoader } from '../../components/ui'
import { formatDate, progressPercent } from '../../utils/helpers'
import api from '../../api/axios'

export default function ClientProjects() {
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.projects)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <ClientLayout><PageLoader /></ClientLayout>

  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="section-title">My Projects</h1>
        <p className="section-sub">All your Nexus-managed projects in one place.</p>
      </div>
      {projects.length === 0 ? (
        <EmptyState icon="🏗️" title="No projects yet" description="Your projects will appear here once our team sets them up." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map(p => (
            <Link key={p.id} to={`/dashboard/projects/${p.id}`}
              className="card hover:border-gold-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={p.status} />
                <span className="text-xs text-gray-400">{formatDate(p.createdAt)}</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{p.title}</h3>
              <p className="text-xs text-gray-500 mb-4">{p.location || 'Location not set'}</p>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{progressPercent(p.milestones||[])}%</span>
              </div>
              <ProgressBar percent={progressPercent(p.milestones||[])} />
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">{p.status}</span>
                <span className="text-xs text-gold-600 font-medium">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ClientLayout>
  )
}
