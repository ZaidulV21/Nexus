// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name}!`)
      if (['SUPER_ADMIN','ADMIN','PROJECT_MANAGER'].includes(user.role)) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
              <span className="text-gold-500 font-bold text-sm">N</span>
            </div>
            <span className="font-semibold text-gray-900 tracking-widest text-sm uppercase">Nexus</span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mt-1">Access your client portal or admin panel</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" className="input" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-600 hover:underline font-medium">Register</Link>
          </p>
          <p className="text-center mt-2">
            <Link to="/contact" className="text-xs text-gray-400 hover:text-gray-600">← Back to website</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <p className="font-medium mb-1">Demo credentials:</p>
          <p>Admin: admin@nexusmanaged.in / Admin@Nexus2025!</p>
          <p>Client: client@test.com / Client@2025!</p>
        </div>
      </div>
    </div>
  )
}
