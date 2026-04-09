import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService, API_BASE_URL } from '../../services/apiService'
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
    setDragging(false)
  }

  const handleDoubleClick = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div className="project-image-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="project-image-modal__content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="project-image-modal__close" onClick={onClose} aria-label="Close image">
          ×
        </button>
        <div className="project-image-modal__hud" aria-hidden="true">
          <div className="project-image-modal__zoom">{Math.round(zoom * 100)}%</div>
          <div className="project-image-modal__hint">Scroll to zoom • Drag to pan • Double-click to reset</div>
        </div>
        <div
          className={dragging ? 'project-image-modal__stage is-dragging' : 'project-image-modal__stage'}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onPointerLeave={stopDragging}
          onDoubleClick={handleDoubleClick}
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
    try {
      const [projectRes, portfolioRes] = await Promise.all([
        apiService.getProject(slug),
        apiService.getPortfolio() // For Footer social links
      ])
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
    // Pull all the gallery images.
    const arr = []
    
    if (project.thumbnail) {
      arr.push({ src: normalizeMediaUrl(project.thumbnail), caption: 'Thumbnail' })
    }
    
    if (Array.isArray(project.image_items) && project.image_items.length > 0) {
      const imageItems = project.image_items
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((it) => ({ src: normalizeMediaUrl(it.image), caption: it.caption || '' }))
      arr.push(...imageItems)
    } else if (Array.isArray(project.images) && project.images.length > 0) {
      const imageItems = project.images.map((src) => ({ src: normalizeMediaUrl(src), caption: '' }))
      arr.push(...imageItems)
    }
    
    // Deduplicate thumbnail if it exists inside images array
    const uniqueMap = {}
    const filtered = []
    for (const item of arr) {
      if (!uniqueMap[item.src]) {
        uniqueMap[item.src] = true
        filtered.push(item)
      }
    }
    return filtered
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
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="pill-btn" style={{ backgroundColor: colors.accent, color: colors.background }}>
                Live Site
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="pill-btn" style={{ backgroundColor: colors.primary, color: colors.background }}>
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

        {items.length > 0 && (
          <section className="project-details-gallery">
            <h2 style={{ color: colors.primary }}>Project Gallery</h2>
            <div className="gallery-grid">
              {items.map((it, idx) => (
                <div key={idx} className="gallery-item-wrap" onClick={() => openImage({ src: it.src, caption: it.caption || '', alt: project.title })}>
                  <div className="gallery-item" style={{ borderColor: colors.accent }}>
                    <img src={it.src} alt={`${project.title} gallery item`} />
                    <div className="gallery-item-overlay">
                      <span className="expand-icon">⤢</span>
                    </div>
                  </div>
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
