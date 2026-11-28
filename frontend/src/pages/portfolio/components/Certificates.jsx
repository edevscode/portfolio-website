import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { useSeasonContext } from '../../../context/useSeasonContext'
import { API_BASE_URL } from '../../../services/apiService'
import { useReveal } from '../../../hooks/useReveal'
import Prose from '../../../components/Prose'
import { safeHref } from '../../../utils/sanitize'
import './Certificates.css'

const INITIAL_VISIBLE = 6

function normalizeUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  try {
    return `${new URL(API_BASE_URL).origin}${url.startsWith('/') ? '' : '/'}${url}`
  } catch {
    return url
  }
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function certFileType(url) {
  if (!url) return null
  const lower = url.toLowerCase().split('?')[0]
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'word'
  return 'image'
}

/* ─── DocViewer ─────────────────────────────────────────────────────────── */
function DocViewer({ file, type, caption, onClose }) {
  const src = type === 'pdf'
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(file)}&embedded=true`
    : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(file)}`

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="cert-lightbox" role="dialog" aria-modal="true" aria-label={caption || 'Document viewer'} onClick={onClose}>
      <button type="button" className="cert-lb-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="cert-doc-frame" onClick={e => e.stopPropagation()}>
        <div className="cert-doc-toolbar">
          <span className="cert-doc-label">{type === 'pdf' ? 'PDF' : 'DOC'}{caption ? ` — ${caption}` : ''}</span>
          <a href={file} target="_blank" rel="noopener noreferrer" className="cert-doc-open-tab">
            Open in new tab ↗
          </a>
        </div>
        <iframe
          src={src}
          title={caption || 'Document viewer'}
          className="cert-doc-iframe"
        />
      </div>
    </div>
  )
}

/* ─── Lightbox ─────────────────────────────────────────────────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const [fading, setFading] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef(null)
  const lbRef = useRef(null)

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }) }, [])

  const navigate = useCallback((next) => {
    resetView()
    setFading(true)
    setTimeout(() => { setIdx(next); setFading(false) }, 160)
  }, [resetView])

  const prev = useCallback(() => navigate((idx - 1 + images.length) % images.length), [idx, images.length, navigate])
  const next = useCallback(() => navigate((idx + 1) % images.length), [idx, images.length, navigate])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
      else if (e.key === '0') resetView()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [prev, next, onClose, resetView])

  // Scroll-to-zoom (non-passive so we can preventDefault)
  useEffect(() => {
    const el = lbRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      setZoom(prev => {
        const next = Math.min(Math.max(prev + (e.deltaY < 0 ? 0.25 : -0.25), 1), 5)
        if (next === 1) setPan({ x: 0, y: 0 })
        return next
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Drag-to-pan while zoomed
  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const src = e.touches ? e.touches[0] : e
      setPan({ x: src.clientX - dragOrigin.current.x, y: src.clientY - dragOrigin.current.y })
    }
    const onUp = () => setDragging(false)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [dragging])

  const handleImgPointerDown = (e) => {
    e.stopPropagation()
    if (zoom <= 1) return
    dragOrigin.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    setDragging(true)
  }

  const handleImgClick = (e) => {
    e.stopPropagation()
    if (dragging) return
    setZoom(prev => {
      if (prev > 1) { setPan({ x: 0, y: 0 }); return 1 }
      return 2.5
    })
  }

  const current = images[idx]

  return (
    <div ref={lbRef} className="cert-lightbox" role="dialog" aria-modal="true" aria-label="Certificate image viewer" onClick={onClose}>
      <button type="button" className="cert-lb-close" onClick={onClose} aria-label="Close">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {zoom > 1 && (
        <button type="button" className="cert-lb-zoom-badge" onClick={e => { e.stopPropagation(); resetView() }}>
          {Math.round(zoom * 10) / 10}× &nbsp;·&nbsp; click to reset
        </button>
      )}

      {images.length > 1 && (
        <>
          <button type="button" className="cert-lb-nav cert-lb-prev" onClick={e => { e.stopPropagation(); prev() }} aria-label="Previous">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button type="button" className="cert-lb-nav cert-lb-next" onClick={e => { e.stopPropagation(); next() }} aria-label="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}

      <div className="cert-lb-content" onClick={e => e.stopPropagation()}>
        <img
          key={idx}
          src={current.file}
          alt={current.caption || ''}
          className={`cert-lb-img${fading ? ' cert-lb-img--out' : ''}`}
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
            transition: dragging ? 'opacity 0.16s ease' : 'opacity 0.16s ease, transform 0.22s ease',
          }}
          onClick={handleImgClick}
          onMouseDown={handleImgPointerDown}
          draggable={false}
        />
        {current.caption && (
          <p className="cert-lb-caption">{current.caption}</p>
        )}
        {images.length > 1 && (
          <div className="cert-lb-dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`cert-lb-dot${i === idx ? ' cert-lb-dot--active' : ''}`}
                onClick={() => navigate(i)}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Card ──────────────────────────────────────────────────────────────── */
