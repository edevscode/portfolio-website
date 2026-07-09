import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import { API_BASE_URL } from '../../../services/apiService'
import { getReadableTextColor } from '../../../utils/color'
import './Projects.css'

function stripToPlainText(text) {
  if (!text) return ''
  return text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeMediaUrl(url) {
  if (!url) return ''
  if (typeof url !== 'string') return ''
  if (/^https?:\/\//i.test(url)) return url
  const origin = (() => {
    try { return new URL(API_BASE_URL).origin } catch { return '' }
  })()
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, colors, onNavigate }) {
  const [hovered, setHovered] = useState(false)
  const isLocal = project.project_type === 'local'
  const desc = stripToPlainText(project.description)
  const thumbnailUrl = normalizeMediaUrl(project.thumbnail)

  const accentRgb = hexToRgbParts(colors.accent)
  const hoverShadow = hovered
    ? `0 28px 56px -12px rgba(${accentRgb}, 0.30), 0 8px 20px -8px rgba(0,0,0,0.18)`
    : '0 2px 12px rgba(0,0,0,0.07)'

  return (
    <article
      className="pcard"
      style={{ backgroundColor: colors.secondary, boxShadow: hoverShadow }}
      onClick={() => onNavigate(`/project/${project.slug || project.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onNavigate(`/project/${project.slug || project.id}`)}
      aria-label={`View ${project.title}`}
    >
      {/* ── Image zone ── */}
      <div className="pcard-media">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={project.title}
            className="pcard-img"
            loading="lazy"
          />
        ) : (
          <div
            className="pcard-placeholder"
            style={{ background: `linear-gradient(135deg, ${colors.accent}28 0%, ${colors.primary}18 100%)` }}
          >
            <span className="pcard-placeholder-initial" style={{ color: colors.accent }}>
              {project.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Always-visible bottom gradient + title */}
        <div className="pcard-img-footer">
          <h3 className="pcard-title" style={{ color: '#fff' }}>{project.title}</h3>
        </div>

        {/* Type badge */}
        <div className={`pcard-badge ${isLocal ? 'pcard-badge--gallery' : 'pcard-badge--live'}`}>
          {isLocal ? 'Gallery' : 'Live Site'}
        </div>

        {/* CTA — slides up on hover */}
        <div className="pcard-cta-layer">
          <span className="pcard-cta-pill">
            {isLocal ? 'View Gallery' : 'View Details'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="pcard-body">
        {desc && (
          <p className="pcard-desc" style={{ color: colors.text }}>{desc}</p>
        )}

        {(project.url || project.github_url) && (
          <div className="pcard-links">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pcard-link pcard-link--primary"
                style={{ backgroundColor: colors.accent, color: getReadableTextColor(colors.accent) }}
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Live Site
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pcard-link pcard-link--github"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

// ── Section divider ───────────────────────────────────────────────────────────

function GroupLabel({ label, accent }) {
  return (
    <div className="project-group-label-row">
      <div className="project-group-rule" style={{ backgroundColor: accent }} />
      <span className="project-group-label-text" style={{ color: accent }}>{label}</span>
      <div className="project-group-rule" style={{ backgroundColor: accent }} />
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgbParts(hex) {
  if (!hex) return '99,102,241'
  const clean = hex.replace('#', '')
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '99,102,241'
  return `${r},${g},${b}`
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Projects({ projects }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const colors = theme ? {
    primary: theme.primary_color || seasonConfig?.colors?.primary || '#1a472a',
    background: theme.background_color || seasonConfig?.colors?.background || 'white',
    text: theme.text_color || seasonConfig?.colors?.text || 'black',
    secondary: theme.secondary_color || seasonConfig?.colors?.secondary || '#e8f4f8',
    accent: theme.accent_color || seasonConfig?.colors?.accent || '#4da6ff',
  } : {
    primary: seasonConfig?.colors?.primary || '#1a472a',
    background: seasonConfig?.colors?.background || 'white',
    text: seasonConfig?.colors?.text || 'black',
    secondary: seasonConfig?.colors?.secondary || '#e8f4f8',
    accent: seasonConfig?.colors?.accent || '#4da6ff',
  }

  if (!projects || projects.length === 0) return null

  const TYPE_LABELS = {
    live:    'Web Applications',
    mobile:  'Mobile Apps',
    desktop: 'Desktop Apps',
    api:     'API & Backend',
    design:  'UI/UX Design',
    local:   'Project Gallery',
  }

  // Group by type, preserving insertion order
  const groupMap = projects.reduce((acc, p) => {
    const type = p.project_type || 'live'
    if (!acc[type]) acc[type] = []
    acc[type].push(p)
    return acc
  }, {})

  const groupEntries = Object.entries(groupMap)
  const showGroupLabels = groupEntries.length > 1

  return (
    <section className="projects" id="projects" style={{ backgroundColor: colors.background }}>
      <div className="container">

        {/* Section header */}
        <div className="projects-section-header">
          <span className="projects-label" style={{ color: colors.accent, background: `color-mix(in srgb, ${colors.accent} 12%, transparent)` }}>
            Portfolio
          </span>
          <h2 className="projects-title" style={{ color: colors.primary }}>Featured Projects</h2>
          <p className="projects-subtitle" style={{ color: colors.text }}>
            A selection of work I've built and shipped
          </p>
        </div>

        {groupEntries.map(([type, items]) => (
          <div
            key={type}
            className={`project-group ${showGroupLabels ? 'project-group--spaced' : ''}`}
          >
            {showGroupLabels && (
              <GroupLabel
                label={TYPE_LABELS[type] || type}
                accent={colors.accent}
              />
            )}
            <div className="projects-grid">
              {items.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  colors={colors}
                  onNavigate={navigate}
                />
              ))}
            </div>
          </div>
        ))}

      </div>
    </section>
  )
}
