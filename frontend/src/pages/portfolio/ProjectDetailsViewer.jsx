import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, Maximize2 } from 'lucide-react'
import { apiService, API_BASE_URL } from '../../services/apiService'
import { cache, CACHE_KEYS, CACHE_TTL } from '../../services/cache'
import { safeHref } from '../../utils/sanitize'
import { useTheme } from '../../context/ThemeContext'
import { useSeasonContext } from '../../context/useSeasonContext'
import { SeasonalBackground } from '../../features/seasonal/components/SeasonalEffects'
import { SeasonalDecorations } from '../../features/seasonal/components/SeasonalDecorations'
import Footer from './components/Footer'
import Prose from '../../components/Prose'
import './ProjectDetailsViewer.css'

const TYPE_LABELS = {
  live:    'Web Application',
  mobile:  'Mobile App',
  desktop: 'Desktop App',
  api:     'API & Backend',
  design:  'UI/UX Design',
  local:   'Project Gallery',
}

function normalizeMediaUrl(url) {
  if (!url) return ''
  if (typeof url !== 'string') return ''
  if (/^https?:\/\//i.test(url)) return url
  const origin = (() => {
    try {
      return new URL(API_BASE_URL).origin
    } catch {
      return ''
    }
  })()
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function ProjectSkeleton() {
  return (
    <div className="pd-skeleton" aria-busy="true" aria-label="Loading project">
      <div className="pd-skel-nav">
        <div className="pd-skel-bar pd-skel-back" />
      </div>
      <div className="pd-skel-main">
        <div className="pd-skel-bar pd-skel-tag" />
        <div className="pd-skel-bar pd-skel-title" />
        <div className="pd-skel-actions">
          <div className="pd-skel-bar pd-skel-pill" />
          <div className="pd-skel-bar pd-skel-pill" />
        </div>
        <div className="pd-skel-cover" />
        <div className="pd-skel-body" />
      </div>
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function LightboxStage({ image, onClose, onPrev, onNext, idx, total }) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleWheel = (e) => {
    e.preventDefault()
    const next = clamp(zoom + (e.deltaY > 0 ? -0.12 : 0.12), 1, 4)
    if (next === 1) setOffset({ x: 0, y: 0 })
    setZoom(next)
  }

  const handlePointerDown = (e) => {
    if (zoom <= 1) return
    setDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragStartOffset(offset)
  }

  const handlePointerMove = (e) => {
    if (!dragging) return
    setOffset({ x: dragStartOffset.x + e.clientX - dragStart.x, y: dragStartOffset.y + e.clientY - dragStart.y })
  }

  const stopDragging = () => setDragging(false)

  const handleStageClick = (e) => {
    e.stopPropagation()
    if (Math.abs(e.clientX - dragStart.x) > 5 || Math.abs(e.clientY - dragStart.y) > 5) return
    if (zoom > 1) { setZoom(1); setOffset({ x: 0, y: 0 }) } else setZoom(2.5)
  }

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}>
      {total > 1 && <div className="lightbox-counter">{idx + 1} / {total}</div>}

      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">×</button>

      {idx > 0 && (
        <button
          type="button"
          className="lightbox-nav lightbox-nav--prev"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="Previous image"
        >
          ‹
        </button>
      )}

      {idx < total - 1 && (
        <button
          type="button"
          className="lightbox-nav lightbox-nav--next"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Next image"
        >
          ›
        </button>
      )}

      <div
        className={`lightbox-stage${dragging ? ' is-dragging' : ''}`}
        style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
        onClick={handleStageClick}
      >
        <img
          src={image.src}
          alt={image.alt || 'Project image'}
          className="lightbox-img"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
        />
      </div>

      <div className="lightbox-hud">
        <span>{Math.round(zoom * 100)}%</span>
        <span>scroll to zoom · drag to pan{total > 1 ? ' · ← → to navigate' : ''}</span>
      </div>

      {image.caption && (
        <div className="lightbox-caption">{image.caption}</div>
      )}
    </div>
  )
}

function Lightbox({ items, idx, onClose, onPrev, onNext }) {
  if (idx === null || !items[idx]) return null
  return (
    <LightboxStage
      key={idx}
      image={items[idx]}
      idx={idx}
      total={items.length}
      onClose={onClose}
      onPrev={onPrev}
      onNext={onNext}
    />
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProjectDetailsViewer() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)

  const { theme } = useTheme()
  const { config: seasonConfig } = useSeasonContext()

  const [lightboxIdx, setLightboxIdx] = useState(null)

  const colors = theme ? {
    primary: theme.primary_color || seasonConfig?.colors?.primary || '#1a472a',
    background: theme.background_color || seasonConfig?.colors?.background || 'white',
    text: theme.text_color || seasonConfig?.colors?.text || 'black',
    secondary: theme.secondary_color || seasonConfig?.colors?.secondary || '#e8f4f8',
    accent: theme.accent_color || seasonConfig?.colors?.accent || '#4da6ff'
  } : {
    primary: seasonConfig?.colors?.primary || '#1a472a',
    background: seasonConfig?.colors?.background || 'white',
    text: seasonConfig?.colors?.text || 'black',
    secondary: seasonConfig?.colors?.secondary || '#e8f4f8',
    accent: seasonConfig?.colors?.accent || '#4da6ff'
  }

  const loadData = useCallback(async () => {
    const slugStr = String(slug)
    const cachedProject = cache.get(CACHE_KEYS.project(slugStr))
    const cachedPortfolio = cache.get(CACHE_KEYS.portfolio)

    if (cachedProject) {
      setProject(cachedProject)
      setLoading(false)
      if (cachedPortfolio) setPortfolio(cachedPortfolio)
      apiService.getProject(slugStr).then(res => { cache.set(CACHE_KEYS.project(slugStr), res.data, CACHE_TTL.project); setProject(res.data) }).catch(() => {})
      apiService.getPortfolio().then(res => { cache.set(CACHE_KEYS.portfolio, res.data, CACHE_TTL.portfolio); setPortfolio(res.data) }).catch(() => {})
      return
    }

    try {
      setLoading(true)
      const [projectRes, portfolioRes] = await Promise.all([
        apiService.getProject(slugStr),
        cachedPortfolio ? Promise.resolve({ data: cachedPortfolio }) : apiService.getPortfolio(),
      ])
      cache.set(CACHE_KEYS.project(slugStr), projectRes.data, CACHE_TTL.project)
      if (!cachedPortfolio) cache.set(CACHE_KEYS.portfolio, portfolioRes.data, CACHE_TTL.portfolio)
      setProject(projectRes.data)
      setPortfolio(portfolioRes.data)
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }, [slug, navigate])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    loadData()
  }, [loadData])

  const items = useMemo(() => {
    if (!project) return []
    const arr = []

    if (Array.isArray(project.image_items) && project.image_items.length > 0) {
      project.image_items
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((it) => arr.push({ src: normalizeMediaUrl(it.image), caption: it.caption || '', type: 'image' }))
    } else if (Array.isArray(project.images) && project.images.length > 0) {
      project.images.forEach((src) => arr.push({ src: normalizeMediaUrl(src), caption: '', type: 'image' }))
    }

    if (Array.isArray(project.video_items) && project.video_items.length > 0) {
      project.video_items
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((it) => arr.push({ src: normalizeMediaUrl(it.video), caption: it.caption || '', type: 'video' }))
    }

    const seen = new Set()
    return arr.filter((it) => {
      if (it.type === 'video') return true
      if (seen.has(it.src)) return false
      seen.add(it.src)
      return true
    })
  }, [project])

  const coverUrl = useMemo(() => normalizeMediaUrl(project?.thumbnail), [project?.thumbnail])
  const showGallery = items.length > 0 && project?.project_type === 'local'
  const showCoverFrame = Boolean(coverUrl && (!showGallery || !items.some((it) => it.src === coverUrl)))

  // Include cover image in lightbox list so clicking the hero cover opens zoomable view too
  const lightboxImages = useMemo(() => {
    const galleryImgs = items.filter((it) => it.type === 'image')
    if (showCoverFrame && coverUrl && !galleryImgs.some((it) => it.src === coverUrl)) {
      return [{ src: coverUrl, caption: project?.title || '', alt: project?.title || 'Project cover', type: 'image' }, ...galleryImgs]
    }
    return galleryImgs
  }, [items, showCoverFrame, coverUrl, project?.title])

  const openLightbox = useCallback((src) => {
    const idx = lightboxImages.findIndex((it) => it.src === src)
    if (idx !== -1) setLightboxIdx(idx)
  }, [lightboxImages])

  const closeLightbox = useCallback(() => setLightboxIdx(null), [])
  const prevImage = useCallback(() => setLightboxIdx((i) => Math.max(0, i - 1)), [])
  const nextImage = useCallback(() => setLightboxIdx((i) => Math.min(lightboxImages.length - 1, i + 1)), [lightboxImages.length])

  const brandName = portfolio?.about?.hero_name?.trim() || 'Eron Dave Geronimo'

  const availableSections = useMemo(() => {
    const secs = [{ id: 'hero', label: 'Home' }]
    if (!portfolio || portfolio?.projects?.length) secs.push({ id: 'projects', label: 'Projects' })
    if (!portfolio || portfolio?.experiences?.length) secs.push({ id: 'experience', label: 'Experience' })
    secs.push({ id: 'about', label: 'About' })
    if (!portfolio || portfolio?.skills?.length) secs.push({ id: 'skills', label: 'Skills' })
    if (!portfolio || portfolio?.certificates?.length) secs.push({ id: 'certificates', label: 'Certificates' })
    secs.push({ id: 'contact', label: 'Contact' })
    return secs
  }, [portfolio])

  const { prevProject, nextProject } = useMemo(() => {
    const all = portfolio?.projects || []
    if (!project || all.length < 2) return { prevProject: null, nextProject: null }
    const currentIdx = all.findIndex((p) => String(p.slug || p.id) === String(project.slug || project.id))
    if (currentIdx === -1) return { prevProject: null, nextProject: null }
    return {
      prevProject: currentIdx > 0 ? all[currentIdx - 1] : null,
      nextProject: currentIdx < all.length - 1 ? all[currentIdx + 1] : null,
    }
  }, [portfolio?.projects, project])

  useEffect(() => {
    if (!project?.title) return
    document.title = `${project.title} — ${brandName}`
  }, [project?.title, brandName])

  if (loading) {
    return <ProjectSkeleton />
  }

  if (!project) return null

  const totalMedia = items.length
  const imgCount = items.filter((it) => it.type === 'image').length
  const vidCount = items.filter((it) => it.type === 'video').length
  const liveUrl = safeHref(project.url)
  const githubUrl = safeHref(project.github_url)
  const typeLabel = TYPE_LABELS[project.project_type] || 'Project'

  return (
    <div className="project-details-page portfolio-root" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      <SeasonalDecorations />
      <SeasonalBackground showParticles={true} themeColors={colors} />

      <Lightbox
        items={lightboxImages}
        idx={lightboxIdx}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
      />

      {/* Sticky Breadcrumb Nav */}
      <nav className="project-details-nav" aria-label="Project navigation">
        <div className="project-details-nav-inner">
          <Link to="/#projects" className="back-btn">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Projects</span>
          </Link>
          <div className="pd-breadcrumb" aria-hidden="true">
            <span>{brandName}</span>
            <span className="pd-breadcrumb-sep">/</span>
            <span className="pd-breadcrumb-current">{project.title}</span>
          </div>
        </div>
      </nav>

      <main className="project-details-main container">

        {/* Editorial Hero Header */}
        <header className="project-details-hero">
          <div className="pd-hero-meta">
            <span className="pd-type-pill">{typeLabel}</span>
            {project.is_featured && (
              <span className="pd-featured-pill">Featured</span>
            )}
          </div>

          <h1>{project.title}</h1>

          {(liveUrl || githubUrl) && (
            <div className="project-details-links">
              {liveUrl && (
                <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="pill-btn pill-btn--accent">
                  <span>Live Site</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="pill-btn pill-btn--primary">
                  <span>View Source</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </header>

        {/* Cover Showcase Frame (ensures every project type shows its visual preview) */}
        {showCoverFrame && (
          <figure className="pd-cover-wrap">
            <button
              type="button"
              className="pd-cover-btn"
              onClick={() => openLightbox(coverUrl)}
              aria-label={`Inspect ${project.title} preview image`}
            >
              <img
                src={coverUrl}
                alt={project.title}
                className="pd-cover-img"
              />
              <span className="pd-cover-zoom" aria-hidden="true">
                <Maximize2 size={15} />
                <span>Inspect</span>
              </span>
            </button>
          </figure>
        )}

        {/* Description */}
        {project.description && (
          <section className="project-details-description">
            <div className="pd-section-tag">Overview</div>
            <Prose style={{ color: 'var(--theme-surface-text)' }}>{project.description}</Prose>
          </section>
        )}

        {/* Gallery */}
        {showGallery && (
          <section className="project-details-gallery">
            <div className="gallery-header">
              <h2>Project Gallery</h2>
              <div className="gallery-meta">
                {imgCount > 0 && <span className="gallery-chip">{imgCount} photo{imgCount !== 1 ? 's' : ''}</span>}
                {vidCount > 0 && <span className="gallery-chip">{vidCount} video{vidCount !== 1 ? 's' : ''}</span>}
              </div>
            </div>

            <div className="gallery-bento">
              {items.map((it, idx) => {
                const isHero = idx === 0 && totalMedia > 1
                const cellClass = [
                  'gallery-cell',
                  isHero ? 'gallery-cell--hero' : '',
                  it.type === 'video' ? 'gallery-cell--video' : 'gallery-cell--image',
                ].filter(Boolean).join(' ')

                return (
                  <div key={idx} className={cellClass}>
                    {it.type === 'video' ? (
                      <>
                        <video
                          src={it.src}
                          controls
                          preload="metadata"
                          className="gallery-cell-video"
                        />
                        {it.caption && (
                          <div className="gallery-cell-caption gallery-cell-caption--video" style={{ color: colors.text }}>
                            {it.caption}
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        className="gallery-cell-inner"
                        onClick={() => openLightbox(it.src)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openLightbox(it.src)
                          }
                        }}
                        aria-label={`View image${it.caption ? `: ${it.caption}` : ''}`}
                      >
                        <img
                          src={it.src}
                          alt={`${project.title} — ${idx + 1}`}
                          className="gallery-cell-img"
                          loading={idx < 4 ? 'eager' : 'lazy'}
                        />
                        <div className="gallery-cell-overlay">
                          <div className="gallery-cell-overlay-bg" />
                          <div className="gallery-cell-overlay-content">
                            {it.caption && <p className="gallery-cell-caption-text">{it.caption}</p>}
                            <div className="gallery-cell-zoom-icon" style={{ borderColor: 'rgba(255,255,255,0.6)' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                              </svg>
                            </div>
                          </div>
                          {isHero && (
                            <div className="gallery-cell-hero-badge" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--theme-on-accent)' }}>
                              Featured
                            </div>
                          )}
                        </div>
                        <div className="gallery-cell-index">{idx + 1}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Previous / Next Project Switcher */}
        {(prevProject || nextProject) && (
          <nav className="pd-more-projects" aria-label="More projects">
            {prevProject ? (
              <Link to={`/project/${prevProject.slug || prevProject.id}`} className="pd-more-card">
                <span className="pd-more-dir">
                  <ArrowLeft size={13} aria-hidden="true" /> Previous Project
                </span>
                <span className="pd-more-title">{prevProject.title}</span>
              </Link>
            ) : <div />}

            {nextProject && (
              <Link to={`/project/${nextProject.slug || nextProject.id}`} className="pd-more-card pd-more-card--next">
                <span className="pd-more-dir">
                  Next Project <ArrowRight size={13} aria-hidden="true" />
                </span>
                <span className="pd-more-title">{nextProject.title}</span>
              </Link>
            )}
          </nav>
        )}
      </main>

      <Footer socialLinks={portfolio?.social_links} brandName={brandName} sections={availableSections} />
    </div>
  )
}
