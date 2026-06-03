// src/api/axios.js
import axios from 'axios'

const apiBaseURL = import.meta.env.VITE_API_URL || 'https://nexus-es75.onrender.com'
if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL is not set. Falling back to hard-coded API host:', apiBaseURL)
}

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexus_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If server returns 401, log out and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexus_token')
      localStorage.removeItem('nexus_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
