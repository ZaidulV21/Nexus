// src/components/layout/ClientLayout.jsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, FolderOpen, FileText, Receipt, MessageSquare, User, LogOut, Menu } from 'lucide-react'
import { Avatar } from '../ui'

const navItems = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/projects',  icon: FolderOpen,      label: 'My Projects' },
  { to: '/dashboard/quotes',    icon: FileText,        label: 'Quotes' },
  { to: '/dashboard/invoices',  icon: Receipt,         label: 'Invoices' },
]

export default function ClientLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 flex items-center justify-center">
            <span className="text-gold-500 font-bold text-xs">N</span>
          </div>
          <span className="font-semibold text-gray-900 tracking-widest text-sm uppercase">Nexus</span>
        </Link>
        <p className="text-xs text-gray-400 mt-0.5 ml-9">Client Portal</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
          return (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors
                ${active ? 'bg-gold-50 text-gold-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon size={16} />{label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <Avatar name={user?.name} size="sm" url={user?.avatarUrl} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.companyName || 'Client'}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 w-full text-sm text-red-500 hover:bg-red-50 rounded transition-colors">
          <LogOut size={16} />Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarContent />
      </aside>
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative z-50 w-56 bg-white h-full shadow-xl flex flex-col"><SidebarContent /></aside>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setOpen(true)} className="md:hidden p-1 text-gray-600"><Menu size={20} /></button>
          <div className="flex-1" />
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to website</Link>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
