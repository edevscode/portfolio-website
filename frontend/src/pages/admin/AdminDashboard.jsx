import React, { useMemo, useState } from 'react'
import { Routes, Route, useLocation, useNavigate, NavLink } from 'react-router-dom'
import { Menu, X, LogOut, FileText, Briefcase, Users, Home, Mail, Palette } from 'lucide-react'
import './AdminDashboard.css'
import SetupWizard from './components/SetupWizard'
import ProjectsManager from './components/ProjectsManager'
import SkillsManager from './components/SkillsManager'
import ExperienceManager from './components/ExperienceManager'
import AboutManager from './components/AboutManager'
import ContactsManager from './components/ContactsManager'
import ThemesManager from './components/ThemesManager'

export default function AdminDashboard({ setIsAdmin }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAdmin(false)
    navigate('/admin/login')
  }

  const menuItems = useMemo(
    () => [
      { label: 'Overview', icon: Home, path: '/admin' },
      { label: 'Hero & About', icon: FileText, path: '/admin/about' },
      { label: 'Skills', icon: Users, path: '/admin/skills' },
      { label: 'Projects', icon: Briefcase, path: '/admin/projects' },
      { label: 'Experience', icon: FileText, path: '/admin/experience' },
      { label: 'Contact', icon: Mail, path: '/admin/messages' },
      { label: 'Themes', icon: Palette, path: '/admin/themes' },
    ],
    []
  )

  const pageTitle = useMemo(() => {
    const current = menuItems.find((i) => i.path === location.pathname)
    return current?.label ?? 'Dashboard'
  }, [location.pathname, menuItems])

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true" />
            <div className="brand-text">
              <div className="brand-title">Admin</div>
              <div className="brand-subtitle">Portfolio</div>
            </div>
          </div>
          <button 
            className="close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (window.innerWidth <= 768) setSidebarOpen(false)
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <div className="admin-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <h1>{pageTitle}</h1>
        </div>

        <div className="admin-body">
          <Routes>
            <Route path="/" element={<SetupWizard />} />
            <Route path="/projects" element={<ProjectsManager />} />
            <Route path="/skills" element={<SkillsManager />} />
            <Route path="/experience" element={<ExperienceManager />} />
            <Route path="/about" element={<AboutManager />} />
            <Route path="/messages" element={<ContactsManager />} />
            <Route path="/themes" element={<ThemesManager />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
