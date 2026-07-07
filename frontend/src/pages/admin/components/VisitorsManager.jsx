import React, { useState, useEffect, useCallback } from 'react'
import { Eye, Globe, Monitor, Smartphone, Tablet, RefreshCw, TrendingUp, Users } from 'lucide-react'
import { apiService } from '../../../services/apiService'
import './DashboardHome.css'
import './VisitorsManager.css'

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
  try { return new URL(ref).hostname.replace(/^www\./, '') }
  catch { return ref.slice(0, 30) }
}

function DeviceIcon({ type }) {
  if (type === 'mobile') return <Smartphone size={13} />
  if (type === 'tablet') return <Tablet size={13} />
  return <Monitor size={13} />
}

export default function VisitorsManager() {
  const [stats, setStats]       = useState({ total: 0, today: 0, countries: [], devices: [] })
  const [visitors, setVisitors] = useState([])
  const [visitorError, setVisitorError] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setVisitorError(null)
    try {
      const [s, r] = await Promise.allSettled([
        apiService.getVisitorStats(),
        apiService.getRecentVisitors(),
      ])
      if (s.status === 'fulfilled') setStats(s.value.data)
      if (r.status === 'fulfilled') {
        const d = r.value.data
        setVisitors(Array.isArray(d) ? d : (d?.results ?? []))
      } else {
        const msg = r.reason?.response?.data?.detail
          || r.reason?.response?.statusText
          || r.reason?.message
          || 'Failed to load visitor log'
        setVisitorError(`${r.reason?.response?.status ?? ''} ${msg}`.trim())
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const totalDevices = stats.devices.reduce((s, d) => s + d.count, 0) || 1
  const deviceMap = Object.fromEntries(stats.devices.map(d => [d.device_type, d.count]))

  return (
    <div className="vm-root">

      {/* Header */}
      <div className="vm-header">
        <div>
          <h2 className="vm-title">Visitor Analytics</h2>
          <p className="vm-sub">People who visited your portfolio</p>
        </div>
        <button
          className={`dh-refresh-btn${refreshing ? ' spinning' : ''}`}
          onClick={() => load(true)}
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stat row */}
      <div className="vm-stats">
        <div className="vm-stat" style={{ '--acc': '#14b8a6' }}>
          <Eye size={18} />
          <div>
            <div className="vm-stat-val">{loading ? '—' : stats.total.toLocaleString()}</div>
            <div className="vm-stat-lbl">Total Visitors</div>
          </div>
        </div>
        <div className="vm-stat" style={{ '--acc': '#6366f1' }}>
          <TrendingUp size={18} />
          <div>
            <div className="vm-stat-val">{loading ? '—' : stats.today.toLocaleString()}</div>
            <div className="vm-stat-lbl">Today</div>
          </div>
        </div>
        <div className="vm-stat" style={{ '--acc': '#10b981' }}>
          <Globe size={18} />
          <div>
            <div className="vm-stat-val">{loading ? '—' : stats.countries.length}</div>
            <div className="vm-stat-lbl">Countries</div>
          </div>
        </div>
        <div className="vm-stat" style={{ '--acc': '#f59e0b' }}>
          <Users size={18} />
          <div>
            <div className="vm-stat-val">{loading ? '—' : (deviceMap['mobile'] || 0)}</div>
            <div className="vm-stat-lbl">Mobile Visitors</div>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="vm-body">

        {/* Visitor log */}
        <div className="dh-card vm-log">
          <div className="dh-card-head">
            <Eye size={15} className="dh-card-icon" />
            <h3>Visitor Log</h3>
            <span className="dh-card-badge">{visitors.length}</span>
          </div>

          {loading ? (
            <div className="dh-empty">Loading…</div>
          ) : visitorError ? (
            <div className="dh-empty vm-error">
              <strong>Could not load visitor log:</strong><br />{visitorError}
            </div>
          ) : visitors.length === 0 ? (
            <div className="dh-empty">No visitors yet. Share your portfolio!</div>
          ) : (
            <div className="vm-table-wrap">
              <table className="vm-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Device</th>
                    <th>Browser</th>
                    <th>Source</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map(v => (
                    <tr key={v.id}>
                      <td>
                        <span className="vm-flag">{flagEmoji(v.country_code)}</span>
                        <span className="vm-loc">
                          {[
                              v.city,
                              v.region && v.region !== v.city ? v.region : null,
                              v.country,
                            ].filter(Boolean).join(', ') || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className="vm-device">
                          <DeviceIcon type={v.device_type} />
                          {v.device_type || '—'}
                        </span>
                      </td>
                      <td className="vm-browser">{v.browser || '—'}</td>
                      <td className="vm-ref">{shortRef(v.referrer)}</td>
                      <td className="vm-time">{timeAgo(v.visited_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: countries + devices */}
        <div className="vm-side">

          <div className="dh-card">
            <div className="dh-card-head">
              <Globe size={15} className="dh-card-icon" />
              <h3>Top Countries</h3>
            </div>
            {stats.countries.length === 0 ? (
              <div className="dh-empty">No data yet.</div>
            ) : (
              <div className="dh-country-list">
                {stats.countries.map(c => (
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

          <div className="dh-card">
            <div className="dh-card-head">
              <Monitor size={15} className="dh-card-icon" />
              <h3>Devices</h3>
            </div>
            {stats.devices.length === 0 ? (
              <div className="dh-empty">No data yet.</div>
            ) : (
              <div className="dh-device-list">
                {[
                  { key: 'desktop', icon: Monitor,    label: 'Desktop', color: '#6366f1' },
                  { key: 'mobile',  icon: Smartphone, label: 'Mobile',  color: '#10b981' },
                  { key: 'tablet',  icon: Tablet,     label: 'Tablet',  color: '#f59e0b' },
                ].map(({ key, icon: Icon, label, color }) => {
                  const count = deviceMap[key] || 0
                  const pct = Math.round((count / totalDevices) * 100)
                  return (
                    <div key={key} className="dh-device-row">
                      <Icon size={14} style={{ color }} />
                      <span className="dh-device-label">{label}</span>
                      <div className="dh-device-track">
                        <div className="dh-device-fill" style={{ width: `${pct}%`, background: color }} />
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
    </div>
  )
}
