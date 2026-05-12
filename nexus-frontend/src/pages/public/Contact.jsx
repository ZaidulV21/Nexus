// src/pages/public/Contact.jsx
import { useState, useEffect } from 'react'
import PublicNavbar from '../../components/layout/PublicNavbar'
import Footer from './Footer'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function Contact() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name:'', phone:'', email:'', company:'', servicesRequested:[], message:'', budget:'' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { api.get('/services').then(r => setServices(r.data.services)).catch(() => {}) }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleService = (name) => {
    setForm(f => ({
      ...f,
      servicesRequested: f.servicesRequested.includes(name)
        ? f.servicesRequested.filter(s => s !== name)
        : [...f.servicesRequested, name]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.email) return toast.error('Please fill in all required fields.')
    setLoading(true)
    try {
      await api.post('/enquiries', form)
      setSubmitted(true)
      toast.success('Enquiry submitted! We will contact you within 4 hours.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div>
      <PublicNavbar />
      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Enquiry Received!</h2>
          <p className="text-gray-500 mb-6">Thank you, {form.name}. Our team will call you within 4 business hours. Check your email for confirmation.</p>
          <a href="/" className="btn-primary">Back to Home</a>
        </div>
      </div>
      <Footer />
    </div>
  )

  return (
    <div>
      <PublicNavbar />
      <section className="pt-28 pb-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <p className="text-gold-600 text-xs tracking-widest uppercase mb-3">Start Your Project</p>
              <h1 className="text-4xl font-light text-gray-900 mb-2" style={{fontFamily:'Cormorant Garamond,serif'}}>Get a <em>free quote</em></h1>
              <p className="text-gray-500 mb-8 text-sm">Fill in your details and we'll call you within 4 business hours.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Full Name *</label><input className="input" required value={form.name} onChange={set('name')} placeholder="Your name" /></div>
                  <div><label className="label">Phone *</label><input className="input" required value={form.phone} onChange={set('phone')} placeholder="+91 98765..." /></div>
                </div>
                <div><label className="label">Email *</label><input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="your@email.com" /></div>
                <div><label className="label">Company / Project Name</label><input className="input" value={form.company} onChange={set('company')} placeholder="Your company name" /></div>

                <div>
                  <label className="label">Services Needed</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {services.map(s => (
                      <button type="button" key={s.id} onClick={() => toggleService(s.name)}
                        className={`px-3 py-1.5 text-xs border rounded transition-colors
                          ${form.servicesRequested.includes(s.name) ? 'bg-gold-500 text-black border-gold-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Approximate Budget</label>
                  <select className="input" value={form.budget} onChange={set('budget')}>
                    <option value="">Select range</option>
                    <option value="Under ₹2 Lakh">Under ₹2 Lakh</option>
                    <option value="₹2L - ₹5L">₹2L – ₹5L</option>
                    <option value="₹5L - ₹15L">₹5L – ₹15L</option>
                    <option value="₹15L - ₹50L">₹15L – ₹50L</option>
                    <option value="Above ₹50L">Above ₹50L</option>
                  </select>
                </div>

                <div>
                  <label className="label">Project Details</label>
                  <textarea className="input" rows={4} value={form.message} onChange={set('message')}
                    placeholder="Tell us about your project — location, size, timeline, anything relevant..." />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Submitting...' : 'Submit Enquiry →'}
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="space-y-8 pt-12">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Why clients choose Nexus</h3>
                {[
                  ['⚡','4-hour response time','We call within 4 business hours. Every time.'],
                  ['👤','Single point of contact','One PM for your entire project. No juggling contractors.'],
                  ['📊','Weekly progress updates','Know exactly where your project stands at all times.'],
                  ['✅','Verified vendors only','Every vendor in our network is pre-vetted for quality.'],
                ].map(([icon, title, desc]) => (
                  <div key={title} className="flex gap-4 mb-4">
                    <span className="text-xl flex-shrink-0">{icon}</span>
                    <div><p className="text-sm font-medium text-gray-900">{title}</p><p className="text-xs text-gray-500 mt-0.5">{desc}</p></div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-900 p-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Contact Us Directly</p>
                <p className="text-white font-medium mb-1">📞 +91 98765 43210</p>
                <p className="text-gray-400 text-sm mb-1">✉️ hello@nexusmanaged.in</p>
                <p className="text-gray-400 text-sm">📍 Lucknow, Uttar Pradesh</p>
                <p className="text-gray-500 text-xs mt-4">Mon–Sat, 9am–7pm IST</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