function CertCard({ cert, primary, accent, showFeaturedBadge }) {
  const [lightboxStart, setLightboxStart] = useState(null)
  const [viewingDoc, setViewingDoc] = useState(null)
  const [failedUrls, setFailedUrls] = useState(new Set())

  const files = (cert.files || [])
    .map(f => ({ ...f, file: normalizeUrl(f.file) }))
    .filter(f => f.file)  // skip null/empty file URLs
  // Use server-side file_type when available (Cloudinary strips extensions from URLs)
  const getType = (f) => f.file_type || certFileType(f.file)
  const imageFiles = files.filter(f => getType(f) === 'image' && !failedUrls.has(f.file))
  const docFiles   = files.filter(f => getType(f) !== 'image')
  const firstImage = imageFiles[0]

  const onImgError = (url) => setFailedUrls(prev => new Set([...prev, url]))

  return (
    <>
      {lightboxStart !== null && (
        <Lightbox images={imageFiles} startIndex={lightboxStart} onClose={() => setLightboxStart(null)} />
      )}
      {viewingDoc && (
        <DocViewer {...viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      <div className={`cert-card${showFeaturedBadge ? ' cert-card--featured' : ''}`} style={{ '--primary': primary, '--accent': accent }}>
        {/* Top row: badge + restrained inline meta tags */}
        <div className="cert-card-top">
          {/* Badge / first image thumbnail */}
          {firstImage ? (
            <button
              type="button"
              className="cert-badge-btn"
              onClick={() => setLightboxStart(0)}
              aria-label={`View ${cert.title} certificate`}
              title="Click to view certificate"
            >
              <img
                src={firstImage.file}
                alt={cert.title}
                className="cert-badge"
                onError={() => onImgError(firstImage.file)}
              />
            </button>
          ) : (
            <div className="cert-badge-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
          )}

          {(showFeaturedBadge || files.length > 1) && (
            <div className="cert-meta">
              {showFeaturedBadge && (
                <span className="cert-tag cert-tag--featured">Featured</span>
              )}
              {files.length > 1 && (
                <span className="cert-tag cert-tag--files">{files.length} files</span>
              )}
            </div>
          )}
        </div>

        {/* Text body */}
        <div className="cert-card-body">
          <h3 className="cert-title">{cert.title}</h3>
          <p className="cert-issuer">{cert.issuer}</p>
          {cert.description && <Prose className="cert-desc">{cert.description}</Prose>}
          <div className="cert-dates">
            <span>Issued {formatDate(cert.issue_date)}</span>
          </div>
          {cert.credential_id && <p className="cert-id">ID: {cert.credential_id}</p>}
        </div>

        {/* Image strip (when there are multiple images) */}
        {imageFiles.length > 1 && (
          <div className="cert-img-strip">
            {imageFiles.map((img, i) => (
              <button
                key={img.id}
                type="button"
                className="cert-strip-thumb-btn"
                onClick={() => setLightboxStart(i)}
                aria-label={img.caption ? `View ${img.caption}` : `View image ${i + 1}`}
                title={img.caption || `View image ${i + 1}`}
              >
                <img
                  src={img.file}
                  alt={img.caption || `File ${i + 1}`}
                  className="cert-strip-thumb"
                  onError={() => onImgError(img.file)}
                />
              </button>
            ))}
          </div>
        )}

        {/* Footer: single consolidated image trigger + doc triggers + verify link */}
        {(imageFiles.length > 0 || docFiles.length > 0 || safeHref(cert.credential_url)) && (
          <div className="cert-card-footer">
            {imageFiles.length > 0 && (
              <button
                type="button"
                onClick={() => setLightboxStart(0)}
                className="cert-verify-btn cert-verify-btn--btn"
              >
                {imageFiles.length > 1 ? `View Images (${imageFiles.length})` : 'View Certificate'}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            )}
            {docFiles.map(f => {
              const type = getType(f)
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setViewingDoc({ file: f.file, type, caption: f.caption })}
                  className="cert-verify-btn cert-verify-btn--btn cert-verify-btn--doc"
                >
                  {type === 'pdf' ? 'View PDF' : 'View DOC'}
                  {f.caption && <span style={{ fontWeight: 400 }}> — {f.caption}</span>}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  </svg>
                </button>
              )
            })}
            {safeHref(cert.credential_url) && (
              <a
                href={safeHref(cert.credential_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-verify-btn"
              >
                Verify Credential
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ─── Section ───────────────────────────────────────────────────────────── */
export default function Certificates({ certificates }) {
  const { theme } = useTheme()
  const { config: seasonConfig } = useSeasonContext()
  const [expanded, setExpanded] = useState(false)
  const [revealRef, visible] = useReveal()

  const orderedCerts = useMemo(() => {
    if (!certificates?.length) return []
    const featured = certificates.filter((c) => c.is_featured)
    const regular = certificates.filter((c) => !c.is_featured)
    return featured.length > 0 && featured.length < certificates.length
      ? [...featured, ...regular]
      : certificates
  }, [certificates])

  if (!orderedCerts.length) return null

  const primary = theme?.primary_color || seasonConfig?.colors?.primary || '#6366f1'
  const accent  = theme?.accent_color  || seasonConfig?.colors?.accent  || '#4da6ff'
  const bg      = theme?.background_color || seasonConfig?.colors?.background || '#fff'
  const text    = theme?.text_color    || seasonConfig?.colors?.text    || '#111'

  const featuredCount = orderedCerts.filter(c => c.is_featured).length
  const showFeaturedBadges = featuredCount > 0 && featuredCount < orderedCerts.length
  const hasMore = orderedCerts.length > INITIAL_VISIBLE
  const visibleCerts = expanded || !hasMore ? orderedCerts : orderedCerts.slice(0, INITIAL_VISIBLE)

  return (
    <section
      ref={revealRef}
      className={`certs-section pv-reveal${visible ? ' pv-reveal--visible' : ''}`}
      id="certificates"
      style={{ '--cert-primary': primary, '--cert-accent': accent, '--cert-bg': bg, '--cert-text': text }}
    >
      <div className="certs-inner">
        <div className="certs-heading">
          <div>
            <span className="pv-section-eyebrow certs-label">
              <span className="pv-section-eyebrow-num">05</span>
              <span>Credentials</span>
            </span>
            <h2 className="certs-title">Certificates &amp; Credentials</h2>
          </div>
          <span className="certs-count">
            {orderedCerts.length} {orderedCerts.length === 1 ? 'credential' : 'credentials'}
          </span>
        </div>

        <div className="certs-grid">
          {visibleCerts.map(cert => (
            <CertCard
              key={cert.id}
              cert={cert}
              primary={primary}
              accent={accent}
              showFeaturedBadge={showFeaturedBadges && Boolean(cert.is_featured)}
            />
          ))}
        </div>

        {hasMore && (
          <div className="certs-toggle-wrap">
            <button
              type="button"
              className="certs-toggle-btn"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
            >
              {expanded ? (
                <>
                  Show fewer <ChevronUp size={15} aria-hidden="true" />
                </>
              ) : (
                <>
                  Show all {orderedCerts.length} certificates <ChevronDown size={15} aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
