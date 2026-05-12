// src/pages/public/Footer.jsx
import { Link } from 'react-router-dom'
export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-white/10 py-10 px-6 md:px-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-800 border border-gold-500/30 flex items-center justify-center">
            <span className="text-gold-500 font-bold text-xs">N</span>
          </div>
          <span className="font-semibold text-white tracking-widest text-sm uppercase">Nexus</span>
        </div>
        <div className="flex flex-wrap gap-6">
          {[['/', 'Home'],['/services','Services'],['/about','About'],['/contact','Contact'],['/login','Login']].map(([to, label]) => (
            <Link key={to} to={to} className="text-xs text-gray-500 hover:text-gray-300 uppercase tracking-wider">{label}</Link>
          ))}
        </div>
        <p className="text-xs text-gray-600">© 2025 Nexus Managed Services · Lucknow, UP</p>
      </div>
    </footer>
  )
}
