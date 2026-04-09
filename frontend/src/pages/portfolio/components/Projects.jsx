import React, { useEffect, useMemo, useState } from 'react'
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

function ProjectMediaGrid({ project, onOpen }) {
  const items = useMemo(() => {
    if (project?.project_type === 'live' || project?.project_type === undefined) {
      if (project?.thumbnail) {
        return [{ src: normalizeMediaUrl(project.thumbnail), caption: '' }]
      }
      return []
    }

    if (Array.isArray(project?.image_items) && project.image_items.length > 0) {
      return project.image_items
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((it) => ({ src: normalizeMediaUrl(it.image), caption: it.caption || '' }))
    }

    if (Array.isArray(project?.images) && project.images.length > 0) {
      return project.images.map((src) => ({ src: normalizeMediaUrl(src), caption: '' }))
    }

    if (project?.thumbnail) {
      return [{ src: normalizeMediaUrl(project.thumbnail), caption: '' }]
    }

    return []
  }, [project])

  if (items.length === 0) {
    return <div className="project-media__grid" />
  }

  return (
    <div className="project-media__grid">
      {items.map((it, idx) => (
        <button
          key={idx}
          type="button"
          className="project-media__tile"
          onClick={() => onOpen?.({ src: it.src, caption: it.caption || '', alt: project?.title || 'Project image' })}
        >
          <img src={it.src} alt={project?.title || 'Project image'} />
          {it.caption ? (
            <div className="project-media__caption" title={it.caption}>
              {it.caption}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  )
}

function chunkByTwo(items) {
  const pages = []
  for (let i = 0; i < items.length; i += 2) {
    pages.push(items.slice(i, i + 2))
  }
  return pages
}

function ProjectMediaCarousel({ project, onOpen }) {
  const items = useMemo(() => {
    if (project?.project_type === 'live' || project?.project_type === undefined) {
      if (project?.thumbnail) {
        return [{ src: normalizeMediaUrl(project.thumbnail), caption: '' }]
      }
      return []
    }

    if (Array.isArray(project?.image_items) && project.image_items.length > 0) {
      return project.image_items
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((it) => ({ src: normalizeMediaUrl(it.image), caption: it.caption || '' }))
    }

    if (Array.isArray(project?.images) && project.images.length > 0) {
      return project.images.map((src) => ({ src: normalizeMediaUrl(src), caption: '' }))
    }

    if (project?.thumbnail) {
      return [{ src: normalizeMediaUrl(project.thumbnail), caption: '' }]
    }

    return []
  }, [project])

  const pages = useMemo(() => chunkByTwo(items), [items])
  const [pageIndex, setPageIndex] = useState(0)

  if (items.length === 0) {
    return <div className="project-media__carousel" />
  }

  if (items.length === 1) {
    return <ProjectMediaGrid project={project} onOpen={onOpen} />
  }

  const canNavigate = pages.length > 1
  const safePageIndex = Math.min(pageIndex, pages.length - 1)

  const goPrev = (e) => {
    e.preventDefault()
    setPageIndex((i) => (i - 1 + pages.length) % pages.length)
  }

  const goNext = (e) => {
    e.preventDefault()
    setPageIndex((i) => (i + 1) % pages.length)
  }

  const goTo = (e, idx) => {
    e.preventDefault()
    setPageIndex(idx)
  }

  return (
    <div className="project-media__carousel">
      <div className="project-media__viewport">
        <div className="project-media__track" style={{ transform: `translateX(-${safePageIndex * 100}%)` }}>
          {pages.map((page, pIdx) => (
            <div key={pIdx} className="project-media__page">
              {page.map((it, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="project-media__tile"
                  onClick={() => onOpen?.({ src: it.src, caption: it.caption || '', alt: project?.title || 'Project image' })}
                >
                  <img src={it.src} alt={project?.title || 'Project image'} />
                  {it.caption ? (
                    <div className="project-media__caption" title={it.caption}>
                      {it.caption}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {canNavigate ? (
        <>
          <button type="button" className="project-media__nav project-media__nav--prev" onClick={goPrev} aria-label="Previous images">
            ‹
          </button>
          <button type="button" className="project-media__nav project-media__nav--next" onClick={goNext} aria-label="Next images">
            ›
          </button>
          <div className="project-media__dots" aria-label="Image pages">
            {pages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={idx === safePageIndex ? 'project-media__dot is-active' : 'project-media__dot'}
                onClick={(e) => goTo(e, idx)}
                aria-label={`Go to images ${idx + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default function Projects({ projects }) {
  const { config: seasonConfig } = useSeasonContext()
  const { theme } = useTheme()

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
        <h2 style={{ color: colors.primary }}>Featured Projects</h2>

        {(() => {
          const liveProjects = projects ? projects.filter(p => p.project_type === 'live' || p.project_type === undefined) : []
          const localProjects = projects ? projects.filter(p => p.project_type === 'local') : []

          return (
            <>
              {liveProjects.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '32px',
                  marginBottom: localProjects.length > 0 ? '60px' : '0'
                }}>
                  {liveProjects.map((project) => (
                    <div 
                      key={project.id} 
                      className="project-card" 
                      style={{
                        backgroundColor: colors.secondary,
                        border: `1px solid ${colors.accent}`,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                      }}
                    >
                      <div className="project-image" style={{ height: '240px', background: 'rgba(0,0,0,0.04)', flexShrink: 0 }}>
                        {project.thumbnail ? (
                          <img 
                            src={normalizeMediaUrl(project.thumbnail)} 
                            alt={project.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                          />
                        ) : (
                          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="project-info" style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{ margin: '0 0 16px 0', color: colors.primary, fontSize: '22px', lineHeight: 1.3 }}>{project.title}</h3>
                        
                        {project.description && (
                          <pre style={{ margin: '0 0 24px 0', color: colors.text, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '15px', lineHeight: '1.6', flex: 1, opacity: 0.9 }}>
                            {project.description}
                          </pre>
                        )}
                        
                        <div className="project-links" style={{ display: 'flex', gap: '12px', marginTop: 'auto', flexWrap: 'wrap' }}>
                          {project.url && (
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ 
                                padding: '10px 20px', 
                                borderRadius: '10px', 
                                textDecoration: 'none', 
                                backgroundColor: colors.accent, 
                                color: colors.background, 
                                fontWeight: '600',
                                fontSize: '14px',
                                textAlign: 'center',
                                flex: 1,
                                minWidth: 'fit-content'
                              }}
                            >
                              Live Site
                            </a>
                          )}
                          {project.github_url && (
                            <a 
                              href={project.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ 
                                padding: '10px 20px', 
                                borderRadius: '10px', 
                                textDecoration: 'none', 
                                backgroundColor: colors.primary, 
                                color: colors.background, 
                                fontWeight: '600',
                                fontSize: '14px',
                                textAlign: 'center',
                                flex: 1,
                                minWidth: 'fit-content'
                              }}
                            >
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {localProjects.length > 0 && (
                <div className="projects-list">
                  {localProjects.map((project) => (
                    <div key={project.id} className="project-row">
                      <div
                        className="project-details"
                        style={{
                          borderColor: colors.accent,
                          backgroundColor: colors.secondary,
                        }}
                      >
                        <div className="project-details__header">
                          <h3 style={{ color: colors.primary }}>{project.title}</h3>
                          <div className="project-details__links">
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  backgroundColor: colors.accent,
                                  color: colors.background,
                                }}
                              >
                                Live Site
                              </a>
                            )}
                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  backgroundColor: colors.primary,
                                  color: colors.background,
                                }}
                              >
                                GitHub
                              </a>
                            )}
                          </div>
                        </div>

                        {project.description ? (
                          <pre className="project-details__description" style={{ color: colors.text }}>
                            {project.description}
                          </pre>
                        ) : null}
                      </div>

                      <div
                        className="project-media"
                        style={{
                          borderColor: colors.accent,
                          backgroundColor: colors.secondary,
                        }}
                      >
                        <ProjectMediaCarousel project={project} onOpen={openImage} />
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
