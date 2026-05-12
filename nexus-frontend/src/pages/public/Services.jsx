// src/pages/public/Services.jsx
import { useEffect, useState } from 'react'
import PublicNavbar from '../../components/layout/PublicNavbar'
import Footer from './Footer'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const ICONS = { sofa:'🏠', zap:'⚡', sun:'☀️', megaphone:'📋', monitor:'💻', camera:'📷', wind:'❄️', droplets:'🚿', paintbrush:'🎨', wrench:'🔧' }

export default function Services() {
  const [services, setServices] = useState([])
  useEffect(() => { api.get('/services').then(r => setServices(r.data.services)).catch(() => {}) }, [])
  return (
    <div>
      <PublicNavbar />
      <section className="pt-28 pb-20 px-6 md:px-16 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <p className="text-gold-600 text-xs tracking-widest uppercase mb-3">What We Offer</p>
          <h1 className="text-5xl font-light text-gray-900 mb-4" style={{fontFamily:'Cormorant Garamond,serif'}}>Our <em>Services</em></h1>
          <p className="text-gray-500 mb-12 max-w-xl">Every service is managed end-to-end. You pick what you need — we coordinate the right vendors, timelines, and quality checks.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s => (
              <div key={s.id} className="bg-white border border-gray-200 p-6 hover:border-gold-300 hover:shadow-sm transition-all">
                <div className="text-3xl mb-4">{ICONS[s.icon] || '🔧'}</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{s.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{s.description}</p>
                {s.basePrice && <p className="text-sm text-gold-600 font-medium">Starting ₹{s.basePrice?.toLocaleString('en-IN')}</p>}
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/contact" className="bg-gold-500 text-black px-8 py-3 text-sm font-medium hover:bg-gold-600 transition-colors">Get a Custom Quote →</Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
