import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { useTheme } from '../../../context/ThemeContext'
import { API_BASE_URL } from '../../../services/apiService'
import './Projects.css'

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

export default function Projects({ projects }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()
  const navigate = useNavigate()

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

  const [modalImage, setModalImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openImage = (img) => {
    setModalImage(img)
    setIsModalOpen(true)
  }

  const closeImage = () => {
    setIsModalOpen(false)
    setModalImage(null)
  }

  return (
    <section className="projects" id="projects" style={{
      backgroundColor: colors.background
    }}>
      <ImageModal open={isModalOpen} image={modalImage} onClose={closeImage} />
      <div className="container">
        <h2 className="projects-title" style={{ color: colors.primary }}>Featured Projects</h2>

        {(() => {
          const liveProjects = projects ? projects.filter(p => p.project_type === 'live' || p.project_type === undefined) : []
          const localProjects = projects ? projects.filter(p => p.project_type === 'local') : []

          return (
            <>
              {liveProjects.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                  gap: '40px',
                  marginBottom: localProjects.length > 0 ? '80px' : '0'
                }}>
                  {liveProjects.map((project) => (
                    <div 
                      key={project.id} 
                      className="live-project-glass-card" 
                      style={{
                        borderColor: colors.accent,
                        boxShadow: `0 8px 32px ${colors.accent}15`
                      }}
                    >
                      <div className="glass-card-bg">
                        {project.thumbnail ? (
                          <img 
                            src={normalizeMediaUrl(project.thumbnail)} 
                            alt={project.title} 
                          />
                        ) : (
                          <div className="glass-placeholder" style={{ backgroundColor: colors.secondary, color: colors.text }}>
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="glass-card-content" style={{ backgroundColor: `${colors.secondary}cc` }}>
                        <div className="glass-card-header">
                          <h3 style={{ color: colors.primary }}>{project.title}</h3>
                          <div className="glass-card-links">
                            {project.url && (
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="pill-btn"
                                style={{ backgroundColor: colors.accent, color: colors.background }}
                              >
                                Live Site
                              </a>
                            )}
                            {project.github_url && (
                              <a 
                                href={project.github_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="pill-btn"
                                style={{ backgroundColor: colors.primary, color: colors.background }}
                              >
                                GitHub
                              </a>
                            )}
                          </div>
                        </div>
                        {project.description && (
                          <pre className="glass-card-description" style={{ color: colors.text }}>
                            {project.description}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {localProjects.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '30px'
                }}>
                  {localProjects.map((project) => (
                    <div 
                      key={project.id} 
                      className="local-project-summary-card"
                      onClick={() => navigate(`/project/${project.slug || project.id}`)}
                      style={{
                        borderColor: colors.accent,
                        backgroundColor: colors.secondary,
                      }}
                    >
                      <div className="summary-card-image" style={{ background: 'rgba(0,0,0,0.04)' }}>
                        {project.thumbnail ? (
                          <img 
                            src={normalizeMediaUrl(project.thumbnail)} 
                            alt={project.title} 
                          />
                        ) : (
                          <div className="glass-placeholder">No Image</div>
                        )}
                        <div className="summary-card-overlay">
                          <span>View Gallery</span>
                        </div>
                      </div>
                      <div className="summary-card-content">
                        <h3 style={{ color: colors.primary }}>{project.title}</h3>
                        {project.description && (
                          <pre className="summary-card-description" style={{ color: colors.text }}>
                            {project.description}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        })()}
      </div>
    </section>
  )
}
