// src/pages/auth/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', companyName:'', password:'' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters.')
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to Nexus.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
              <span className="text-gold-500 font-bold text-sm">N</span>
            </div>
            <span className="font-semibold text-gray-900 tracking-widest text-sm uppercase">Nexus</span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start managing your project with Nexus</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" required value={form.name} onChange={set('name')} placeholder="Your name" />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className="input" required value={form.phone} onChange={set('phone')} placeholder="+91 98765..." />
              </div>
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="your@email.com" />
            </div>
            <div>
              <label className="label">Company Name</label>
              <input className="input" value={form.companyName} onChange={set('companyName')} placeholder="Your company (optional)" />
            </div>
            <div>
              <label className="label">Password *</label>
              <input className="input" type="password" required value={form.password} onChange={set('password')} placeholder="Min. 8 characters" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
