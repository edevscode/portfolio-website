import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService, API_BASE_URL } from '../../services/apiService'
import { cache, CACHE_KEYS, CACHE_TTL } from '../../services/cache'
import { getReadableTextColor } from '../../utils/color'
import { useTheme } from '../../context/ThemeContext'
import { useSeasonContext } from '../../context/useSeasonContext'
import { SeasonalBackground } from '../../features/seasonal/components/SeasonalEffects'
import { SeasonalDecorations } from '../../features/seasonal/components/SeasonalDecorations'
import Footer from './components/Footer'
import Prose from '../../components/Prose'
import './ProjectDetailsViewer.css'

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

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ items, idx, onClose, onPrev, onNext }) {
  const image = items[idx]
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [idx])

  useEffect(() => {
    if (idx === null) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [idx, onClose, onPrev, onNext])

  useEffect(() => {
    if (idx === null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [idx])

  if (idx === null || !image) return null

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
    if (Math.abs(e.clientX - dragStart.x) > 5 || Math.abs(e.clientY - dragStart.y) > 5) return
    if (zoom > 1) { setZoom(1); setOffset({ x: 0, y: 0 }) } else setZoom(2.5)
  }

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      {/* Counter */}
      <div className="lightbox-counter">{idx + 1} / {items.length}</div>

      {/* Close */}
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">×</button>

      {/* Prev */}
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

      {/* Next */}
      {idx < items.length - 1 && (
        <button
          type="button"
          className="lightbox-nav lightbox-nav--next"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Next image"
        >
          ›
        </button>
      )}

      {/* Stage */}
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

      {/* Hint */}
      <div className="lightbox-hud">
        <span>{Math.round(zoom * 100)}%</span>
        <span>scroll to zoom · drag to pan · ← → to navigate</span>
      </div>

      {/* Caption */}
      {image.caption && (
        <div className="lightbox-caption">{image.caption}</div>
      )}
    </div>
  )
}

// ── Play icon for video thumbnails ────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="26" cy="26" r="26" fill="rgba(0,0,0,0.55)" />
      <polygon points="21,17 39,26 21,35" fill="white" />
    </svg>
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

  useEffect(() => { loadData() }, [slug])

  const loadData = async () => {
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
  }

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

  // Only images participate in the lightbox
  const imageItems = useMemo(() => items.filter((it) => it.type === 'image'), [items])

  const openLightbox = useCallback((src) => {
    const idx = imageItems.findIndex((it) => it.src === src)
    if (idx !== -1) setLightboxIdx(idx)
  }, [imageItems])

  const closeLightbox = useCallback(() => setLightboxIdx(null), [])
  const prevImage = useCallback(() => setLightboxIdx((i) => Math.max(0, i - 1)), [])
  const nextImage = useCallback(() => setLightboxIdx((i) => Math.min(imageItems.length - 1, i + 1)), [imageItems.length])

  if (loading) {
    return <div className="loading-screen" style={{ backgroundColor: colors.background, color: colors.text }}>Loading Project...</div>
  }

  if (!project) return null

  const totalMedia = items.length
  const imgCount = imageItems.length
  const vidCount = items.filter((it) => it.type === 'video').length

  return (
    <div className="project-details-page" style={{ backgroundColor: colors.background, color: colors.text }}>
      <SeasonalDecorations />
      <SeasonalBackground showParticles={true} themeColors={colors} />

      <Lightbox
        items={imageItems}
        idx={lightboxIdx}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
      />

      {/* Nav */}
      <nav className="project-details-nav" style={{ backgroundColor: `${colors.background}cc`, borderBottom: `1px solid ${colors.secondary}` }}>
        <button className="back-btn" onClick={() => navigate('/')} style={{ color: colors.primary }}>
          ← Back to Portfolio
        </button>
      </nav>

      <main className="project-details-main container">

        {/* Hero header */}
        <header className="project-details-hero">
          <h1 style={{ color: colors.primary }}>{project.title}</h1>
          <div className="project-details-links">
            {project.url && (
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="pill-btn" style={{ backgroundColor: colors.accent, color: getReadableTextColor(colors.accent) }}>
                Live Site
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="pill-btn" style={{ backgroundColor: colors.primary, color: getReadableTextColor(colors.primary) }}>
                GitHub
              </a>
            )}
          </div>
        </header>

        {/* Description */}
        {project.description && (
          <section className="project-details-description" style={{ backgroundColor: colors.secondary, borderColor: colors.accent }}>
            <Prose style={{ color: colors.text }}>{project.description}</Prose>
          </section>
        )}

        {/* Gallery */}
        {totalMedia > 0 && project.project_type === 'local' && (
          <section className="project-details-gallery">
            <div className="gallery-header">
              <h2 style={{ color: colors.primary }}>Project Gallery</h2>
              {totalMedia > 0 && (
                <div className="gallery-meta">
                  {imgCount > 0 && <span className="gallery-chip">{imgCount} photo{imgCount !== 1 ? 's' : ''}</span>}
                  {vidCount > 0 && <span className="gallery-chip">{vidCount} video{vidCount !== 1 ? 's' : ''}</span>}
                </div>
              )}
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
                        onKeyDown={(e) => e.key === 'Enter' && openLightbox(it.src)}
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
                            <div className="gallery-cell-hero-badge" style={{ backgroundColor: colors.accent, color: getReadableTextColor(colors.accent) }}>
                              Featured
                            </div>
                          )}
                        </div>
                        {/* Always-visible index dot */}
                        <div className="gallery-cell-index">{idx + 1}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <Footer socialLinks={portfolio?.social_links} />
    </div>
  )
}
