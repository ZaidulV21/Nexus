// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Public pages
import Home     from './pages/public/Home'
import Services from './pages/public/Services'
import About    from './pages/public/About'
import Contact  from './pages/public/Contact'
import Footer   from './pages/public/Footer'

// Auth pages
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Client pages
import ClientDashboard   from './pages/client/Dashboard'
import ClientProjects    from './pages/client/Projects'
import ClientProjectDetail from './pages/client/ProjectDetail'
import ClientQuotes      from './pages/client/Quotes'
import ClientInvoices    from './pages/client/Invoices'

// Admin pages
import AdminDashboard    from './pages/admin/Dashboard'
import AdminEnquiries    from './pages/admin/Enquiries'
import AdminProjects     from './pages/admin/Projects'
import AdminProjectDetail from './pages/admin/ProjectDetail'
import AdminClients      from './pages/admin/Clients'
import AdminServices     from './pages/admin/Services'
import AdminReports      from './pages/admin/Reports'

const ADMIN_ROLES  = ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER']
const CLIENT_ROLES = ['CLIENT']

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function PublicPage({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<PublicPage><Home /></PublicPage>} />
          <Route path="/services" element={<PublicPage><Services /></PublicPage>} />
          <Route path="/about"    element={<PublicPage><About /></PublicPage>} />
          <Route path="/contact"  element={<PublicPage><Contact /></PublicPage>} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Client */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={CLIENT_ROLES}><ClientDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/projects"     element={<ProtectedRoute allowedRoles={CLIENT_ROLES}><ClientProjects /></ProtectedRoute>} />
          <Route path="/dashboard/projects/:id" element={<ProtectedRoute allowedRoles={CLIENT_ROLES}><ClientProjectDetail /></ProtectedRoute>} />
          <Route path="/dashboard/quotes"       element={<ProtectedRoute allowedRoles={CLIENT_ROLES}><ClientQuotes /></ProtectedRoute>} />
          <Route path="/dashboard/invoices"     element={<ProtectedRoute allowedRoles={CLIENT_ROLES}><ClientInvoices /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"              element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/enquiries"    element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminEnquiries /></ProtectedRoute>} />
          <Route path="/admin/projects"     element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminProjects /></ProtectedRoute>} />
          <Route path="/admin/projects/:id" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminProjectDetail /></ProtectedRoute>} />
          <Route path="/admin/clients"      element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminClients /></ProtectedRoute>} />
          <Route path="/admin/services"     element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminServices /></ProtectedRoute>} />
          <Route path="/admin/reports"      element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','ADMIN']}><AdminReports /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
