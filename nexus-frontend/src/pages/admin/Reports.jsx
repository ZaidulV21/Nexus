// src/pages/admin/Reports.jsx
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { PageLoader } from '../../components/ui'
import { formatINR } from '../../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../api/axios'

const PIE_COLORS = ['#C9A84C','#3B82F6','#10B981','#EF4444','#8B5CF6','#F97316','#6B7280']

export default function AdminReports() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/reports/revenue')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>

  const totalRevenue = data?.monthlyRevenue?.reduce((s, m) => s + m.revenue, 0) || 0
  const pieData      = data?.projectsByStatus?.map(p => ({
    name:  p.status.replace(/_/g,' '),
    value: p._count.status,
  })) || []

  const exportCSV = () => {
    const rows  = [['Month','Revenue','Projects'], ...(data?.monthlyRevenue||[]).map(m => [m.month, m.revenue, m.count])]
    const csv   = rows.map(r => r.join(',')).join('\n')
    const blob  = new Blob([csv], { type: 'text/csv' })
    const url   = URL.createObjectURL(blob)
    const a     = document.createElement('a')
    a.href      = url
    a.download  = 'nexus-revenue-report.csv'
    a.click()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Reports</h1>
          <p className="section-sub">Revenue, project status, and performance overview.</p>
        </div>
        <button onClick={exportCSV} className="btn-outline text-xs py-2 px-4">Export CSV</button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          ['Total Revenue',     formatINR(totalRevenue)],
          ['Avg/Month',         formatINR(totalRevenue / 12)],
          ['Best Month',        data?.monthlyRevenue ? formatINR(Math.max(...data.monthlyRevenue.map(m => m.revenue))) : '—'],
          ['Total Projects',    data?.projectsByStatus?.reduce((s,p) => s + p._count.status, 0) || 0],
        ].map(([label, value]) => (
          <div key={label} className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue bar chart */}
      <div className="card mb-6">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Monthly Revenue — Last 12 Months</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data?.monthlyRevenue || []} margin={{ top:0, right:0, left:0, bottom:0 }}>
            <XAxis dataKey="month" tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip formatter={v => formatINR(v)} />
            <Bar dataKey="revenue" fill="#C9A84C" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Projects by status */}
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Projects by Status</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">No project data.</p>}
        </div>

        {/* Monthly table */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Monthly Breakdown</h2>
          </div>
          <div className="overflow-y-auto max-h-56">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header text-left px-4 py-2">Month</th>
                  <th className="table-header text-right px-4 py-2">Revenue</th>
                  <th className="table-header text-right px-4 py-2">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.monthlyRevenue||[]).map(m => (
                  <tr key={m.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">{m.month}</td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">{formatINR(m.revenue)}</td>
                    <td className="px-4 py-2 text-right text-gray-500">{m.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
