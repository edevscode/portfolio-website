import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService, API_BASE_URL } from '../../services/apiService'
import { cache, CACHE_KEYS, CACHE_TTL } from '../../services/cache'
import { getReadableTextColor } from '../../utils/color'
import { useTheme } from '../../context/ThemeContext'
import { useSeasonContext } from '../../context/useSeasonContext'
import { SeasonalBackground } from '../../features/seasonal/components/SeasonalEffects'
import { SeasonalDecorations } from '../../features/seasonal/components/SeasonalDecorations'
import Footer from './components/Footer'
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

function ImageModal({ open, image, onClose }) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!open) return
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [open, image?.src])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || !image?.src) return null

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY
    const next = clamp(zoom + (delta > 0 ? -0.12 : 0.12), 1, 4)
    if (next === 1) {
      setOffset({ x: 0, y: 0 })
    }
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
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    setOffset({ x: dragStartOffset.x + dx, y: dragStartOffset.y + dy })
  }

  const stopDragging = () => {
    // If we've barely moved, we could consider it a click, but we can just handle click directly on the stage.
    setDragging(false)
  }

  const handleStageClick = (e) => {
    // If we dragged, don't trigger a click
    if (Math.abs(e.clientX - dragStart.x) > 5 || Math.abs(e.clientY - dragStart.y) > 5) {
      return
    }
    
    // Toggle zoom
    if (zoom > 1) {
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    } else {
      setZoom(2.5)
      // Ideally we zoom into the clicked point, but for simplicity, center zoom is fine.
    }
  }

  return (
    <div className="project-image-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="project-image-modal__content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="project-image-modal__close" onClick={onClose} aria-label="Close image">
          ×
        </button>
        <div className="project-image-modal__hud" aria-hidden="true">
          <div className="project-image-modal__zoom">{Math.round(zoom * 100)}%</div>
          <div className="project-image-modal__hint">Click or scroll to zoom • Drag to pan</div>
        </div>
        <div
          className={dragging ? 'project-image-modal__stage is-dragging' : 'project-image-modal__stage'}
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
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
            className="project-image-modal__img"
          />
        </div>
        {image.caption ? <div className="project-image-modal__caption">{image.caption}</div> : null}
      </div>
    </div>
  )
}

export default function ProjectDetailsViewer() {
  const { slug } = useParams()
  const navigate = useNavigate()
  
  const [project, setProject] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const { theme } = useTheme()
  const { config: seasonConfig } = useSeasonContext()
  
  const [modalImage, setModalImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  useEffect(() => {
    loadData()
  }, [slug])

  const loadData = async () => {
    const slugStr = String(slug)
    const cachedProject = cache.get(CACHE_KEYS.project(slugStr))
    const cachedPortfolio = cache.get(CACHE_KEYS.portfolio)

    if (cachedProject) {
      // Instant render — data was prefetched
      setProject(cachedProject)
      setLoading(false)
      if (cachedPortfolio) setPortfolio(cachedPortfolio)

      // Revalidate both in background
      apiService.getProject(slugStr)
        .then(res => {
          cache.set(CACHE_KEYS.project(slugStr), res.data, CACHE_TTL.project)
          setProject(res.data)
        })
        .catch(() => {})

      apiService.getPortfolio()
        .then(res => {
          cache.set(CACHE_KEYS.portfolio, res.data, CACHE_TTL.portfolio)
          setPortfolio(res.data)
        })
        .catch(() => {})
      return
    }

    // Cache miss — fetch both, show spinner
    try {
      const [projectRes, portfolioRes] = await Promise.all([
        apiService.getProject(slugStr),
        cachedPortfolio
          ? Promise.resolve({ data: cachedPortfolio })
          : apiService.getPortfolio(),
      ])
      cache.set(CACHE_KEYS.project(slugStr), projectRes.data, CACHE_TTL.project)
      if (!cachedPortfolio) {
        cache.set(CACHE_KEYS.portfolio, portfolioRes.data, CACHE_TTL.portfolio)
      }
      setProject(projectRes.data)
      setPortfolio(portfolioRes.data)
    } catch (error) {
      console.error('Failed to load project details:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const openImage = (img) => {
    setModalImage(img)
    setIsModalOpen(true)
  }

  const closeImage = () => {
    setIsModalOpen(false)
    setModalImage(null)
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

    // Deduplicate images by src; videos are always unique
    const seen = new Set()
    return arr.filter((it) => {
      if (it.type === 'video') return true
      if (seen.has(it.src)) return false
      seen.add(it.src)
      return true
    })
  }, [project])

  if (loading) {
    return <div className="loading-screen" style={{ backgroundColor: colors.background, color: colors.text }}>Loading Project...</div>
  }

  if (!project) return null

  return (
    <div className="project-details-page" style={{
      backgroundColor: colors.background,
      color: colors.text,
      minHeight: '100vh',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <SeasonalDecorations />
      <SeasonalBackground showParticles={true} themeColors={colors} />
      
      <ImageModal open={isModalOpen} image={modalImage} onClose={closeImage} />

      {/* Navigation Bar Substitute */}
      <nav className="project-details-nav" style={{ backgroundColor: `${colors.background}cc`, borderBottom: `1px solid ${colors.secondary}` }}>
        <button className="back-btn" onClick={() => navigate('/')} style={{ color: colors.primary }}>
           ← Back to Portfolio
        </button>
      </nav>

      <main className="project-details-main container">
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

        {project.description && (
          <section className="project-details-description" style={{ backgroundColor: colors.secondary, borderColor: colors.accent }}>
            <pre style={{ color: colors.text }}>{project.description}</pre>
          </section>
        )}

        {items.length > 0 && project.project_type === 'local' && (
          <section className="project-details-gallery">
            <h2 style={{ color: colors.primary }}>Project Gallery</h2>
            <div className="gallery-grid">
              {items.map((it, idx) => (
                <div key={idx} className="gallery-item-wrap">
                  {it.type === 'video' ? (
                    <div className="gallery-item gallery-item--video" style={{ borderColor: colors.accent }}>
                      <video
                        src={it.src}
                        controls
                        preload="metadata"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', display: 'block' }}
                      />
                    </div>
                  ) : (
                    <div
                      className="gallery-item"
                      style={{ borderColor: colors.accent, cursor: 'zoom-in' }}
                      onClick={() => openImage({ src: it.src, caption: it.caption || '', alt: project.title })}
                    >
                      <img src={it.src} alt={`${project.title} gallery item`} />
                      <div className="gallery-item-overlay">
                        <span className="expand-icon">⤢</span>
                      </div>
                    </div>
                  )}
                  {it.caption && (
                    <div className="gallery-item-caption" style={{ color: colors.text }}>
                      {it.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer socialLinks={portfolio?.social_links} />
    </div>
  )
}
