// src/components/layout/PublicNavbar.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X } from 'lucide-react'

export default function PublicNavbar() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const dashLink = user
    ? (['SUPER_ADMIN','ADMIN'].includes(user.role) ? '/admin' : '/dashboard')
    : null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 flex items-center justify-center">
              <span className="text-gold-500 font-bold text-xs">N</span>
            </div>
            <span className="font-semibold text-gray-900 tracking-widest text-sm uppercase">Nexus</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {[['/', 'Home'], ['/services', 'Services'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
              <Link key={to} to={to} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{label}</Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to={dashLink} className="btn-primary">My Dashboard</Link>
            ) : (
              <>
                <Link to="/login"    className="btn-ghost text-sm">Login</Link>
                <Link to="/contact"  className="btn-primary">Get a Quote</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-600">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {[['/', 'Home'], ['/services', 'Services'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="block text-sm text-gray-700 py-1">{label}</Link>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <Link to={dashLink} onClick={() => setOpen(false)} className="btn-primary text-center">My Dashboard</Link>
            ) : (
              <>
                <Link to="/login"   onClick={() => setOpen(false)} className="btn-outline text-center">Login</Link>
                <Link to="/contact" onClick={() => setOpen(false)} className="btn-primary text-center">Get a Quote</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
