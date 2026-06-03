// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token    = localStorage.getItem('nexus_token')
    const userData = localStorage.getItem('nexus_user')
    if (token && userData) {
      try { 
        setUser(JSON.parse(userData)) 
      } catch (err) {
        console.error('Failed to parse stored user:', err)
        localStorage.removeItem('nexus_token')
        localStorage.removeItem('nexus_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('nexus_token', token)
    localStorage.setItem('nexus_user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const { token, user } = res.data
    localStorage.setItem('nexus_token', token)
    localStorage.setItem('nexus_user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('nexus_token')
    localStorage.removeItem('nexus_user')
    setUser(null)
    window.location.href = '/'
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('nexus_user', JSON.stringify(updatedUser))
  }

  // Show minimal loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <span className="text-gold-500 font-bold text-lg">N</span>
          </div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
