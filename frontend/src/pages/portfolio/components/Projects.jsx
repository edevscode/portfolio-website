import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { API_BASE_URL } from '../../../services/apiService'
import { safeHref } from '../../../utils/sanitize'
import { useReveal } from '../../../hooks/useReveal'
import './Projects.css'

const TYPE_BADGE_LABELS = {
  live:    'Web App',
  mobile:  'Mobile App',
  desktop: 'Desktop App',
  api:     'API',
  design:  'Design',
  local:   'Gallery',
}

const FILTER_LABELS = {
  live:    'Web Apps',
  mobile:  'Mobile',
  desktop: 'Desktop',
  api:     'API',
  design:  'Design',
  local:   'Gallery',
}

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

function ProjectCard({ project, spotlight = false, showFeaturedTag = false }) {
  const isLocal = project.project_type === 'local'
  const badgeLabel = TYPE_BADGE_LABELS[project.project_type] || 'Project'
  const detailPath = `/project/${project.slug || project.id}`
  const desc = stripToPlainText(project.description)
  const thumbnailUrl = normalizeMediaUrl(project.thumbnail)

  const liveUrl = safeHref(project.url)
  const githubUrl = safeHref(project.github_url)

  return (
    <article className={`pcard${spotlight ? ' pcard--spotlight' : ''}`}>
      {/* ── Unobstructed screenshot frame ── */}
      <Link
        to={detailPath}
        className="pcard-media-link"
        aria-label={`View ${project.title}`}
      >
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
              style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 16%, var(--theme-surface)) 0%, color-mix(in srgb, var(--primary-color) 12%, var(--theme-surface)) 100%)' }}
            >
              <span className="pcard-placeholder-initial" style={{ color: 'var(--theme-accent-on-surface)' }}>
                {project.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <span className="pcard-media-cue" aria-hidden="true">
            <ArrowUpRight size={15} />
          </span>
        </div>
      </Link>

      {/* ── Editorial body below media ── */}
      <div className="pcard-body">
        <div className="pcard-meta">
          <span className="pcard-type-tag">{badgeLabel}</span>
          {showFeaturedTag && (
            <span className="pcard-featured-tag">Featured</span>
          )}
        </div>

        <h3 className="pcard-title">
          <Link to={detailPath} className="pcard-title-link">
            {project.title}
          </Link>
        </h3>

        {desc && (
          <p className="pcard-desc">{desc}</p>
        )}

        <div className="pcard-links">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pcard-link pcard-link--primary"
              style={{ backgroundColor: 'var(--accent-color)', color: 'var(--theme-on-accent)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Live Site
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pcard-link pcard-link--github"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          )}
          <Link to={detailPath} className="pcard-link pcard-link--details">
            {isLocal ? 'View Gallery' : 'Details'}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Projects({ projects }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [revealRef, visible] = useReveal()

  const list = useMemo(() => (Array.isArray(projects) ? projects : []), [projects])

  const typeCounts = useMemo(() => {
    const map = new Map()
    for (const p of list) {
      const t = p.project_type || 'live'
      map.set(t, (map.get(t) || 0) + 1)
    }
    return Array.from(map.entries())
  }, [list])

  const effectiveFilter = useMemo(() => {
    if (activeFilter === 'all') return 'all'
    return typeCounts.some(([type]) => type === activeFilter) ? activeFilter : 'all'
  }, [activeFilter, typeCounts])

  const filtered = useMemo(() => {
    if (effectiveFilter === 'all') return list
    return list.filter((p) => (p.project_type || 'live') === effectiveFilter)
  }, [list, effectiveFilter])

  if (list.length === 0) return null

  // Spotlight logic: elevate featured project(s) when showing all and featured is a distinct subset (or single project)
  const featuredSubset = filtered.filter((p) => p.is_featured)
  const useSpotlight =
    effectiveFilter === 'all' &&
    ((featuredSubset.length >= 1 && featuredSubset.length < filtered.length) || filtered.length === 1)

  const spotlightProjects = useSpotlight
    ? (featuredSubset.length > 0 ? featuredSubset.slice(0, 2) : filtered.slice(0, 1))
    : []
  const spotlightIds = new Set(spotlightProjects.map((p) => p.id))
  const gridProjects = filtered.filter((p) => !spotlightIds.has(p.id))

  return (
    <section
      ref={revealRef}
      className={`projects pv-reveal${visible ? ' pv-reveal--visible' : ''}`}
      id="projects"
    >
      <div className="projects-inner">

        {/* Editorial header + filter pills */}
        <div className="projects-section-header">
          <div>
            <span className="pv-section-eyebrow projects-label">
              <span className="pv-section-eyebrow-num">01</span>
              <span>Selected Work</span>
            </span>
            <h2 className="projects-title">Featured Projects</h2>
          </div>

          {typeCounts.length > 1 && (
            <div className="projects-filters" role="group" aria-label="Filter projects by type">
              <button
                type="button"
                className={`projects-filter-btn${effectiveFilter === 'all' ? ' is-active' : ''}`}
                aria-pressed={effectiveFilter === 'all'}
                onClick={() => setActiveFilter('all')}
              >
                All <span className="projects-filter-count">{list.length}</span>
              </button>
              {typeCounts.map(([type, count]) => (
                <button
                  type="button"
                  key={type}
                  className={`projects-filter-btn${effectiveFilter === type ? ' is-active' : ''}`}
                  aria-pressed={effectiveFilter === type}
                  onClick={() => setActiveFilter(type)}
                >
                  {FILTER_LABELS[type] || TYPE_BADGE_LABELS[type] || type}
                  <span className="projects-filter-count">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Featured spotlight cards */}
        {spotlightProjects.length > 0 && (
          <div className="projects-spotlight-list">
            {spotlightProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                spotlight
                showFeaturedTag={Boolean(project.is_featured && featuredSubset.length < filtered.length)}
              />
            ))}
          </div>
        )}

        {/* Standard project grid */}
        {gridProjects.length > 0 && (
          <div className="projects-grid">
            {gridProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                showFeaturedTag={Boolean(project.is_featured && featuredSubset.length < filtered.length)}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
