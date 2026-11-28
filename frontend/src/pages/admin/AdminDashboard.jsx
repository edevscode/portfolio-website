import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate, NavLink } from 'react-router-dom'
import { Menu, X, LogOut, FileText, Briefcase, Users, Home, Mail, Palette, Award, Eye, Zap, ExternalLink } from 'lucide-react'
import { apiService } from '../../services/apiService'
import './AdminDashboard.css'
import DashboardHome from './components/DashboardHome'
import ProjectsManager from './components/ProjectsManager'
import SkillsManager from './components/SkillsManager'
import ExperienceManager from './components/ExperienceManager'
import AboutManager from './components/AboutManager'
import ContactsManager from './components/ContactsManager'
import ThemesManager from './components/ThemesManager'
import CertificatesManager from './components/CertificatesManager'
import VisitorsManager from './components/VisitorsManager'

export default function AdminDashboard({ setIsAdmin }) {
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  )
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeThemeInfo, setActiveThemeInfo] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let cancelled = false

    const fetchShellMeta = async () => {
      const [contactsRes, themesRes] = await Promise.allSettled([
        apiService.getContacts(),
        apiService.getThemes(),
      ])
      if (cancelled) return
      if (contactsRes.status === 'fulfilled') {
        const list = contactsRes.value.data || []
        setUnreadCount(list.filter((c) => !c.is_read).length)
      }
      if (themesRes.status === 'fulfilled') {
        const list = themesRes.value.data || []
        const active = list.find((t) => t.is_active)
        setActiveThemeInfo(
          active
            ? { mode: 'manual', name: active.name, color: active.accent_color || active.primary_color || '#6366f1' }
            : { mode: 'auto', name: 'Auto Seasonal', color: '#22c55e' }
        )
      }
    }

    void fetchShellMeta()
    window.addEventListener('admin:meta-updated', fetchShellMeta)
    return () => {
      cancelled = true
      window.removeEventListener('admin:meta-updated', fetchShellMeta)
    }
  }, [location.pathname])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen && window.innerWidth <= 768) {
        setSidebarOpen(false)
      }
    }
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [sidebarOpen])

  const handleLogout = async () => {
    await apiService.logout()
    setIsAdmin(false)
    navigate('/admin/login')
  }

  const navGroups = useMemo(
    () => [
      {
        label: 'Monitor',
        items: [
          { label: 'Overview', icon: Home, path: '/admin', end: true },
          { label: 'Visitors', icon: Eye,  path: '/admin/visitors' },
        ],
      },
      {
        label: 'Content',
        items: [
          { label: 'Projects',     icon: Briefcase, path: '/admin/projects' },
          { label: 'Experience',   icon: Users,     path: '/admin/experience' },
          { label: 'Hero & About', icon: FileText,  path: '/admin/about' },
          { label: 'Skills',       icon: Zap,       path: '/admin/skills' },
          { label: 'Certificates', icon: Award,     path: '/admin/certificates' },
          { label: 'Contact',      icon: Mail,      path: '/admin/messages', showUnread: true },
        ],
      },
      {
        label: 'Appearance',
        items: [
          { label: 'Themes', icon: Palette, path: '/admin/themes' },
        ],
      },
    ],
    []
  )

  const pageTitle = useMemo(() => {
    const flat = navGroups.flatMap((g) => g.items)
    const current = flat.find((i) => i.path === location.pathname)
    return current?.label ?? 'Dashboard'
  }, [location.pathname, navGroups])

  return (
    <div className="admin-dashboard">
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`} aria-label="Admin sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">P</div>
            <div className="brand-text">
              <div className="brand-title">Portfolio</div>
              <div className="brand-subtitle">Admin Studio</div>
            </div>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={!!item.end}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => { if (window.innerWidth <= 768) setSidebarOpen(false) }}
                >
                  <item.icon size={17} />
                  <span className="nav-item-label">{item.label}</span>
                  {item.showUnread && unreadCount > 0 && (
                    <span className="nav-unread-pill" aria-label={`${unreadCount} unread`}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={sidebarOpen}
            >
              <Menu size={20} />
            </button>
            <div className="admin-breadcrumb">
              <span className="admin-breadcrumb-root">Admin</span>
              <span className="admin-breadcrumb-sep" aria-hidden="true">/</span>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="admin-header-right">
            {activeThemeInfo && (
              <Link
                to="/admin/themes"
                className="admin-theme-pill"
                title={`Active site theme: ${activeThemeInfo.name}`}
              >
                <span
                  className="admin-theme-dot"
                  style={{ background: activeThemeInfo.color }}
                  aria-hidden="true"
                />
                <span className="admin-theme-name">{activeThemeInfo.name}</span>
              </Link>
            )}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-view-site"
            >
              <ExternalLink size={14} />
              <span>View Site</span>
            </a>
          </div>
        </header>

        <div className="admin-body">
          <Routes>
            <Route path="/"            element={<DashboardHome />} />
            <Route path="/visitors"    element={<VisitorsManager />} />
            <Route path="/projects"    element={<ProjectsManager />} />
            <Route path="/skills"      element={<SkillsManager />} />
            <Route path="/experience"  element={<ExperienceManager />} />
            <Route path="/about"       element={<AboutManager />} />
            <Route path="/certificates"element={<CertificatesManager />} />
            <Route path="/messages"    element={<ContactsManager />} />
            <Route path="/themes"      element={<ThemesManager />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
