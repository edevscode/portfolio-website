import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Briefcase, Star, Mail, Globe, Monitor, Smartphone, Tablet,
  FileText, Award, Palette, ChevronRight, RefreshCw, Eye, TrendingUp,
  MessageSquare, Zap, ExternalLink,
} from 'lucide-react'
import { apiService } from '../../../services/apiService'
import './DashboardHome.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

function flagEmoji(cc) {
  if (!cc || cc.length !== 2) return '🌐'
  return String.fromCodePoint(
    ...cc.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  )
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function shortRef(ref) {
  if (!ref) return '—'
  try {
    const u = new URL(ref)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return ref.slice(0, 30)
  }
}

function DeviceIcon({ type, size = 15 }) {
  if (type === 'mobile') return <Smartphone size={size} />
  if (type === 'tablet') return <Tablet size={size} />
  return <Monitor size={size} />
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, accent, onClick, loading }) {
  return (
    <button className="dh-stat" onClick={onClick} style={{ '--dh-accent': accent }}>
      <div className="dh-stat-icon"><Icon size={20} /></div>
      <div className="dh-stat-body">
        <div className="dh-stat-value">{loading ? '—' : value}</div>
        <div className="dh-stat-label">{label}</div>
      </div>
    </button>
  )
}

function QuickAction({ icon: Icon, label, path, accent }) {
  const navigate = useNavigate()
  return (
    <button
      className="dh-qa"
      onClick={() => navigate(path)}
      style={{ '--dh-accent': accent }}
    >
      <div className="dh-qa-icon"><Icon size={18} /></div>
      <span className="dh-qa-label">{label}</span>
      <ChevronRight size={14} className="dh-qa-arrow" />
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Hero & About', icon: FileText,  path: '/admin/about',        accent: '#6366f1' },
  { label: 'Skills',       icon: Zap,       path: '/admin/skills',        accent: '#f59e0b' },
  { label: 'Projects',     icon: Briefcase, path: '/admin/projects',      accent: '#10b981' },
  { label: 'Experience',   icon: Users,     path: '/admin/experience',    accent: '#3b82f6' },
  { label: 'Certificates', icon: Award,     path: '/admin/certificates',  accent: '#8b5cf6' },
  { label: 'Contact',      icon: Mail,      path: '/admin/messages',      accent: '#ef4444' },
  { label: 'Themes',       icon: Palette,   path: '/admin/themes',        accent: '#ec4899' },
  { label: 'Visitors',     icon: Eye,       path: '/admin/visitors',      accent: '#14b8a6' },
]

export default function DashboardHome() {
  const [stats, setStats]       = useState({ total: 0, today: 0, countries: [], devices: [] })
  const [visitors, setVisitors] = useState([])
  const [contacts, setContacts] = useState([])
  const [counts, setCounts]     = useState({ projects: 0, skills: 0 })
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [statsRes, recentRes, contactsRes, portfolioRes] = await Promise.allSettled([
        apiService.getVisitorStats(),
        apiService.getRecentVisitors(),
        apiService.getContacts(),
        apiService.getPortfolio(),
      ])

      if (statsRes.status === 'fulfilled')
        setStats(statsRes.value.data)
      if (recentRes.status === 'fulfilled')
        setVisitors(recentRes.value.data || [])
      if (contactsRes.status === 'fulfilled')
        setContacts(contactsRes.value.data || [])
      if (portfolioRes.status === 'fulfilled') {
        const d = portfolioRes.value.data
        setCounts({
          projects: d?.projects?.length ?? 0,
          skills: d?.skills?.length ?? 0,
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const unread = contacts.filter(c => !c.is_read).length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const totalDevices = stats.devices.reduce((s, d) => s + d.count, 0) || 1
  const deviceMap = Object.fromEntries(stats.devices.map(d => [d.device_type, d.count]))

  return (
    <div className="dh-root">

      {/* ── Top banner ── */}
      <div className="dh-banner">
        <div className="dh-banner-text">
          <h2>{greeting}, Admin 👋</h2>
          <p>Here's an overview of your portfolio performance.</p>
        </div>
        <div className="dh-banner-actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="dh-view-btn"
          >
            <ExternalLink size={14} />
            View Portfolio
          </a>
          <button
            className={`dh-refresh-btn${refreshing ? ' spinning' : ''}`}
            onClick={() => load(true)}
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dh-stats">
        <StatCard
          icon={Eye}
          label="Total Visitors"
          value={stats.total.toLocaleString()}
          accent="#14b8a6"
          loading={loading}
          onClick={() => {}}
        />
        <StatCard
          icon={TrendingUp}
          label="Visitors Today"
          value={stats.today.toLocaleString()}
          accent="#6366f1"
          loading={loading}
          onClick={() => {}}
        />
        <StatCard
          icon={Briefcase}
          label="Projects"
          value={counts.projects}
          accent="#10b981"
          loading={loading}
          onClick={() => {}}
        />
        <StatCard
          icon={MessageSquare}
          label={`Messages${unread > 0 ? ` (${unread} new)` : ''}`}
          value={contacts.length}
          accent={unread > 0 ? '#ef4444' : '#f59e0b'}
          loading={loading}
          onClick={() => {}}
        />
      </div>

      {/* ── Middle row: visitors + insights ── */}
      <div className="dh-mid">

        {/* Recent visitors */}
        <div className="dh-card dh-visitors">
          <div className="dh-card-head">
            <Eye size={15} className="dh-card-icon" />
            <h3>Recent Visitors</h3>
            <span className="dh-card-badge">{visitors.length}</span>
          </div>

          {loading ? (
            <div className="dh-empty">Loading…</div>
          ) : visitors.length === 0 ? (
            <div className="dh-empty">No visitors recorded yet.</div>
          ) : (
            <div className="dh-visitor-list">
              {visitors.map(v => (
                <div key={v.id} className="dh-visitor-row">
                  <span className="dh-visitor-flag" title={v.country}>
                    {flagEmoji(v.country_code)}
                  </span>
                  <div className="dh-visitor-info">
                    <span className="dh-visitor-loc">
                      {[
                        v.city,
                        v.region && v.region !== v.city ? v.region : null,
                        v.country,
                      ].filter(Boolean).join(', ') || 'Unknown location'}
                    </span>
                    <span className="dh-visitor-meta">
                      <DeviceIcon type={v.device_type} size={12} />
                      {v.browser || 'Unknown'}
                      {v.referrer ? ` · from ${shortRef(v.referrer)}` : ''}
                    </span>
                  </div>
                  <span className="dh-visitor-time">{timeAgo(v.visited_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights panel */}
        <div className="dh-insights">

          {/* Top countries */}
          <div className="dh-card">
            <div className="dh-card-head">
              <Globe size={15} className="dh-card-icon" />
              <h3>Top Countries</h3>
            </div>
            {loading ? (
              <div className="dh-empty">Loading…</div>
            ) : stats.countries.length === 0 ? (
              <div className="dh-empty">No data yet.</div>
            ) : (
              <div className="dh-country-list">
                {stats.countries.slice(0, 6).map(c => (
                  <div key={c.country_code || c.country} className="dh-country-row">
                    <span className="dh-country-flag">{flagEmoji(c.country_code)}</span>
                    <span className="dh-country-name">{c.country || 'Unknown'}</span>
                    <span className="dh-country-bar-wrap">
                      <span
                        className="dh-country-bar"
                        style={{ width: `${Math.round((c.count / (stats.countries[0]?.count || 1)) * 100)}%` }}
                      />
                    </span>
                    <span className="dh-country-count">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device breakdown */}
          <div className="dh-card">
            <div className="dh-card-head">
              <Monitor size={15} className="dh-card-icon" />
              <h3>Devices</h3>
            </div>
            {loading ? (
              <div className="dh-empty">Loading…</div>
            ) : stats.devices.length === 0 ? (
              <div className="dh-empty">No data yet.</div>
            ) : (
              <div className="dh-device-list">
                {[
                  { key: 'desktop', icon: Monitor, label: 'Desktop', color: '#6366f1' },
                  { key: 'mobile',  icon: Smartphone, label: 'Mobile',  color: '#10b981' },
                  { key: 'tablet',  icon: Tablet, label: 'Tablet',  color: '#f59e0b' },
                ].map(({ key, icon: Icon, label, color }) => {
                  const count = deviceMap[key] || 0
                  const pct = Math.round((count / totalDevices) * 100)
                  return (
                    <div key={key} className="dh-device-row">
                      <Icon size={14} style={{ color }} />
                      <span className="dh-device-label">{label}</span>
                      <div className="dh-device-track">
                        <div
                          className="dh-device-fill"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      <span className="dh-device-pct">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="dh-card dh-qa-section">
        <div className="dh-card-head">
          <Zap size={15} className="dh-card-icon" />
          <h3>Quick Actions</h3>
        </div>
        <div className="dh-qa-grid">
          {QUICK_ACTIONS.map(a => (
            <QuickAction key={a.path} {...a} />
          ))}
        </div>
      </div>

      {/* ── Recent messages ── */}
      {contacts.length > 0 && (
        <div className="dh-card dh-messages">
          <div className="dh-card-head">
            <Mail size={15} className="dh-card-icon" />
            <h3>Recent Messages</h3>
            {unread > 0 && <span className="dh-unread-badge">{unread} unread</span>}
          </div>
          <div className="dh-msg-list">
            {contacts.slice(0, 4).map(c => (
              <div key={c.id} className={`dh-msg-row${!c.is_read ? ' dh-msg-row--unread' : ''}`}>
                <div className="dh-msg-avatar">
                  {(c.name?.[0] || '?').toUpperCase()}
                </div>
                <div className="dh-msg-body">
                  <span className="dh-msg-name">{c.name}</span>
                  <span className="dh-msg-subject">{c.subject}</span>
                </div>
                <span className="dh-msg-time">{timeAgo(c.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
