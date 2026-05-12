// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import { StatCard, StatusBadge, PageLoader } from '../../components/ui'
import { formatDate, formatINR } from '../../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { FolderOpen, Users, MessageSquare, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>

  const { stats, recentProjects, recentEnquiries } = data || {}

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="section-title">Dashboard</h1>
        <p className="section-sub">Overview of Nexus operations.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Projects"  value={stats?.activeProjects  || 0} icon={<FolderOpen size={18}/>}    color="blue"  sub={`${stats?.totalProjects || 0} total`} />
        <StatCard label="Total Clients"    value={stats?.totalClients    || 0} icon={<Users size={18}/>}         color="gold" />
        <StatCard label="New Enquiries"    value={stats?.newEnquiries    || 0} icon={<MessageSquare size={18}/>} color="green" sub="Uncontacted" />
        <StatCard label="Revenue (Month)"  value={formatINR(stats?.revenueThisMonth || 0)} icon={<TrendingUp size={18}/>} color="gold" sub={`${formatINR(stats?.totalRevenue||0)} total`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending Quotes"   value={stats?.pendingQuotes    || 0} icon={<Clock size={18}/>}       color="gray" sub="Awaiting client" />
        <StatCard label="Overdue Invoices" value={stats?.overdueInvoices  || 0} icon={<AlertCircle size={18}/>} color="red" />
        <StatCard label="Completed (Month)"value={stats?.completedThisMonth||0} icon={<FolderOpen size={18}/>}  color="green" />
        <StatCard label="Total Revenue"    value={formatINR(stats?.totalRevenue||0)} icon={<TrendingUp size={18}/>} color="gold" />
      </div>

      {/* Revenue chart */}
      <RevenueChart />

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Recent Projects */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900">Recent Projects</h2>
            <Link to="/admin/projects" className="text-xs text-gold-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentProjects?.length === 0 && <p className="px-4 py-6 text-sm text-gray-400 text-center">No projects yet.</p>}
            {recentProjects?.map(p => (
              <Link key={p.id} to={`/admin/projects/${p.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">{p.client?.name} · {formatDate(p.createdAt)}</p>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900">Recent Enquiries</h2>
            <Link to="/admin/enquiries" className="text-xs text-gold-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentEnquiries?.length === 0 && <p className="px-4 py-6 text-sm text-gray-400 text-center">No enquiries yet.</p>}
            {recentEnquiries?.map(e => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{e.name}</p>
                  <p className="text-xs text-gray-400">{e.phone} · {formatDate(e.createdAt)}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function RevenueChart() {
  const [data, setData] = useState([])
  useEffect(() => {
    api.get('/admin/reports/revenue')
      .then(r => setData(r.data.monthlyRevenue || []))
      .catch(() => {})
  }, [])

  if (!data.length) return null

  return (
    <div className="card">
      <h2 className="text-sm font-medium text-gray-900 mb-4">Revenue — Last 12 Months</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
            tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}K`} />
          <Tooltip formatter={v => formatINR(v)} labelStyle={{ fontSize: 12 }} />
          <Bar dataKey="revenue" fill="#C9A84C" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
