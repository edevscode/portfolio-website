import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLogin from './pages/admin/AdminLogin'
import PortfolioViewer from './pages/portfolio/PortfolioViewer'
import ProjectDetailsViewer from './pages/portfolio/ProjectDetailsViewer'
import ThemeProvider from './context/ThemeContext'
import { SeasonProvider } from './context/SeasonContext'
import { supabase } from './services/supabaseClient'
import { apiService } from './services/apiService'

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let mounted = true

    const syncSession = async (session) => {
      if (!session) {
        if (mounted) {
          setIsAdmin(false)
          setAuthReady(true)
        }
        return
      }
      const allowed = await apiService.checkAdmin()
      if (mounted) {
        setIsAdmin(allowed)
        setAuthReady(true)
      }
    }

    supabase.auth.getSession().then(({ data }) => syncSession(data?.session ?? null))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <SeasonProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
          <Route
            path="/admin/*"
            element={
              !authReady ? (
                <div className="loading-screen">Loading...</div>
              ) : isAdmin ? (
                <AdminDashboard setIsAdmin={setIsAdmin} />
              ) : (
                <AdminLogin setIsAdmin={setIsAdmin} />
              )
            }
          />
          <Route path="/project/:slug" element={<ProjectDetailsViewer />} />
          <Route path="/*" element={<PortfolioViewer />} />
        </Routes>
      </ThemeProvider>
    </SeasonProvider>
  )
}
