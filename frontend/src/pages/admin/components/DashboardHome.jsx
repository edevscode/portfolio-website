import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Briefcase, Mail, Globe, Monitor, Smartphone, Tablet,
  FileText, Palette, ChevronRight, RefreshCw, Eye, TrendingUp,
  MessageSquare, ArrowRight,
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

function StatCard({ icon, label, value, badge, onClick, loading }) {
  const Icon = icon
  return (
    <button type="button" className="dh-stat" onClick={onClick}>
      <div className="dh-stat-top">
        <div className="dh-stat-icon" aria-hidden="true">
          <Icon size={17} />
        </div>
        {badge && <span className="dh-stat-pill">{badge}</span>}
      </div>
      <div className="dh-stat-body">
        <div className="dh-stat-value">{loading ? '—' : value}</div>
        <div className="dh-stat-label">
          <span>{label}</span>
          <ChevronRight size={13} className="dh-stat-chevron" aria-hidden="true" />
        </div>
      </div>
    </button>
  )
}

function QuickAction({ icon, label, subtitle, path }) {
  const Icon = icon
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="dh-qa"
      onClick={() => navigate(path)}
    >
      <div className="dh-qa-icon" aria-hidden="true"><Icon size={17} /></div>
      <div className="dh-qa-copy">
        <span className="dh-qa-label">{label}</span>
        <span className="dh-qa-sub">{subtitle}</span>
      </div>
      <ChevronRight size={14} className="dh-qa-arrow" aria-hidden="true" />
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'Edit Hero & About', subtitle: 'Profile, bio & CV',    icon: FileText,  path: '/admin/about' },
  { label: 'Manage Projects',   subtitle: 'Portfolio showcase',   icon: Briefcase, path: '/admin/projects' },
  { label: 'Open Inbox',        subtitle: 'Messages & links',     icon: Mail,      path: '/admin/messages' },
  { label: 'Customize Themes',  subtitle: 'Colors & presets',     icon: Palette,   path: '/admin/themes' },
]

export default function DashboardHome() {
  const navigate = useNavigate()
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
      if (recentRes.status === 'fulfilled') {
        const d = recentRes.value.data
        setVisitors(Array.isArray(d) ? d : (d?.results ?? []))
      }
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
          <h2>{greeting}</h2>
          <p>Portfolio traffic, published work, and inbox activity.</p>
        </div>
        <div className="dh-banner-actions">
          <button
            type="button"
            className={`dh-refresh-btn${refreshing ? ' spinning' : ''}`}
            onClick={() => load(true)}
            title="Refresh overview"
            aria-label="Refresh overview"
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
          loading={loading}
          onClick={() => navigate('/admin/visitors')}
        />
        <StatCard
          icon={TrendingUp}
          label="Visitors Today"
          value={stats.today.toLocaleString()}
          loading={loading}
          onClick={() => navigate('/admin/visitors')}
        />
        <StatCard
          icon={Briefcase}
          label="Projects"
          value={counts.projects}
          loading={loading}
          onClick={() => navigate('/admin/projects')}
        />
        <StatCard
          icon={MessageSquare}
          label="Messages"
          value={contacts.length}
          badge={unread > 0 ? `${unread} unread` : null}
          loading={loading}
          onClick={() => navigate('/admin/messages')}
        />
      </div>

      {/* ── Shortcuts ── */}
      <div className="dh-qa-grid" aria-label="Workspace shortcuts">
        {QUICK_ACTIONS.map(a => (
          <QuickAction key={a.path} {...a} />
        ))}
      </div>

      {/* ── Middle row: visitors + insights ── */}
      <div className="dh-mid">

        {/* Recent visitors */}
        <div className="dh-card dh-visitors">
          <div className="dh-card-head">
            <Eye size={15} className="dh-card-icon" />
            <h3>Recent Visitors</h3>
            <span className="dh-card-badge">{visitors.length}</span>
            <Link to="/admin/visitors" className="dh-card-link">
              View all <ArrowRight size={13} />
            </Link>
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
                  { key: 'desktop', icon: Monitor, label: 'Desktop', color: 'var(--admin-accent, #6366f1)' },
                  { key: 'mobile',  icon: Smartphone, label: 'Mobile',  color: '#0f766e' },
                  { key: 'tablet',  icon: Tablet, label: 'Tablet',  color: '#64748b' },
                ].map((item) => {
                  const Icon = item.icon
                  const count = deviceMap[item.key] || 0
                  const pct = Math.round((count / totalDevices) * 100)
                  return (
                    <div key={item.key} className="dh-device-row">
                      <Icon size={14} style={{ color: item.color }} />
                      <span className="dh-device-label">{item.label}</span>
                      <div className="dh-device-track">
                        <div
                          className="dh-device-fill"
                          style={{ width: `${pct}%`, background: item.color }}
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

      {/* ── Recent messages ── */}
      {contacts.length > 0 && (
        <div className="dh-card dh-messages">
          <div className="dh-card-head">
            <Mail size={15} className="dh-card-icon" />
            <h3>Recent Messages</h3>
            {unread > 0 && <span className="dh-unread-badge">{unread} unread</span>}
            <Link to="/admin/messages" className="dh-card-link">
              View inbox <ArrowRight size={13} />
            </Link>
          </div>
          <div className="dh-msg-list">
            {contacts.slice(0, 4).map(c => (
              <button
                type="button"
                key={c.id}
                className={`dh-msg-row${!c.is_read ? ' dh-msg-row--unread' : ''}`}
                onClick={() => navigate('/admin/messages')}
              >
                <div className="dh-msg-avatar">
                  {(c.name?.[0] || '?').toUpperCase()}
                </div>
                <div className="dh-msg-body">
                  <span className="dh-msg-name">{c.name}</span>
                  <span className="dh-msg-subject">{c.subject || '(no subject)'}</span>
                </div>
                <span className="dh-msg-time">{timeAgo(c.created_at)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
