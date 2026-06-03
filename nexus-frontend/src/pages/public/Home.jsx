// src/pages/public/Home.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicNavbar from '../../components/layout/PublicNavbar'
import Footer from './Footer'
import QuoteWizard from '../../components/QuoteWizard'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ICONS = { sofa:'🏠', zap:'⚡', sun:'☀️', megaphone:'📋', monitor:'💻', camera:'📷', wind:'❄️', droplets:'🚿', paintbrush:'🎨', wrench:'🔧' }

export default function Home() {
  const [services,  setServices]  = useState([])
  const [selected,  setSelected]  = useState(new Set())
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data.services)).catch(() => {})
  }, [])

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  
  const handleProceed = () => {
    if (selected.size === 0) {
      toast.error('Please select at least one service first.')
      return
    }
    setShowWizard(true)
  }
  
  const getSelectedServiceObjects = () => {
    return [...selected]
      .map(id => services.find(s => s.id === id))
      .filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* HERO */}
      <section className="min-h-screen bg-gray-900 flex flex-col justify-end pb-20 px-6 md:px-16 pt-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10 max-w-4xl">
          <p className="text-gold-500 text-xs font-medium tracking-widest uppercase mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-gold-500" />Premium Managed Services · Lucknow
          </p>
          <h1 className="text-5xl md:text-7xl font-light text-white leading-tight mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            One call.<br /><em className="text-gold-400">Everything</em><br />handled.
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
            Interior, electrical, solar, signage, website — we coordinate every vendor and every deadline so you don't have to.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#services" className="bg-gold-500 text-black px-8 py-3 text-sm font-medium hover:bg-gold-400 transition-colors">
              Build My Package ↓
            </a>
            <Link to="/contact" className="border border-white/20 text-white px-8 py-3 text-sm hover:border-white/40 transition-colors">
              Get a Free Quote
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-gray-600">
          <div className="w-px h-10 bg-gold-500/50" />
          <span className="text-xs tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gray-900 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {[['200+','Projects Delivered'],['40+','Verified Vendors'],['98%','On-Time Delivery'],['1','Call To Start']].map(([n,l]) => (
            <div key={l} className="py-8 px-6 text-center">
              <p className="text-3xl font-light text-gold-400" style={{fontFamily:'Cormorant Garamond,serif'}}>{n}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-6 md:px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-gold-600 text-xs font-medium tracking-widest uppercase mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold-500"/>Our Services</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-4xl font-light text-gray-900" style={{fontFamily:'Cormorant Garamond,serif'}}>
                Select your <em>services</em>
              </h2>
              <p className="text-gray-500 mt-2">Pick everything your project needs — we bundle and deliver.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {services.map(s => (
              <div key={s.id} onClick={() => toggle(s.id)}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all relative
                  ${selected.has(s.id) ? 'border-gold-500 ring-1 ring-gold-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                {selected.has(s.id) && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <div className="text-2xl mb-2">{ICONS[s.icon] || '🔧'}</div>
                <p className="text-sm font-medium text-gray-900 mb-1">{s.name}</p>
                <p className="text-xs text-gray-500 leading-snug">{s.description?.slice(0,50)}...</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-gray-600">
                Selected: <span className="font-semibold text-gray-900">{selected.size} service{selected.size !== 1 ? 's' : ''}</span>
              </p>
              {selected.size > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {[...selected].map(id => services.find(s => s.id === id)?.name).join(', ')}
                </p>
              )}
            </div>
            <button onClick={handleProceed} className="bg-gold-500 text-black px-6 py-2.5 text-sm font-medium hover:bg-gold-600 transition-colors">
              Proceed →
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold-600 text-xs tracking-widest uppercase mb-3">Process</p>
            <h2 className="text-4xl font-light text-gray-900" style={{fontFamily:'Cormorant Garamond,serif'}}>Five steps to <em>done</em></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              ['01','Choose Services','Pick from our catalog of managed services'],
              ['02','Get a Proposal','Bundled quote within 24 hours'],
              ['03','We Coordinate','Dedicated PM handles all vendors'],
              ['04','Track Progress','Weekly updates and milestone alerts'],
              ['05','Final Delivery','On time, on budget, zero stress'],
            ].map(([n,t,d]) => (
              <div key={n} className="border border-gray-200 p-6 text-center hover:border-gold-300 hover:bg-yellow-50 transition-colors group">
                <p className="text-5xl font-light text-gray-200 group-hover:text-gold-200 mb-4" style={{fontFamily:'Cormorant Garamond,serif'}}>{n}</p>
                <p className="text-sm font-medium text-gray-900 mb-2">{t}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 md:px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-gold-600 text-xs tracking-widest uppercase mb-3">Client Voices</p>
          <h2 className="text-4xl font-light text-gray-900 mb-12" style={{fontFamily:'Cormorant Garamond,serif'}}>What they <em>say</em></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['Set up our 3-floor office in 6 weeks — interior, electrical, and branding all coordinated. I made exactly one call. That was it.','Rahul Kapoor','MD, Kapoor Logistics','RK'],
              ['Solar, CCTV, and full interior in one package. The PM gave weekly updates. No surprises, no delays. Truly professional.','Sneha Agarwal','Founder, Studio Bloom','SA'],
              ['Renovated two retail outlets simultaneously. Marble, signage, electrical — delivered on the same day, under budget. Remarkable.','Vikram Joshi','Director, VJ Retail Group','VJ'],
            ].map(([text, name, role, initials]) => (
              <div key={name} className="bg-white border border-gray-200 p-6 hover:border-gold-300 transition-colors">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-gold-400 text-sm">★</span>)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic mb-6">"{text}"</p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="w-9 h-9 bg-gold-100 text-gold-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">{initials}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-16 bg-gray-900 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-light text-white mb-4" style={{fontFamily:'Cormorant Garamond,serif'}}>Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Tell us what you're building. We'll take it from there.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-gold-500 text-black px-8 py-3 text-sm font-medium hover:bg-gold-400 transition-colors">Request a Callback</Link>
            <a href="tel:+919876543210" className="border border-white/20 text-white px-8 py-3 text-sm hover:border-white/40 transition-colors">+91 98765 43210</a>
          </div>
        </div>
      </section>

      <Footer />
      
      {showWizard && (
        <QuoteWizard 
          services={getSelectedServiceObjects()}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  )
}
