import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLogin from './pages/admin/AdminLogin'
import PortfolioViewer from './pages/portfolio/PortfolioViewer'
import ThemeProvider from './context/ThemeContext'
import { SeasonProvider } from './context/SeasonContext'

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsAdmin(true)
    }
  }, [])

  return (
    <SeasonProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
          <Route path="/admin/*" element={isAdmin ? <AdminDashboard setIsAdmin={setIsAdmin} /> : <AdminLogin setIsAdmin={setIsAdmin} />} />
          <Route path="/*" element={<PortfolioViewer />} />
        </Routes>
      </ThemeProvider>
    </SeasonProvider>
  )
}
